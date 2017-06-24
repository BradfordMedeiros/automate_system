const createSequence = require('./createSequence');

let mqttClientGetter = () => {
  throw (new Error("getMqttClient never set: Was sequence engine loaded?"));
};

let getMqttClient = () => mqttClientGetter();

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
  if (typeof(sequenceName) !== typeof('')){
    throw (new Error('engines:sequenceEngine:addSequence sequenceName must be a string'));
  }

  if (!createSequence.isValidParts(sequenceParts)){
    throw (new Error('engines:sequenceEngine:addSequence sequenceParts format is invalid'));

  }
  sequences[sequenceName] = {
    name: sequenceName,
    run: () => createSequence.create(sequenceParts, mqttClientGetter).run(),
  };
  return saveSequenceToDb(db, sequenceName, sequenceParts);
};

const deleteSequence = (db, sequenceName) => new Promise((resolve, reject) => {
  if (typeof(sequenceName) !== typeof('')){
    throw (new Error('engines:sequenceEngine:addSequence seuqenceName must be a string'));
  }

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

const loadSequences = (db, getMqttClient) => new Promise((resolve, reject) => {
  mqttClientGetter =  getMqttClient;
  getSequencesFromDb(db).then(loadedSequences => {
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
