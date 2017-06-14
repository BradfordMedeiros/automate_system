
let stateScripts = { };

/*const getSequencesFromDb = db => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all('SELECT * FROM state_engine', (err, actions) => {
      database.close();
      if (err){
        reject(err);
      }else{
        resolve(actions);
      }
    });
  });
});*/

// [  { type: <> , value: < > } ]
const saveSequenceToDb = (db, sequenceName, sequenceParts ) => new Promise((resolve, reject) => {
  deleteSequenceTable(db, sequenceName).catch(reject).then(() => {
    createSequenceTable(db, sequenceName).catch(reject).then(() => {
      addActionsToSequenceTable(db, sequenceName, sequenceParts).catch(reject).then(resolve);
    });
  });
});

const deleteSequenceTable = (db, sequenceName) => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    const query = `DROP TABLE IF EXISTS sequence_${sequenceName};`;
    database.run(query, (err) => {
      database.close();
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  });
});

const createSequenceTable = (db, sequenceName) => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    const query = `CREATE TABLE sequence_${sequenceName} (type	TEXT, value	TEXT);`;
    database.run(query, (err) => {
      database.close();
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  });
});

const runStatement = (stmt, action) => {
  return new Promise((resolve, reject) => {
    stmt.run(action.type, action.value, (err) => {
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  });
}

const addActionsToSequenceTable = (db, sequenceName, actions) => new Promise((resolver, reject) => {
  db.open().catch(reject).then(database => {
    const stmt = database.prepare(`INSERT OR REPLACE INTO sequence_${sequenceName} (type, value) values (?, ?)`)
    Promise.all(actions.map(action => runStatement(stmt, action))).catch(() => {
      stmt.finalize();
      database.close();
      reject();
    }).then(() => {
      stmt.finalize();
      database.close();
      resolver();
    });
  });
});


const createSequence = (db, sequenceName, sequenceParts ) => {
  return saveSequenceToDb(db, sequenceName, sequenceParts);
};


/*const transformStateScriptToString = (conditionString) => {
  const evalString = `({ getStates }) => {
    ${conditionString}
  }`;
  return eval(evalString);
};*/


/*const addStateScript = (db,  stateScriptName, topic, eval ) => {
  let handle = undefined;

  const evalFunction = () => transformStateScriptToString(eval)({  });
  stateScripts[stateScriptName] = {
    name: stateScriptName,
    topic,
    eval: evalFunction,
    run: publish => {
      if (typeof(publish) !== 'function'){
        throw (new Error('Publish must be function'));
      }
      handle = setInterval(() => {
        const value = evalFunction();
        publish(topic, value.toString());
      }, 1000);
    },
    stop: () => clearInterval(handle),
  };
  saveStateScriptToDb(db, stateScriptName, topic, eval);
}; */

/*const deleteStateScript = (db, stateScriptName) => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all(`DELETE FROM state_engine WHERE name = ('${stateScriptName}')`, (err) => {
      database.close();
      stateScripts[stateScriptName].stop();
      delete stateScripts[stateScriptName];
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  });
});*/

/*const loadStateScripts = (db) => new Promise((resolve, reject) => {
  getStateScriptsFromDb(db).catch(reject).then(stateScripts => {
    stateScripts.forEach(stateScriptData => {
      addStateScript(db,stateScriptData.name, stateScriptData.eval);
    });
    resolve();
  });
});*/

const getStateScripts = () => Object.keys(stateScripts).map(script => stateScripts[script]);

module.exports = {
  //addStateScript,
  //deleteStateScript,
  //getStateScripts,
  //loadStateScripts,
  createSequenceTable,
  deleteSequenceTable,
  createSequence,
};
