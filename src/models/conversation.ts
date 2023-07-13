import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database';

class Conversation extends Model {
  public id!: number;

  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Conversation.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
  },
  {
    sequelize,
    modelName: 'Conversation',
  }
);

export default Conversation;
