declare module '@eggjs/tegg-orm-decorator' {
  import type { DataType } from 'leoric';

  export interface AttributeOptions {
    allowNull?: boolean;
    primary?: boolean;
    unique?: boolean;
    autoIncrement?: boolean;
  }
  export function Attribute(
    dataType: DataType,
    options?: AttributeOptions
  ): (target: any, propertyKey: PropertyKey) => void;

  export interface ModelParams {
    dataSource?: string;
    tableName?: string;
    indices?: any[];
  }
  export function Model(param?: ModelParams): ClassDecorator;
}