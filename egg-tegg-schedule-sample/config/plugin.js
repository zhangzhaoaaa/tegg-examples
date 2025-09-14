'use strict';
const path = require('path');

exports.tegg = {
  package: '@eggjs/tegg-plugin',
  enable: true,
};

exports.teggConfig = {
  package: '@eggjs/tegg-config',
  enable: true,
};

exports.schedule = {
  package: 'egg-schedule',
  enable: true,
};

exports.teggSchedule = {
  package: '@eggjs/tegg-schedule-plugin',
  enable: true,
};