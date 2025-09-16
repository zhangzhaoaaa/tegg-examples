export default appInfo => {
  const config: any = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_egg_tegg_todomvc';

  // add your config here
  config.static = {
    prefix: '/',
    dir: 'app/public',
  };

  // ORM config: SQLite example
  // See @eggjs/tegg-orm-plugin DataSourceManager for supported fields
  config.orm = {
    client: 'sqlite3',
    dialect: 'sqlite',
    database: './run/todos.sqlite',
    define: {
      underscored: true,
      timestamps: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    },
    delegate: 'model',
    baseDir: 'model',
    migrations: 'database',
  };

  return config;
};