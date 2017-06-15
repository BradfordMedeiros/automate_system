
const createSchema = db => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all(
      `CREATE TABLE history (
        topic	TEXT,
        value	TEXT,
        timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
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
