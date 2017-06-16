
const createSchema = db => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all(
      `CREATE TABLE actions (
        topic	TEXT UNIQUE NOT NULL,
        value	TEXT NOT NULL,
        PRIMARY KEY(topic)
      );`, (err) => {
      //database.close();
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});

module.exports = createSchema;