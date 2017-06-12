
const fs = require('fs');
const createStateSchema = require('./system/states/createSchema');
const createActionSchema = require('./system/actions/createSchema');
const getDatabase = require('./getDatabase');

const migrate = db =>  Promise.all([createStateSchema(db), createActionSchema(db)]);

const isMigrated =  databaseName => {
 return fs.existsSync(databaseName);
};

const migrateDb = {
  isMigrated: isMigrated,
  createDb: databaseName => migrate(getDatabase(databaseName)),
};

module.exports = migrateDb;
