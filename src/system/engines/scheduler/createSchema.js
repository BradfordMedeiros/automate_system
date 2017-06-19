
const createSchema = db => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all(
      `CREATE TABLE scheduler_engine (
        name TEXT UNIQUE NOT NULL,
        topic TEXT NOT NULL,
        schedule TEXT NOT NULL,
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


