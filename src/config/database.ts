import { Sequelize } from 'sequelize';
const sequelize = new Sequelize(
  `postgres://${process.env.POSTGRES_USER||"postgres"}:${process.env.POSTGRES_PASSWORD||"admin"}@${process.env.POSTGRES_HOST||"localhost"}:${process.env.POSTGRES_PORT||5432}/${process.env.POSTGRES_DB||"superchat"}`,
  {
    dialect: 'postgres',
  }
);

export default sequelize;
