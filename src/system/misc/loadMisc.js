const env = require('./env/env');

const loadMisc = db => {
  const miscLoaded = env.loadEnv(db);

  return new Promise((resolve, reject) => {
    miscLoaded.then(() => {
      const misc = {
        env: {
          getEnv: env.getEnv,
          deleteEnv: (name, value) => env.deleteEnv(db, name, value),
          setEnv: (name, value) =>  env.setEnv(db, name, value),
        },
      };
      resolve(misc);
    }).catch(reject);
  });
};

module.exports = loadMisc;
