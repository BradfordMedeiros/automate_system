
const createSchema = db => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all(
      `CREATE TABLE action_engine (
        name TEXT UNIQUE NOT NULL,
        topic	TEXT NOT NULL,
        script	TEXT NOT NULL,
        toTopic TEXT,
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

