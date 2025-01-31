module.exports = {
  apps: [
    {
      script: 'main.js',
      name: 'panicblaster_qa',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        DB_USERNAME: 'postgres',
        DB_PASSWORD: 'APasswordIsBetterThanNone',
        DB_NAME: 'panicblaster_qa',
      },
      port: 3001,
      instances: 1,
    },
  ],
};
