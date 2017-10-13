const env = require('./env/env');

const loadMisc = db => {
  const miscLoaded = env.loadEnv(db);

  return new Promise((resolve, reject) => {
    miscLoaded.then(() => {
      const misc = {
        env: {
          setEnv: (name, value) =>  env.setEnv(db, name, value),
          getEnv: env.getEnv,
        },
      };
      resolve(misc);
    }).catch(reject);
  });
};

module.exports = loadMisc;
