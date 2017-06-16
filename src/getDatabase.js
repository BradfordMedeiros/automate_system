
const sqlite3 = require('sqlite3');

const turnOnForeignKeys = db => {
  return new Promise((resolve, reject) => {
    db.open().catch(reject).then(database => {
      database.run(
        `PRAGMA foreign_keys = ON;`
        , (err) => {
          database.close();
          if (err){
            reject(err);
          }else{
            resolve();
          }
        });
    });
  })
};

const getDatabase = databaseName => ({
  open: () => new Promise((resolve, reject) => {
    const db  = new sqlite3.Database(databaseName, (err) => {
      if (err){
        reject(err);
      }else{
        resolve(db)
      }
    })
  })
});


module.exports = getDatabase;