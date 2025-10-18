import { Router } from 'express';
import { ChatController } from './controllers/ChatController';
import { ChatRequestDto } from './controllers/dtos/ChatRequestDto';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { asyncHandler } from '../../shared/middleware/errorHandler';

const router = Router();
const chatController = new ChatController();

/**
 * @openapi
 * /api/chat:
 *   post:
 *     tags:
 *       - Chat
 *     summary: Send a message to AI
 *     description: Process a user question and return an AI-generated response with quota management
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ChatRequest'
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ChatResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: User not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       429:
 *         description: Quota exceeded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post(
  '/',
  validateRequest(ChatRequestDto),
  asyncHandler(chatController.sendMessage.bind(chatController))
);

/**
 * @openapi
 * /api/chat/history/{userId}:
 *   get:
 *     tags:
 *       - Chat
 *     summary: Get chat history
 *     description: Retrieve chat message history for a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 50
 *         description: Maximum number of messages to return
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     messages:
 *                       type: array
 *                       items:
 *                         type: object
 *                     count:
 *                       type: integer
 */
router.get('/history/:userId', asyncHandler(chatController.getChatHistory.bind(chatController)));

export default router;
