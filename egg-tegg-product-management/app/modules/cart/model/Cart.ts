import { Attribute, Model } from '@eggjs/tegg-orm-decorator';
import { Bone, DataTypes } from 'leoric';

@Model({
  dataSource: 'product',
  tableName: 'carts',
})
export class Cart extends Bone {
  @Attribute(DataTypes.STRING as any, { primary: true })
  id: string;

  @Attribute(DataTypes.STRING as any, { allowNull: false })
  user_id: string;

  @Attribute(DataTypes.JSON as any, { allowNull: false })
  items: Array<{
    product_id: string;
    title: string;
    quantity: number;
  }>;

  @Attribute(DataTypes.DATE as any)
  created_at: Date;

  @Attribute(DataTypes.DATE as any)
  updated_at: Date;
}