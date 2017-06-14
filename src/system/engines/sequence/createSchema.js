/*

    Each sequence -->
      - sequence_sequence_name
      - type: 'action'  value: actionName --> foreign key (on cascade delete)

   sequences:
      sequence_name
 */


const createSchema = db => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    database.all(
      `CREATE TABLE sequence_engine (
        name TEXT UNIQUE,
        parts TEXT,
        PRIMARY KEY(name)
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

