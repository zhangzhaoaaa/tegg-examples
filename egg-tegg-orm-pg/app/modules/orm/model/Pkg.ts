import { Attribute, Model } from '@eggjs/tegg-orm-decorator';
import { Bone, DataTypes } from 'leoric';

@Model({
  dataSource: 'tegg',
  tableName: 'userInfo',
})
export class Pkg extends Bone {
  @Attribute(DataTypes.INTEGER, { allowNull: false, autoIncrement: true, primary: true })
  id: number;

  @Attribute(DataTypes.STRING(255))
  name: string;

  @Attribute(DataTypes.STRING(255))
  email: string;
}