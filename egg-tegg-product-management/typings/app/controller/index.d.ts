// This file is created by egg-ts-helper@2.1.1
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportAuthController from '../../../app/controller/AuthController';
import ExportCartController from '../../../app/controller/CartController';
import ExportHealthController from '../../../app/controller/HealthController';
import ExportHomeController from '../../../app/controller/HomeController';
import ExportOrderController from '../../../app/controller/OrderController';
import ExportProductController from '../../../app/controller/ProductController';
import ExportUserController from '../../../app/controller/UserController';

declare module 'egg' {
  interface IController {
    authController: ExportAuthController;
    cartController: ExportCartController;
    healthController: ExportHealthController;
    homeController: ExportHomeController;
    orderController: ExportOrderController;
    productController: ExportProductController;
    userController: ExportUserController;
  }
}
