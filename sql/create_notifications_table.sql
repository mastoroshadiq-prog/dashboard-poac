-- ============================================================
-- CREATE NOTIFICATIONS TABLE
-- ============================================================
-- Purpose: Store in-app notifications for users
-- 
-- Date: November 19, 2025
-- Author: Backend Team
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES master_pihak(id_pihak) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- SPK_ASSIGNMENT, URGENT_TASK, ANOMALY_DETECTED, SYSTEM, etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}', -- Additional data (spk_id, task_id, etc.)
  priority VARCHAR(20) DEFAULT 'NORMAL', -- LOW, NORMAL, HIGH, URGENT
  read BOOLEAN DEFAULT FALSE,
  read_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP -- Optional: auto-delete after expiry
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_notifications_user_read_created 
ON notifications(user_id, read, created_at DESC);

-- Comments
COMMENT ON TABLE notifications IS 'User notifications for SPK assignments, urgent tasks, anomalies';
COMMENT ON COLUMN notifications.type IS 'Notification type: SPK_ASSIGNMENT, URGENT_TASK, ANOMALY_DETECTED, SYSTEM, INFO';
COMMENT ON COLUMN notifications.data IS 'Additional JSON data specific to notification type';
COMMENT ON COLUMN notifications.priority IS 'Notification priority: LOW, NORMAL, HIGH, URGENT';
COMMENT ON COLUMN notifications.read IS 'Whether notification has been read by user';
COMMENT ON COLUMN notifications.expires_at IS 'Optional expiry date for auto-cleanup';

-- ============================================================
-- VERIFICATION
-- ============================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================';
  RAISE NOTICE '✅ NOTIFICATIONS TABLE CREATED';
  RAISE NOTICE '============================================================';
  RAISE NOTICE 'Table: notifications';
  RAISE NOTICE 'Indexes: 6 indexes created';
  RAISE NOTICE '';
  RAISE NOTICE '📋 API Endpoints:';
  RAISE NOTICE '   GET    /api/v1/notifications - Get user notifications';
  RAISE NOTICE '   PUT    /api/v1/notifications/:id/read - Mark as read';
  RAISE NOTICE '   PUT    /api/v1/notifications/mark-all-read - Mark all';
  RAISE NOTICE '   DELETE /api/v1/notifications/:id - Delete notification';
  RAISE NOTICE '';
  RAISE NOTICE '🔔 Notification Types:';
  RAISE NOTICE '   - SPK_ASSIGNMENT: New SPK assigned to mandor';
  RAISE NOTICE '   - URGENT_TASK: Urgent task requires attention';
  RAISE NOTICE '   - ANOMALY_DETECTED: Anomaly detected in analytics';
  RAISE NOTICE '   - SYSTEM: System messages';
  RAISE NOTICE '   - INFO: General information';
  RAISE NOTICE '============================================================';
END $$;
