
const createSchema = db => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all(
      `CREATE TABLE actions (
        TOPIC	TEXT UNIQUE,
        VALUE	TEXT,
        PRIMARY KEY(TOPIC)
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