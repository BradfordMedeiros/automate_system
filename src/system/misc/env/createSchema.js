
const createSchema = db => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all(
      `CREATE TABLE env (
        name	TEXT NOT NULL,
        value	TEXT NOT NULL
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
