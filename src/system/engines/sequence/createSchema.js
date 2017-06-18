
const createSchema = db => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all(
      `CREATE TABLE sequence_engine (
        name TEXT UNIQUE NOT NULL,
        parts TEXT NOT NULL,
        PRIMARY KEY(name)
      );`, (err) => {
        if (err){
          reject(err);
        }else{
          resolve();
        }
      });
  }).catch(reject);
});

module.exports = createSchema;

