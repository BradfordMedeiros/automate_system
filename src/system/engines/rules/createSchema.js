


/*automate_system.engines.rules.addRule({
  ruleName: 'test condition',
  condition: 'condition1',
  strategy: 'always/positive edge/negative edge',
  rate: 1000,
});*/

const createSchema = db => new Promise((resolve, reject) => {
  db.open().catch(reject).then(database => {
    // note foreign keys suck in sqlite for now, update eventually if foreign keys start not to be shit
    database.all(
      `CREATE TABLE rules_engine (
        name TEXT UNIQUE NOT NULL,
        conditionName TEXT NOT NULL, 
        strategy TEXT NOT NULL, 
        rate INTEGER NOT NULL,
        PRIMARY KEY(name),
        FOREIGN KEY (conditionName) REFERENCES conditions(name)
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


