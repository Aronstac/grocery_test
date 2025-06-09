import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get notifications for current user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { is_read, priority, limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from('notifications')
      .select(`
        *,
        sender:employees!notifications_sender_id_fkey (name, email)
      `)
      .eq('recipient_id', req.employee.id);

    if (is_read !== undefined) query = query.eq('is_read', is_read === 'true');
    if (priority) query = query.eq('priority', priority);

    const { data: notifications, error } = await query
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ notifications });

  } catch (error) {
    logger.error('Get notifications error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single notification
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: notification, error } = await supabase
      .from('notifications')
      .select(`
        *,
        sender:employees!notifications_sender_id_fkey (name, email)
      `)
      .eq('id', id)
      .eq('recipient_id', req.employee.id) // Ensure user can only access their own notifications
      .single();

    if (error) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ notification });

  } catch (error) {
    logger.error('Get notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('recipient_id', req.employee.id); // Ensure user can only update their own notifications

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Notification marked as read' });

  } catch (error) {
    logger.error('Mark notification as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark all notifications as read
router.patch('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ 
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('recipient_id', req.employee.id)
      .eq('is_read', false);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'All notifications marked as read' });

  } catch (error) {
    logger.error('Mark all notifications as read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create notification (system use)
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { recipient_id, type, title, message, priority, data, action_url, expires_at } = req.body;

    const { data: notification, error } = await supabase
      .from('notifications')
      .insert({
        recipient_id,
        sender_id: req.employee.id,
        type,
        title,
        message,
        priority: priority || 'normal',
        data,
        action_url,
        expires_at
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    logger.info(`Notification created for ${recipient_id} by ${req.employee.email}`);

    res.status(201).json({
      message: 'Notification created successfully',
      notification
    });

  } catch (error) {
    logger.error('Create notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete notification
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', id)
      .eq('recipient_id', req.employee.id); // Ensure user can only delete their own notifications

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Notification deleted successfully' });

  } catch (error) {
    logger.error('Delete notification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get unread count
router.get('/unread/count', authenticateToken, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('id', { count: 'exact' })
      .eq('recipient_id', req.employee.id)
      .eq('is_read', false);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ count: data?.length || 0 });

  } catch (error) {
    logger.error('Get unread count error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;