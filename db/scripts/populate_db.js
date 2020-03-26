/* eslint-disable no-console */
const { populateDatabase } = require('../index');

(async function populateDatabaseScript() {
  const levels = process.argv[2];
  const children = process.argv[3];
  console.log(`Populating: ${levels} levels and ${children} children per parent`);
  await populateDatabase(levels, children);
})();
