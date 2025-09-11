export default () => {
  const config: any = {};

  // 本地联调临时关闭 CSRF（仅本地环境生效）
  config.security = {
    csrf: {
      enable: false,
    },
  };

  return config;
};