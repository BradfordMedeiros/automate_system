
const fs = require('fs');
const createActionSchema = require('../system/base/actions/createSchema');
const createStateSchema = require('../system/base/states/createSchema');
const createEventSchema = require('../system/base/events/createSchema');
const createConditionSchema = require('../system/base/conditions/createSchema');
const createStateEngineSchema = require('../system/engines/states/createSchema');
const createSequenceEngineSchema = require('../system/engines/sequence/createSchema');

const getDatabase = require('../getDatabase');
const sequencer = require('when_do').sequencer;

const migrate = db => {
  return new Promise((resolve, reject) => {
    sequencer()
      .hold(() => createActionSchema(db))
      .hold(() => createStateSchema(db))
      .hold(() => createEventSchema(db))
      .hold(() => createConditionSchema(db))
      .hold(() => createStateEngineSchema(db))
      .hold(() => createSequenceEngineSchema(db))
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
