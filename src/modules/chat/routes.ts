import { Router } from 'express';
import { ChatController } from './controllers/ChatController';
import { ChatRequestDto } from './controllers/dtos/ChatRequestDto';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { asyncHandler } from '../../shared/middleware/errorHandler';

const router = Router();
const chatController = new ChatController();

/**
 * @route   POST /api/chat
 * @desc    Send a message to AI
 * @access  Public (should be protected in production)
 */
router.post(
  '/',
  validateRequest(ChatRequestDto),
  asyncHandler(chatController.sendMessage.bind(chatController))
);

/**
 * @route   GET /api/chat/history/:userId
 * @desc    Get chat history for a user
 * @access  Public (should be protected in production)
 */
router.get('/history/:userId', asyncHandler(chatController.getChatHistory.bind(chatController)));

export default router;