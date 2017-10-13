const fs = require('fs');
const createActionSchema = require('../system/base/actions/createSchema');
const createStateSchema = require('../system/base/states/createSchema');
const createConditionSchema = require('../system/base/conditions/createSchema');

const createStateScriptEngineSchema = require('../system/engines/stateScripts/createSchema');
const createActionScriptEngineSchema = require('../system/engines/actionScripts/createSchema');
const createSequenceEngineSchema = require('../system/engines/sequence/createSchema');
const createRuleEngineSchema = require('../system/engines/rules/createSchema');
const createSchedulerEngineSchema = require('../system/engines/scheduler/createSchema');

const createEventSchema = require('../system/logging/events/createSchema');
const createHistorySchema = require('../system/logging/history/createSchema');
const createEnvSchema = require('../system/misc/createSchema');

const getDatabase = require('../getDatabase');
const sequencer = require('when_do').sequencer;

const migrate = db => {
  return new Promise((resolve, reject) => {
    sequencer()
      .hold(() => createActionSchema(db))
      .hold(() => createStateSchema(db))
      .hold(() => createEventSchema(db))
      .hold(() => createConditionSchema(db))
      .hold(() => createStateScriptEngineSchema(db))
      .hold(() => createActionScriptEngineSchema(db))
      .hold(() => createSequenceEngineSchema(db))
      .hold(() => createRuleEngineSchema(db))
      .hold(() => createSchedulerEngineSchema(db))
      .hold(() => createHistorySchema(db))
      .hold(() => createEnvSchema(db))
      .run()
      .then(resolve)
      .catch(reject);
  })
};

const isMigrated =  databaseName => {
 return fs.existsSync(databaseName);
};

const migrateDb = {
  isMigrated: isMigrated,
  createDb: databaseName => new Promise((resolve, reject) => {
    migrate(getDatabase(databaseName)).then(() => {
      getDatabase(databaseName).close();
      resolve();
    }).catch(() => {
      getDatabase(databaseName).close();
      reject();
    })
  })
};

module.exports = migrateDb;
