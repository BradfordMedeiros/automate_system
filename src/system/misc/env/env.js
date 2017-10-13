let env = { };

const getEnvFromDb = db => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all('SELECT * FROM env', (err, states) => {
      if (err){
        reject(err);
      }else{
        resolve(states);
      }
    });
  }).catch(reject);
});

const saveEnvToDb = (db, name, value) => new Promise((resolve, reject) => {
  db.open().then(database => {
    database.all(`INSERT OR REPLACE INTO env (name, value) values ('${name}','${value}')`, (err) => {
      if (err){
        reject(err);
      }else{
        resolve();
      }
    });
  }).catch(reject);
});


const setEnv = (db, name, value) => new Promise((resolve, reject) => {
  env[name] = value;
  saveEnvToDb(db, name, value).then(resolve).catch(reject);
});

const loadEnv = db => new Promise((resolve, reject) => {
  getEnvFromDb(db).then(envs => {
    envs.forEach(variable => {
      env[variable.name] = variable.value;
    });
    resolve();
  }).catch(reject);
});


const getEnv = () => env;

module.exports = {
  setEnv,
  getEnv,
  loadEnv,
};
