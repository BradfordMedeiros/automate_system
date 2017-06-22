
const sqlite3 = require('sqlite3');
const process = require('process');

let connection;

const getDatabase = databaseName => ({
  open: () => new Promise((resolve, reject) => {
    if (connection){
      resolve(connection);
    }else{
      connection = new sqlite3.Database(databaseName, (err) => {
        if (err){
          reject(err);
        }else{
          resolve(connection)
        }
      })
    }
  }),
  close: () => {
    if (connection){
      connection.close();
      connection = undefined;
    }
  },
});


module.exports = getDatabase;