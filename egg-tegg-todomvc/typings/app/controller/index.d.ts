// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportTodoController from '../../../app/controller/TodoController';

declare module 'egg' {
  interface IController {
    todoController: ExportTodoController;
  }
}
