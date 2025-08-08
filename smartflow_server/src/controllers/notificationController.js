import db from '../config/db.js';

// In-memory map of userId -> Set of SSE connections
const sseClients = new Map();

async function ensureNotificationsTableExists() {
  await db.query(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      type ENUM('ticket','requisition','access_request','registration','system') NOT NULL,
      title VARCHAR(200) NOT NULL,
      message VARCHAR(500) NOT NULL,
      recipient_id INT NOT NULL,
      sender_id INT NULL,
      related_id INT NULL,
      related_type VARCHAR(100) NULL,
      status ENUM('unread','read') NOT NULL DEFAULT 'unread',
      created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_recipient_status (recipient_id, status),
      INDEX idx_created (created_at DESC),
      CONSTRAINT fk_notifications_recipient FOREIGN KEY (recipient_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}

function addClient(userId, res) {
  const key = Number(userId);
  if (!sseClients.has(key)) sseClients.set(key, new Set());
  sseClients.get(key).add(res);
}

function removeClient(userId, res) {
  const key = Number(userId);
  const set = sseClients.get(key);
  if (set) {
    set.delete(res);
    if (set.size === 0) sseClients.delete(key);
  }
}

function emitToUser(userId, data) {
  const key = Number(userId);
  const set = sseClients.get(key);
  if (!set) return;
  const payload = `data: ${JSON.stringify(data)}\n\n`;
  for (const res of set) {
    try {
      res.write(payload);
    } catch (e) {
      // drop dead connections silently
    }
  }
}

export async function streamNotifications(req, res) {
  const { userId } = req.params;
  if (!userId) {
    return res.status(400).end();
  }

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders?.();

  // Initial comment to open stream
  res.write(': connected\n\n');

  addClient(userId, res);

  req.on('close', () => {
    removeClient(userId, res);
    try { res.end(); } catch {}
  });
}

export async function getUserNotifications(req, res) {
  try {
    const { userId } = req.params;
    await ensureNotificationsTableExists();
    const [rows] = await db.query(
      `SELECT id, type, title, message, recipient_id, sender_id, related_id, related_type, status, created_at
       FROM notifications
       WHERE recipient_id = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [userId]
    );
    res.json({ success: true, notifications: rows });
  } catch (e) {
    if (e?.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ success: true, notifications: [] });
    }
    console.error('Failed to get notifications:', e);
    res.status(500).json({ success: false, message: 'Failed to get notifications' });
  }
}

export async function getUnreadCount(req, res) {
  try {
    const { userId } = req.params;
    await ensureNotificationsTableExists();
    const [[row]] = await db.query(
      `SELECT COUNT(*) AS count FROM notifications WHERE recipient_id = ? AND status = 'unread'`,
      [userId]
    );
    res.json({ success: true, count: row?.count || 0 });
  } catch (e) {
    if (e?.code === 'ER_NO_SUCH_TABLE') {
      return res.json({ success: true, count: 0 });
    }
    console.error('Failed to get unread count:', e);
    res.status(500).json({ success: false, message: 'Failed to get unread count' });
  }
}

export async function markAsRead(req, res) {
  try {
    const { id } = req.params;
    await ensureNotificationsTableExists();
    await db.query(`UPDATE notifications SET status = 'read' WHERE id = ?`, [id]);
    res.json({ success: true });
  } catch (e) {
    console.error('Failed to mark as read:', e);
    res.status(500).json({ success: false, message: 'Failed to update' });
  }
}

export async function sendNotificationToUsers(recipientIds, { type = 'access_request', title, message, sender_id = null, related_id = null, related_type = 'system_access_request' }) {
  if (!recipientIds || recipientIds.length === 0) return;
  const now = new Date();
  const values = recipientIds.map(rid => [type, title, message, rid, sender_id, related_id, related_type, 'unread', now]);
  try {
    await ensureNotificationsTableExists();
    await db.query(
      `INSERT INTO notifications (type, title, message, recipient_id, sender_id, related_id, related_type, status, created_at)
       VALUES ?`,
      [values]
    );
  } catch (e) {
    console.error('Failed to insert notifications:', e);
  }
  // Emit SSE
  for (const rid of recipientIds) {
    try {
      emitToUser(rid, { type, title, message, recipient_id: rid, sender_id, related_id, related_type, status: 'unread', created_at: now.toISOString() });
    } catch {}
  }
} 