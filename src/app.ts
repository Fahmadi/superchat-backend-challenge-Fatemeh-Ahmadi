import express from 'express';
import contactRoutes from './routes/contacts';
import conversationRoutes from './routes/conversations';
import sequelize from './config/database';
import webhookRouter from './routes/webhooks';

const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());
app.use('/contacts', contactRoutes);
app.use('/conversations', conversationRoutes);
app.use('/webhook', webhookRouter);

// Synchronize the models with the database
sequelize.sync()
  .then(() => {
    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error('Unable to sync database:', error);
  });
