const request = require('supertest');
const { Op } = require('sequelize');
const app = require('../app');
const Contact = require('../models/contact');
const Conversation = require('../models/conversation');
const Message = require('../models/message');


describe('Route Handlers', () => {
  describe('POST /contacts', () => {
    it('should create a new contact', async () => {
      // Mock the Contact model create method
      Contact.create = jest.fn().mockResolvedValueOnce({
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      // Make a request to the route handler
      const response = await request(app)
        .post('/contacts')
        .send({
          name: 'John Doe',
          email: 'john@example.com',
        });

      // Assert the response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('name', 'John Doe');
      expect(response.body).toHaveProperty('email', 'john@example.com');

      // Assert that the Contact model create method was called with the correct arguments
      expect(Contact.create).toHaveBeenCalledTimes(1);
      expect(Contact.create).toHaveBeenCalledWith({
        name: 'John Doe',
        email: 'john@example.com',
      });
    });
  });

  describe('GET /contacts', () => {
    it('should return a list of contacts', async () => {
      // Mock the Contact model findAll method
      Contact.findAll = jest.fn().mockResolvedValueOnce([
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);

      // Make a request to the route handler
      const response = await request(app).get('/contacts');

      // Assert the response
      expect(response.status).toBe(200);
      expect(response.body).toBeInstanceOf(Array);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id', 1);
      expect(response.body[0]).toHaveProperty('name', 'John Doe');
      expect(response.body[0]).toHaveProperty('email', 'john@example.com');
      expect(response.body[1]).toHaveProperty('id', 2);
      expect(response.body[1]).toHaveProperty('name', 'Jane Smith');
      expect(response.body[1]).toHaveProperty('email', 'jane@example.com');

      // Assert that the Contact model findAll method was called
      expect(Contact.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('POST /contacts/messages', () => {
    it('should send a new message and create a conversation if it does not exist', async () => {
      // Mock the necessary models and their methods
      const mockContact = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockMessage = {
        id: 1,
        text: 'Hello, how are you?',
        senderId: 1,
        receiverId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      Contact.findOne = jest.fn().mockResolvedValueOnce(mockContact);
      Message.create = jest.fn().mockResolvedValueOnce(mockMessage);
      Message.findOne = jest.fn().mockResolvedValueOnce(null);
      Conversation.create = jest.fn().mockResolvedValueOnce({ id: 1 });

      // Make a request to the route handler
      const response = await request(app)
        .post('/contacts/messages')
        .send({
          text: 'Hello, how are you?',
          senderId: 1,
          receiverId: 2,
        });

      // Assert the response
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', 1);
      expect(response.body).toHaveProperty('text', 'Hello, how are you?');
      expect(response.body).toHaveProperty('senderId', 1);
      expect(response.body).toHaveProperty('receiverId', 2);

      // Assert that the necessary model methods were called with the correct arguments
      expect(Contact.findOne).toHaveBeenCalledTimes(1);
      expect(Contact.findOne).toHaveBeenCalledWith({ where: { id: 1 } });

      expect(Message.create).toHaveBeenCalledTimes(1);
      expect(Message.create).toHaveBeenCalledWith({
        text: 'Hello, how are you?',
        senderId: 1,
        receiverId: 2,
        conversationId: 1,
      });

      expect(Message.findOne).toHaveBeenCalledTimes(1);
      expect(Message.findOne).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { senderId: 1, receiverId: 2 },
            { senderId: 2, receiverId: 1 },
          ],
        },
      });

      expect(Conversation.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('GET /contacts/messages/:senderId/:receiverId', () => {
    it('should get all messages in a conversation between two contacts', async () => {
      // Mock the necessary models and their methods
      const mockContact1 = {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockContact2 = {
        id: 2,
        name: 'Jane Doe',
        email: 'jane@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockMessage1 = {
        id: 1,
        text: 'Hello, how are you?',
        senderId: 1,
        receiverId: 2,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const mockMessage2 = {
        id: 2,
        text: 'I am doing great!',
        senderId: 2,
        receiverId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      Contact.findOne = jest.fn((options) => {
        if (options.where.id === 1) return Promise.resolve(mockContact1);
        if (options.where.id === 2) return Promise.resolve(mockContact2);
        return null;
      });
      Message.findAll = jest.fn().mockResolvedValueOnce([mockMessage1, mockMessage2]);

      // Make a request to the route handler
      const response = await request(app).get('/contacts/messages/1/2');

      // Assert the response
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id', 1);
      expect(response.body[0]).toHaveProperty('text', 'Hello, how are you?');
      expect(response.body[0]).toHaveProperty('senderId', 1);
      expect(response.body[0]).toHaveProperty('receiverId', 2);
      expect(response.body[1]).toHaveProperty('id', 2);
      expect(response.body[1]).toHaveProperty('text', 'I am doing great!');
      expect(response.body[1]).toHaveProperty('senderId', 2);
      expect(response.body[1]).toHaveProperty('receiverId', 1);

      // Assert that the necessary model methods were called with the correct arguments
      expect(Contact.findOne).toHaveBeenCalledTimes(2);
      expect(Contact.findOne).toHaveBeenCalledWith({ where: { id: 1 } });
      expect(Contact.findOne).toHaveBeenCalledWith({ where: { id: 2 } });

      expect(Message.findAll).toHaveBeenCalledTimes(1);
      expect(Message.findAll).toHaveBeenCalledWith({
        where: {
          [Op.or]: [
            { senderId: 1, receiverId: 2 },
            { senderId: 2, receiverId: 1 },
          ],
        },
        order: [['createdAt', 'ASC']],
      });
    });

});
describe('POST /contacts/webhook', () => {
  it('should receive and save a new message', async () => {
    // Mock the necessary model and its method
    const mockMessage = {
      id: 1,
      text: 'Hello, how are you?',
      senderId: 2,
      receiverId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    Message.create = jest.fn().mockResolvedValueOnce(mockMessage);

    // Make a request to the route handler
    const response = await request(app)
      .post('/contacts/webhook')
      .send({
        text: 'Hello, how are you?',
        senderId: 2,
        receiverId: 1,
      });

    // Assert the response
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('text', 'Hello, how are you?');
    expect(response.body).toHaveProperty('senderId', 2);
    expect(response.body).toHaveProperty('receiverId', 1);

    // Assert that the necessary model method was called with the correct argument
    expect(Message.create).toHaveBeenCalledTimes(1);
    expect(Message.create).toHaveBeenCalledWith({
      text: 'Hello, how are you?',
      senderId: 2,
      receiverId: 1,
    });
  });
})
})