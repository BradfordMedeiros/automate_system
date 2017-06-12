
const sqlite3 = require('sqlite3');

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