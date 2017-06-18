
const createSchema = db => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all(
      `CREATE TABLE events (
        topic	TEXT,
        value	TEXT,
        timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
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
