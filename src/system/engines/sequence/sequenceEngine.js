
let sequences = { };

const getSequencesFromDb = db => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all('SELECT * FROM sequence_engine', (err, actions) => {
      database.close();
      if (err){
        reject(err);
      }else{
        resolve(actions);
      }
    });
  });
});

const saveSequenceToDb = (db,sequenceName, sequenceParts) => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    const query = `INSERT OR REPLACE INTO sequence_engine (name, parts) values ('${sequenceName}', '${JSON.stringify(sequenceParts)}')`;
    console.log('query: ', query);
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

const addSequence = (db, sequenceName, sequenceParts) => {
  sequences[sequenceName] = {
    name: sequenceName,
    sequenceParts,
  }
  return saveSequenceToDb(db, sequenceName, sequenceParts);
};

const deleteSequence = (db, sequenceName) => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all(`DELETE FROM sequence_engine WHERE name = ('${sequenceName}')`, (err) => {
      database.close();
      delete sequences[sequenceName];
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  });
});

const loadSequences = (db) => new Promise((resolve, reject) => {
  getSequencesFromDb(db).catch(reject).then(sequences => {
    sequences.forEach(sequence => {
      addSequence(db, sequence.name, JSON.parse(sequence.parts));
    });
    resolve();
  });
});

const getSequences = () => Object.keys(sequences).map(sequence => sequences[sequence]);

module.exports = {
  addSequence,
  deleteSequence,
  getSequences,
  loadSequences,
};
