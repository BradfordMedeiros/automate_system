
const createSchema = db => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all(
      `CREATE TABLE conditions (
        name TEXT NOT NULL,
        eval TEXT NOT NULL,
        PRIMARY KEY(name)
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