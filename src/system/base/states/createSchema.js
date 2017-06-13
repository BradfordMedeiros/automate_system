
const createSchema = db => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all(
      `CREATE TABLE states (
        topic	TEXT UNIQUE,
        value	TEXT,
        PRIMARY KEY(topic)
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
