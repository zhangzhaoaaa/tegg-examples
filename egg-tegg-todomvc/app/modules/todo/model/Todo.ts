import { Attribute, Model } from '@eggjs/tegg-orm-decorator';
import { Bone, DataTypes } from 'leoric';

@Model()
export class Todo extends Bone {
  @Attribute(DataTypes.STRING as any, { primary: true })
  id: string;

  @Attribute(DataTypes.STRING as any, { allowNull: false })
  title: string;

  @Attribute(DataTypes.INTEGER as any, { allowNull: false })
  completed: number;
}