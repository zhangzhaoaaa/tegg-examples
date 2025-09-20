import { Attribute, Model } from '@eggjs/tegg-orm-decorator';
import { Bone, DataTypes } from 'leoric';

export enum OrderStatus {
  PENDING = 'pending',
  PAID = 'paid',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Model({
  dataSource: 'product',
  tableName: 'orders',
})
export class Order extends Bone {
  @Attribute(DataTypes.INTEGER as any, { primary: true })
  id: number;

  @Attribute(DataTypes.INTEGER as any, { allowNull: false })
  user_id: number;

  @Attribute(DataTypes.JSON as any, { allowNull: false })
  items: Array<{
    product_id: number;
    title: string;
    quantity: number;
    price: number;
  }>;

  @Attribute(DataTypes.DECIMAL as any, { allowNull: true })
  total: number;

  @Attribute(DataTypes.STRING as any, { allowNull: false })
  status: OrderStatus;

  @Attribute(DataTypes.TEXT as any, { allowNull: true })
  notes: string;

  @Attribute(DataTypes.DATE as any)
  created_at: Date;

  @Attribute(DataTypes.DATE as any)
  updated_at: Date;
}