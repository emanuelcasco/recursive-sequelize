/* eslint-disable no-console */
const fs = require('fs');
const { resolve } = require('path');
const { promisify } = require('util');

const Sequelize = require('sequelize');
const applyHierarchyPlugin = require('sequelize-hierarchy');

applyHierarchyPlugin(Sequelize);
const sequelize = new Sequelize.Sequelize('postgres://postgres:postgres@localhost:5432/recursive-research');

const asyncWriteFile = promisify(fs.writeFile);
const saveEvidence = (file, evidence) =>
  asyncWriteFile(resolve(__dirname, '../results', file), JSON.stringify(evidence, null, 2));

const Node = sequelize.define(
  'Node',
  {
    id: { type: Sequelize.DataTypes.BIGINT, primaryKey: true, autoIncrement: true },
    name: { type: Sequelize.DataTypes.STRING }
  },
  {
    tableName: 'nodes',
    name: 'node',
    underscored: true
  }
);
Node.isHierarchy({ camelThrough: true, throughTable: 'node_ancestors', onDelete: 'CASCADE' });

function NodeFactoryByParent(parent = {}, sublevel = 0) {
  const id = `${parent.id || 1}${sublevel}`;
  const parent_id = parent.id || null;
  const hierarchy_level = parent.hierarchy_level ? parent.hierarchy_level + 1 : 1;
  const name = `level:${hierarchy_level}__${id}`;
  return { id, hierarchy_level, name, parent_id };
}

function generateChildren(node, quantity = 2) {
  const children = [];
  let i = quantity;
  while (i > 0) {
    children.push(NodeFactoryByParent(node, i));
    i--;
  }
  return children;
}

function generateChildrenList(nodes, length) {
  return nodes.reduce((accum, node) => [...accum, ...generateChildren(node, length)], []);
}

function generateGraphWithNLevels(maxLevel, length) {
  const base = NodeFactoryByParent();

  async function exploteNodes(raw, index = 1) {
    const parents = await Node.bulkCreate(raw, { logging: false, returning: true });
    console.log(`Created ${parents.length} nodes`);
    if (index <= maxLevel) {
      const children = generateChildrenList(parents, length);
      return [...parents, ...exploteNodes(children, index + 1)];
    }
    return parents;
  }
  return exploteNodes([base]);
}

async function populateDatabase(levels, children) {
  await sequelize.models.Node.sync({ force: true });
  await sequelize.models.NodeAncestor.sync({ force: true });

  const graph = await generateGraphWithNLevels(levels, children);
  console.log(`Created total ${graph.length} nodes!!`);
}

async function searchQuery() {
  const nodes = await Node.findAll({
    where: {
      name: {
        [Sequelize.Op.iLike]: '%level:4%'
      }
    }
  });
  await saveEvidence('searchQuery.json', nodes);
}

async function findAll() {
  const nodes = await Node.findAll({
    hierarchy: true
  });
  await saveEvidence('findAll.json', nodes);
}

async function findNodeAndDescendents() {
  const node = await Node.findOne({
    where: { id: 10412 },
    include: [
      {
        model: Node,
        as: 'descendents',
        hierarchy: true
      }
    ]
  });
  await saveEvidence('findNodeAndDescendents.json', node);
}

async function findNodeAndAncestors() {
  const node = await Node.findOne({
    where: { id: 10412 },
    include: [
      {
        model: Node,
        as: 'ancestors'
      }
    ]
  });
  await saveEvidence('findNodeAndAncestors.json', node);
}

module.exports = {
  Node,
  sequelize,
  Sequelize,
  populateDatabase,
  searchQuery,
  findAll,
  findNodeAndDescendents,
  findNodeAndAncestors
};
