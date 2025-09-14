export default appInfo => {
  const config: any = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_egg_tegg_orm_pg';

  // https://github.com/eggjs/egg/issues/2624
  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: false,
    },
  };

  // Enable JSON response by tegg-controller
  config.tegg = {
    controller: {
      response: {
        json: true,
      },
    },
  };

  // ORM config: PostgreSQL example
  // See @eggjs/tegg-orm-plugin DataSourceManager for supported fields
  config.orm = {
    datasources: [
      {
        client: 'pg',
        dialect: 'pg',
        database: process.env.PGDATABASE || 'tegg',
        host: process.env.PGHOST || '127.0.0.1',
        port: Number(process.env.PGPORT || 5432),
        user: 'postgres',
        password: 'postgres',
        define: { underscored: true },
        delegate: 'model',
        baseDir: 'model',
        migrations: 'database',
      },
    ],
  };

  return config;
};