/**
 * NOTIFICATION SERVICE
 * ====================
 * Purpose: Real-time notifications for urgent tasks & SPK assignments
 * 
 * Features:
 * - In-app notifications (stored in database)
 * - Push notifications (future: Firebase FCM)
 * - Email notifications (future: SendGrid/NodeMailer)
 * - WebSocket support (future: Socket.io)
 * 
 * Author: Backend Team
 * Date: November 19, 2025
 */

const { supabase } = require('../config/supabase');

/**
 * Create Notification
 * @param {Object} params - { user_id, type, title, message, data, priority }
 * @returns {Object} { success, notification }
 */
async function createNotification(params) {
  try {
    const { user_id, type, title, message, data, priority } = params;

    console.log('🔔 [Notification] Creating notification for user:', user_id);

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        user_id,
        type: type || 'INFO',
        title,
        message,
        data: data || {},
        priority: priority || 'NORMAL',
        read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error('❌ [Notification] Error creating notification:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [Notification] Notification created:', notification.id);

    // TODO: Send push notification via Firebase FCM
    // TODO: Send email if priority is HIGH or URGENT

    return {
      success: true,
      data: notification
    };

  } catch (error) {
    console.error('❌ [Notification] Create notification error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get User Notifications
 * @param {string} user_id - User ID
 * @param {Object} filters - { read, type, limit, offset }
 * @returns {Object} { success, notifications, unread_count }
 */
async function getUserNotifications(user_id, filters = {}) {
  try {
    console.log('🔔 [Notification] Getting notifications for user:', user_id);

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (filters.read !== undefined) {
      query = query.eq('read', filters.read);
    }

    if (filters.type) {
      query = query.eq('type', filters.type);
    }

    if (filters.limit) {
      query = query.limit(filters.limit);
    }

    if (filters.offset) {
      query = query.range(filters.offset, filters.offset + (filters.limit || 20) - 1);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('❌ [Notification] Error getting notifications:', error);
      return { success: false, error: error.message };
    }

    // Get unread count
    const { count: unread_count } = await supabase
      .from('notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user_id)
      .eq('read', false);

    return {
      success: true,
      data: {
        notifications: notifications || [],
        unread_count: unread_count || 0,
        total: notifications?.length || 0
      }
    };

  } catch (error) {
    console.error('❌ [Notification] Get notifications error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Mark Notification as Read
 * @param {string} notification_id - Notification ID
 * @param {string} user_id - User ID (for verification)
 * @returns {Object} { success, message }
 */
async function markAsRead(notification_id, user_id) {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', notification_id)
      .eq('user_id', user_id); // Verify ownership

    if (error) {
      console.error('❌ [Notification] Error marking as read:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [Notification] Marked as read:', notification_id);
    return { success: true, message: 'Notification marked as read' };

  } catch (error) {
    console.error('❌ [Notification] Mark as read error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Mark All Notifications as Read
 * @param {string} user_id - User ID
 * @returns {Object} { success, count }
 */
async function markAllAsRead(user_id) {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('user_id', user_id)
      .eq('read', false)
      .select();

    if (error) {
      console.error('❌ [Notification] Error marking all as read:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [Notification] Marked all as read for user:', user_id);
    return { 
      success: true, 
      message: `${data.length} notifications marked as read`,
      count: data.length
    };

  } catch (error) {
    console.error('❌ [Notification] Mark all as read error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Delete Notification
 * @param {string} notification_id - Notification ID
 * @param {string} user_id - User ID (for verification)
 * @returns {Object} { success, message }
 */
async function deleteNotification(notification_id, user_id) {
  try {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notification_id)
      .eq('user_id', user_id); // Verify ownership

    if (error) {
      console.error('❌ [Notification] Error deleting notification:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ [Notification] Deleted notification:', notification_id);
    return { success: true, message: 'Notification deleted' };

  } catch (error) {
    console.error('❌ [Notification] Delete notification error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * Helper: Notify SPK Assignment
 * @param {string} mandor_id - Mandor user ID
 * @param {Object} spk - SPK details
 */
async function notifySPKAssignment(mandor_id, spk) {
  return await createNotification({
    user_id: mandor_id,
    type: 'SPK_ASSIGNMENT',
    title: 'SPK Baru Ditugaskan',
    message: `Anda mendapat SPK baru: ${spk.nama_spk}`,
    data: {
      spk_id: spk.id_spk,
      spk_name: spk.nama_spk,
      priority: spk.prioritas,
      deadline: spk.tanggal_target
    },
    priority: spk.prioritas === 'URGENT' ? 'HIGH' : 'NORMAL'
  });
}

/**
 * Helper: Notify Urgent Task
 * @param {string} user_id - User ID
 * @param {Object} task - Task details
 */
async function notifyUrgentTask(user_id, task) {
  return await createNotification({
    user_id,
    type: 'URGENT_TASK',
    title: '⚠️ Tugas Urgent',
    message: `Tugas urgent memerlukan perhatian segera`,
    data: {
      task_id: task.id_tugas,
      spk_id: task.id_spk,
      task_type: task.tipe_tugas
    },
    priority: 'HIGH'
  });
}

/**
 * Helper: Notify Anomaly Detected
 * @param {string} asisten_id - Asisten Manager user ID
 * @param {Object} anomaly - Anomaly details
 */
async function notifyAnomalyDetected(asisten_id, anomaly) {
  return await createNotification({
    user_id: asisten_id,
    type: 'ANOMALY_DETECTED',
    title: `🚨 Anomali Terdeteksi: ${anomaly.type}`,
    message: `${anomaly.count} ${anomaly.description}`,
    data: {
      anomaly_type: anomaly.type,
      count: anomaly.count,
      severity: anomaly.severity,
      locations: anomaly.locations
    },
    priority: anomaly.severity === 'CRITICAL' ? 'HIGH' : 'NORMAL'
  });
}

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  notifySPKAssignment,
  notifyUrgentTask,
  notifyAnomalyDetected
};
