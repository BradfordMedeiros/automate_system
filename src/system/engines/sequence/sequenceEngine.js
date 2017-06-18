const createSequence = require('./createSequence');

let actionGetter = () => {
  throw (new Error("Get states never set: Were conditions loaded?"));
};

let getActions = () => actionGetter();

let sequences = { };

const getSequencesFromDb = db => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all('SELECT * FROM sequence_engine', (err, sequences) => {
      if (err){
        reject(err);
      }else{
        resolve(sequences);
      }
    });
  }).catch(reject);
});

const saveSequenceToDb = (db,sequenceName, sequenceParts) => new Promise((resolve, reject) => {
  db.open().then(database => {
    const query = `INSERT OR REPLACE INTO sequence_engine (name, parts) values ('${sequenceName}', '${JSON.stringify(sequenceParts)}')`;
    database.run(query, (err) => {
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});

const addSequence = (db, sequenceName, sequenceParts) => {
  console.log('get actions: ', getActions);
  sequences[sequenceName] = {
    name: sequenceName,
    run: () => createSequence(sequenceParts, getActions).run(),
  };
  return saveSequenceToDb(db, sequenceName, sequenceParts);
};

const deleteSequence = (db, sequenceName) => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.run(`DELETE FROM sequence_engine WHERE name = ('${sequenceName}')`, (err) => {
      delete sequences[sequenceName];
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});

const loadSequences = (db, getActionsFunc) => new Promise((resolve, reject) => {
  getActions = getActionsFunc;
  getSequencesFromDb(db).then(loadedSequences => {
    console.log('loaded sequences: ', loadedSequences);
    loadedSequences.forEach(sequence => {
      addSequence(db, sequence.name, JSON.parse(sequence.parts));
    })
    resolve();
  }).catch(reject);
});

const getSequences = () => sequences;

module.exports = {
  addSequence,
  deleteSequence,
  getSequences,
  loadSequences,
};
