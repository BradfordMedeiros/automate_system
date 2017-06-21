const migrate = require('../../environment/migrate');


const migrateSystem = (resourceFile, verbose) => {
  return new Promise((resolve, reject) => {
    if (!migrate.isMigrated(resourceFile)){
      if (verbose){
        console.log('Migration: Not yet migrated');
      }
      migrate.createDb(resourceFile).then(() => {
        if (verbose){
          console.log("Migration: Successful");
        }
        resolve();
      }).catch(err => {
        if (verbose){
          console.log("Migration: Failure");
        }
        reject(err);
      });
    }else{
      if (verbose){
        console.log('Migration: Success - Already migrated');
      }
      resolve();
    }
  });
};

module.exports = migrateSystem;