
const createSchema = db => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all(
      `CREATE TABLE state_engine (
        name TEXT UNIQUE,
        topic	TEXT,
        eval	TEXT,
        PRIMARY KEY(name)
      );`, (err) => {
        database.close();
        if (err){
          reject(err);
        }else{
          resolve();
        }
      });
  });
});

module.exports = createSchema;
