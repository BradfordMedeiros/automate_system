
const createSchema = db => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all(
      `CREATE TABLE state_engine (
        name TEXT UNIQUE NOT NULL,
        topic	TEXT NOT NULL,
        eval	TEXT NOT NULL,
        rate NUMBER NOT NULL,
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

