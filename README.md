# Sequelize recursive joins research

For this research we used [sequelize-hierarchy](https://www.npmjs.com/package/sequelize-hierarchy) which provides support for recursive queries on Sequelize. It's not necessary to use it on the project, the strategy it uses to build the graph is pretty simple (ManyToMany relation) and the only additional functionality it provides is creating the nested objects.

## Installation

### Dependencies

```
npm install
```

### Database setup

Before running the app, make sure you have [postgresql installed](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-14-04) and the database created.

To create it run the following steps inside a `psql` terminal:

```
1. `CREATE DATABASE db_project_name;`
2. `\c db_project_name`
3. `CREATE ROLE "project_name" LOGIN CREATEDB PASSWORD 'project_name';`
```

You need to change postgres url directly on `./db/index` where is hardcoded as:

```
postgres://postgres:postgres@localhost:5432/recursive-research
```

### Populate database

Your database needs data, to populate it you can use script: `npm run scripts::populateDatabase L C`, where `L` represents how many levels your graph will have and `C` represents how much children each parent has.

> For example: with L=6 and C=4 we are going to generate more than 5K records as total and more than 4K leafs (4^6 = 4096)

### Run scripts

Run `scripts::findNodeAndAncestors` to find a node and its ancestors until the root.

Run `scripts::findNodeAndDescendents` to find a node and its descendents until the root.

Run `scripts::findAll` to find all nodes.

Run `scripts::searchQuery` to execute a query to all records filtering by name.