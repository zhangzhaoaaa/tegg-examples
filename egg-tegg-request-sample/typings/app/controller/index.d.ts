// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportDemoController from '../../../app/controller/DemoController';

declare module 'egg' {
  interface IController {
    demoController: ExportDemoController;
  }
}
