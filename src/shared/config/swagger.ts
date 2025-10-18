import swaggerJsdoc from 'swagger-jsdoc';
import { Config } from './config';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'GGI Backend Challenge API',
      version: '1.0.0',
      description: 'AI Chat & Subscription Management System with Quota Management',
      contact: {
        name: 'Ahmed Murtaza',
        url: 'https://github.com/murtazakhan2595',
      },
    },
    servers: [
      {
        url: `http://localhost:${Config.PORT}`,
        description: 'Development server',
      },
    ],
    tags: [
      {
        name: 'Chat',
        description: 'AI Chat operations with quota management',
      },
      {
        name: 'Subscriptions',
        description: 'Subscription management operations',
      },
    ],
    components: {
      schemas: {
        ChatRequest: {
          type: 'object',
          required: ['userId', 'question'],
          properties: {
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'User ID',
              example: '123e4567-e89b-12d3-a456-426614174000',
            },
            question: {
              type: 'string',
              minLength: 1,
              maxLength: 2000,
              description: 'Question to ask the AI',
              example: 'What are the best practices for Clean Architecture?',
            },
          },
        },
        ChatResponse: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'success',
            },
            data: {
              type: 'object',
              properties: {
                answer: {
                  type: 'string',
                  description: 'AI generated answer',
                },
                tokensUsed: {
                  type: 'integer',
                  description: 'Number of tokens consumed',
                },
                responseTime: {
                  type: 'integer',
                  description: 'Response time in milliseconds',
                },
                quotaInfo: {
                  type: 'object',
                  properties: {
                    usedFreeQuota: {
                      type: 'boolean',
                      description: 'Whether free quota was used',
                    },
                    subscriptionId: {
                      type: 'string',
                      format: 'uuid',
                      description: 'Subscription ID if subscription quota was used',
                      nullable: true,
                    },
                  },
                },
              },
            },
          },
        },
        CreateSubscriptionRequest: {
          type: 'object',
          required: ['userId', 'tier', 'billingCycle'],
          properties: {
            userId: {
              type: 'string',
              format: 'uuid',
              description: 'User ID',
            },
            tier: {
              type: 'string',
              enum: ['BASIC', 'PRO', 'ENTERPRISE'],
              description: 'Subscription tier',
            },
            billingCycle: {
              type: 'string',
              enum: ['MONTHLY', 'YEARLY'],
              description: 'Billing cycle',
            },
            autoRenew: {
              type: 'boolean',
              default: true,
              description: 'Auto-renew enabled',
            },
          },
        },
        Subscription: {
          type: 'object',
          properties: {
            id: {
              type: 'string',
              format: 'uuid',
            },
            tier: {
              type: 'string',
              enum: ['BASIC', 'PRO', 'ENTERPRISE'],
            },
            maxMessages: {
              type: 'integer',
              description: 'Maximum messages allowed',
            },
            messagesUsed: {
              type: 'integer',
              description: 'Messages used so far',
            },
            price: {
              type: 'number',
              description: 'Subscription price',
            },
            billingCycle: {
              type: 'string',
              enum: ['MONTHLY', 'YEARLY'],
            },
            status: {
              type: 'string',
              enum: ['ACTIVE', 'INACTIVE', 'CANCELLED', 'EXPIRED'],
            },
            autoRenew: {
              type: 'boolean',
            },
            startDate: {
              type: 'string',
              format: 'date',
            },
            endDate: {
              type: 'string',
              format: 'date',
            },
            createdAt: {
              type: 'string',
              format: 'date-time',
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            status: {
              type: 'string',
              example: 'error',
            },
            message: {
              type: 'string',
              description: 'Error message',
            },
          },
        },
      },
    },
  },
  apis: ['./src/modules/*/routes.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
