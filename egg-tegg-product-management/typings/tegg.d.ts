declare module '@eggjs/tegg' {
  export interface SingletonProtoOptions {
    accessLevel?: AccessLevel;
    name?: string;
  }

  export enum AccessLevel {
    PUBLIC = 'public',
    PRIVATE = 'private'
  }

  export enum HTTPMethodEnum {
    GET = 'GET',
    POST = 'POST',
    PUT = 'PUT',
    DELETE = 'DELETE',
    PATCH = 'PATCH',
    HEAD = 'HEAD',
    OPTIONS = 'OPTIONS'
  }

  export interface EggContext {
    request: any;
    response: any;
    body: any;
    query: any;
    params: any;
    headers: any;
    status: number;
    cookies: any;
    session: any;
    state: any;
    app: any;
    service: any;
    helper: any;
    logger: any;
    [key: string]: any;
  }

  export interface Context extends EggContext {}

  export interface HTTPControllerOptions {
    path?: string;
  }

  export interface HTTPMethodOptions {
    method: HTTPMethodEnum;
    path?: string;
  }

  export function SingletonProto(options?: SingletonProtoOptions): ClassDecorator;
  export function Inject(): PropertyDecorator;
  export function HTTPController(options?: HTTPControllerOptions): ClassDecorator;
  export function HTTPMethod(options: HTTPMethodOptions): MethodDecorator;
  export function HTTPBody(): ParameterDecorator;
  export function HTTPParam(): ParameterDecorator;
  export function HTTPQuery(): ParameterDecorator;
  export function Context(): ParameterDecorator;
}

declare module '@eggjs/tegg-orm-decorator' {
  export interface AttributeOptions {
    primary?: boolean;
    allowNull?: boolean;
    unique?: boolean;
    defaultValue?: any;
    autoIncrement?: boolean;
    type?: any;
  }

  export interface ModelOptions {
    dataSource?: string;
    tableName?: string;
  }

  export function Model(options?: ModelOptions): ClassDecorator;
  export function Attribute(type?: any, options?: AttributeOptions): PropertyDecorator;
}