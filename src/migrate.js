
const fs = require('fs');
const createActionSchema = require('./system/actions/createSchema');
const createStateSchema = require('./system/states/createSchema');
const createEventSchema = require('./system/events/createSchema');
const getDatabase = require('./getDatabase');

const migrate = db =>  Promise.all([ createActionSchema(db), createStateSchema(db), createEventSchema(db)]);

const isMigrated =  databaseName => {
 return fs.existsSync(databaseName);
};

const migrateDb = {
  isMigrated: isMigrated,
  createDb: databaseName => migrate(getDatabase(databaseName)),
};

module.exports = migrateDb;
