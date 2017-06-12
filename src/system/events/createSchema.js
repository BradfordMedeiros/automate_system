
const createSchema = db => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all(
      `CREATE TABLE events (
        topic	TEXT,
        value	TEXT
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
