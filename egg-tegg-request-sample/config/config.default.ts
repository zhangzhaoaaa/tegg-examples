export default () => {
  const config: any = {};

  // 必填：用于 cookie 签名
  config.keys = 'egg-tegg-request-sample';

  // 注册全局中间件
  config.middleware = [
    'requestTime',
  ];

  return config;
};