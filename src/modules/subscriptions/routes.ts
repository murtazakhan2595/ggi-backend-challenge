import { Router } from 'express';
import { SubscriptionController } from './controllers/SubscriptionController';
import { CreateSubscriptionDto } from './controllers/dtos/CreateSubscriptionDto';
import { CancelSubscriptionDto } from './controllers/dtos/CancelSubscriptionDto';
import { ToggleAutoRenewDto } from './controllers/dtos/ToggleAutoRenewDto';
import { validateRequest } from '../../shared/middleware/validateRequest';
import { asyncHandler } from '../../shared/middleware/errorHandler';

const router = Router();
const subscriptionController = new SubscriptionController();

/**
 * @route   POST /api/subscriptions
 * @desc    Create a new subscription
 * @access  Public (should be protected in production)
 */
router.post(
  '/',
  validateRequest(CreateSubscriptionDto),
  asyncHandler(subscriptionController.createSubscription.bind(subscriptionController))
);

/**
 * @route   GET /api/subscriptions/:userId
 * @desc    Get all subscriptions for a user
 * @access  Public (should be protected in production)
 */
router.get(
  '/:userId',
  asyncHandler(subscriptionController.getUserSubscriptions.bind(subscriptionController))
);

/**
 * @route   PATCH /api/subscriptions/:id/cancel
 * @desc    Cancel a subscription
 * @access  Public (should be protected in production)
 */
router.patch(
  '/:id/cancel',
  validateRequest(CancelSubscriptionDto),
  asyncHandler(subscriptionController.cancelSubscription.bind(subscriptionController))
);

/**
 * @route   PATCH /api/subscriptions/:id/toggle-autorenew
 * @desc    Toggle auto-renew
 * @access  Public (should be protected in production)
 */
router.patch(
  '/:id/toggle-autorenew',
  validateRequest(ToggleAutoRenewDto),
  asyncHandler(subscriptionController.toggleAutoRenew.bind(subscriptionController))
);

export default router;