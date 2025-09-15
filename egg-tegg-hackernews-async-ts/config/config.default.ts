export default () => {
  const config: any = {};

  // cookie keys (示例给固定值即可)
  config.keys = 'egg-tegg-hackernews-async-ts';

  // 视图配置：使用 nunjucks 渲染 .tpl
  config.view = {
    defaultViewEngine: 'nunjucks',
    mapping: {
      '.tpl': 'nunjucks',
    },
  };

  // 安全：示例场景关闭 csrf，便于调试
  config.security = {
    csrf: {
      enable: false,
    },
  };

  // 代理：Hacker News API 域名（可按需设置代理）
  config.news = {
    baseUrl: 'https://hacker-news.firebaseio.com/v0',
    pageSize: 30,
    timeout: 5000,
  };

  return config;
};