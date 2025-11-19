/**
 * NOTIFICATION ROUTES
 * ===================
 * Endpoints for user notifications
 * 
 * Routes:
 * - GET /api/v1/notifications - Get user notifications
 * - PUT /api/v1/notifications/:id/read - Mark notification as read
 * - PUT /api/v1/notifications/mark-all-read - Mark all as read
 * - DELETE /api/v1/notifications/:id - Delete notification
 * 
 * Author: Backend Team
 * Date: November 19, 2025
 */

const express = require('express');
const router = express.Router();
const notificationService = require('../services/notificationService');
const { authenticateJWT } = require('../middleware/authMiddleware');

/**
 * GET /api/v1/notifications
 * 
 * Headers:
 * Authorization: Bearer <token>
 * 
 * Query Parameters:
 * - read: true|false (optional)
 * - type: NOTIFICATION_TYPE (optional)
 * - limit: number (default: 20)
 * - offset: number (default: 0)
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "data": {
 *     "notifications": [
 *       {
 *         "id": "uuid",
 *         "type": "SPK_ASSIGNMENT",
 *         "title": "SPK Baru Ditugaskan",
 *         "message": "Anda mendapat SPK baru: SPK01A",
 *         "data": { "spk_id": "uuid", ... },
 *         "priority": "NORMAL",
 *         "read": false,
 *         "created_at": "2025-11-19T..."
 *       }
 *     ],
 *     "unread_count": 5,
 *     "total": 20
 *   }
 * }
 */
router.get('/', authenticateJWT, async (req, res) => {
  try {
    const user_id = req.user.id_pihak;
    const filters = {
      read: req.query.read === 'true' ? true : req.query.read === 'false' ? false : undefined,
      type: req.query.type || undefined,
      limit: parseInt(req.query.limit) || 20,
      offset: parseInt(req.query.offset) || 0
    };

    console.log('🔔 [Notifications] GET notifications for user:', user_id);

    const result = await notificationService.getUserNotifications(user_id, filters);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        message: result.error || 'Gagal mengambil notifikasi'
      });
    }

    return res.status(200).json({
      success: true,
      data: result.data
    });

  } catch (error) {
    console.error('❌ [Notifications] GET error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem'
    });
  }
});

/**
 * PUT /api/v1/notifications/:id/read
 * 
 * Mark notification as read
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "message": "Notification marked as read"
 * }
 */
router.put('/:id/read', authenticateJWT, async (req, res) => {
  try {
    const notification_id = req.params.id;
    const user_id = req.user.id_pihak;

    console.log('🔔 [Notifications] Mark as read:', notification_id);

    const result = await notificationService.markAsRead(notification_id, user_id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ [Notifications] Mark as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem'
    });
  }
});

/**
 * PUT /api/v1/notifications/mark-all-read
 * 
 * Mark all notifications as read
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "message": "5 notifications marked as read",
 *   "count": 5
 * }
 */
router.put('/mark-all-read', authenticateJWT, async (req, res) => {
  try {
    const user_id = req.user.id_pihak;

    console.log('🔔 [Notifications] Mark all as read for user:', user_id);

    const result = await notificationService.markAllAsRead(user_id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ [Notifications] Mark all as read error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem'
    });
  }
});

/**
 * DELETE /api/v1/notifications/:id
 * 
 * Delete notification
 * 
 * Response 200:
 * {
 *   "success": true,
 *   "message": "Notification deleted"
 * }
 */
router.delete('/:id', authenticateJWT, async (req, res) => {
  try {
    const notification_id = req.params.id;
    const user_id = req.user.id_pihak;

    console.log('🔔 [Notifications] Delete:', notification_id);

    const result = await notificationService.deleteNotification(notification_id, user_id);

    if (!result.success) {
      return res.status(400).json(result);
    }

    return res.status(200).json(result);

  } catch (error) {
    console.error('❌ [Notifications] Delete error:', error);
    return res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan sistem'
    });
  }
});

module.exports = router;
