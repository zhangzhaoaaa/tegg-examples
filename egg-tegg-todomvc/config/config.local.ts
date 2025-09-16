export default () => {
  const config: any = {};

  // 本地开发便于前端请求，关闭 CSRF，仅限本地
  config.security = {
    csrf: {
      enable: false,
    },
  };

  return config;
};