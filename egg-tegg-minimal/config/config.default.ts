export default () => {
  const config: any = {};

  // 必填：用于 cookie 签名，示例环境给个固定值即可
  config.keys = 'egg-tegg-minimal';

  // tegg-controller 默认返回 JSON
  return config;
};