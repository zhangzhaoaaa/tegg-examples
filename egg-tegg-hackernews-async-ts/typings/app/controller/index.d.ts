// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportNewsController from '../../../app/controller/NewsController';

declare module 'egg' {
  interface IController {
    newsController: ExportNewsController;
  }
}
