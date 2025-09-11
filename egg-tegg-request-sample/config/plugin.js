'use strict';
const path = require('path');

exports.tegg = {
  package: '@eggjs/tegg-plugin',
  enable: true,
};

exports.teggController = {
  package: '@eggjs/tegg-controller-plugin',
  enable: true,
};

exports.teggConfig = {
  package: '@eggjs/tegg-config',
  enable: true,
};

// Enable AOP plugin to wire Crosscut/Pointcut
exports.aopModule = {
  package: '@eggjs/tegg-aop-plugin',
  enable: true,
};