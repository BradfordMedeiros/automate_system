
const fs = require('fs');
const createActionSchema = require('./system/actions/createSchema');
const createStateSchema = require('./system/states/createSchema');
const createEventSchema = require('./system/events/createSchema');
const createConditionSchema = require('./system/conditions/createSchema');

const getDatabase = require('./getDatabase');
const sequencer = require('when_do').sequencer;

const migrate = db => {
  return new Promise((resolve, reject) => {
    sequencer()
      .hold(() => createActionSchema(db))
      .hold(() => createStateSchema(db))
      .hold(() => createEventSchema(db))
      .hold(() => createConditionSchema(db))
      .run()
      .catch(reject)
      .then(resolve);
  })
};

const isMigrated =  databaseName => {
 return fs.existsSync(databaseName);
};

const migrateDb = {
  isMigrated: isMigrated,
  createDb: databaseName => migrate(getDatabase(databaseName)),
};

module.exports = migrateDb;
