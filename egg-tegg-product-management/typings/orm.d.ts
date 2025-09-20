// ORM Model Base Types
interface ModelStatic<T = any> {
  new (): T;
  create(data: Partial<T>): Promise<T>;
  findOne(options?: any): Promise<T | null>;
  find(options?: any): Promise<T[]>;
  update(data: Partial<T>, options?: any): Promise<T>;
  remove(options?: any): Promise<boolean>;
}

// Leoric ORM types
declare module 'leoric' {
  export class Bone {
    static find(conditions?: any): QueryBuilder;
    static findOne(conditions?: any): Promise<any>;
    static create(data: any): Promise<any>;
    static update(conditions: any, data: any): Promise<any>;
    static remove(conditions: any): Promise<any>;
    static count(conditions?: any): Promise<number>;
    static order(column: string, direction?: 'asc' | 'desc'): QueryBuilder;
    static limit(count: number): QueryBuilder;
    static offset(count: number): QueryBuilder;
    static where(conditions: any): QueryBuilder;
  }

  export interface QueryBuilder {
    count(): Promise<number>;
    order(column: string, direction?: 'asc' | 'desc'): QueryBuilder;
    limit(count: number): QueryBuilder;
    offset(count: number): QueryBuilder;
    where(conditions: any): QueryBuilder;
    then<T>(onfulfilled?: (value: any[]) => T | PromiseLike<T>, onrejected?: (reason: any) => T | PromiseLike<T>): Promise<T>;
  }

  export const DataTypes: {
    STRING: any;
    INTEGER: any;
    DATE: any;
    BOOLEAN: any;
    TEXT: any;
    DECIMAL: any;
    FLOAT: any;
    DOUBLE: any;
    JSON: any;
    JSONB: any;
    UUID: any;
    ENUM: any;
  };
}