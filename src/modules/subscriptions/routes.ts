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
 * @openapi
 * /api/subscriptions:
 *   post:
 *     tags:
 *       - Subscriptions
 *     summary: Create a new subscription
 *     description: Create a new subscription for a user with specified tier and billing cycle
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateSubscriptionRequest'
 *     responses:
 *       201:
 *         description: Subscription created successfully
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
 *                     subscription:
 *                       $ref: '#/components/schemas/Subscription'
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
 */
router.post(
  '/',
  validateRequest(CreateSubscriptionDto),
  asyncHandler(subscriptionController.createSubscription.bind(subscriptionController))
);

/**
 * @openapi
 * /api/subscriptions/{userId}:
 *   get:
 *     tags:
 *       - Subscriptions
 *     summary: Get user subscriptions
 *     description: Retrieve all subscriptions for a specific user
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: User ID
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
 *                     subscriptions:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Subscription'
 *                     count:
 *                       type: integer
 */
router.get(
  '/:userId',
  asyncHandler(subscriptionController.getUserSubscriptions.bind(subscriptionController))
);

/**
 * @openapi
 * /api/subscriptions/{id}/cancel:
 *   patch:
 *     tags:
 *       - Subscriptions
 *     summary: Cancel subscription
 *     description: Cancel an active subscription
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Subscription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *       404:
 *         description: Subscription not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  '/:id/cancel',
  validateRequest(CancelSubscriptionDto),
  asyncHandler(subscriptionController.cancelSubscription.bind(subscriptionController))
);

/**
 * @openapi
 * /api/subscriptions/{id}/toggle-autorenew:
 *   patch:
 *     tags:
 *       - Subscriptions
 *     summary: Toggle auto-renew
 *     description: Toggle auto-renew on or off for a subscription
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Subscription ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *                 format: uuid
 *     responses:
 *       200:
 *         description: Auto-renew toggled successfully
 *       404:
 *         description: Subscription not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.patch(
  '/:id/toggle-autorenew',
  validateRequest(ToggleAutoRenewDto),
  asyncHandler(subscriptionController.toggleAutoRenew.bind(subscriptionController))
);

export default router;
