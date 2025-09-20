// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportPkgController from '../../../app/controller/PkgController';

declare module 'egg' {
  interface IController {
    pkgController: ExportPkgController;
  }
}
