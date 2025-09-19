import { Attribute, Model } from '@eggjs/tegg-orm-decorator';
import { Bone, DataTypes } from 'leoric';

@Model()
export class Product extends Bone {
  @Attribute(DataTypes.STRING as any, { primary: true })
  id: string;

  @Attribute(DataTypes.STRING as any)
  title: string;

  @Attribute(DataTypes.STRING as any)
  subtitle: string;

  @Attribute(DataTypes.DECIMAL as any)
  price: number; // 商品价格

  @Attribute(DataTypes.INTEGER as any)
  quantity: number;

  @Attribute(DataTypes.TEXT as any)
  images: string; // JSON字符串，最多3张图片

  @Attribute(DataTypes.TEXT as any)
  details: string;

  @Attribute(DataTypes.INTEGER as any)
  status: number; // 1: active, 0: inactive

  @Attribute(DataTypes.INTEGER as any)
  merchant_id: number; // 商家用户ID

  @Attribute(DataTypes.DATE as any)
  created_at: Date;

  @Attribute(DataTypes.DATE as any)
  updated_at: Date;
}