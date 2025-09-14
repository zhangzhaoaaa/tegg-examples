export default appInfo => {
  const config: any = {};

  config.keys = appInfo.name + '_egg_tegg_schedule_sample';

  // typical security for dev
  config.security = {
    csrf: {
      enable: false,
      ignoreJSON: false,
    },
  };

  return config;
};