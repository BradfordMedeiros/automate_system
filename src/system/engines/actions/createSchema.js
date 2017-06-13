
const createSchema = db => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all(
      `CREATE TABLE action_engine (
        name TEXT UNIQUE,
        topic	TEXT,
        value	TEXT,
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

