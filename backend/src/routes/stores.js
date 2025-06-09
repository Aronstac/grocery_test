import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all stores
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { data: stores, error } = await supabase
      .from('stores')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ stores });

  } catch (error) {
    logger.error('Get stores error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single store
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: store, error } = await supabase
      .from('stores')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Store not found' });
    }

    res.json({ store });

  } catch (error) {
    logger.error('Get store error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create store (admin only)
router.post('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const storeData = req.body;

    const { data: store, error } = await supabase
      .from('stores')
      .insert(storeData)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    logger.info(`Store ${store.name} created by ${req.employee.email}`);

    res.status(201).json({
      message: 'Store created successfully',
      store
    });

  } catch (error) {
    logger.error('Create store error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update store
router.put('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;

    const { data: store, error } = await supabase
      .from('stores')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    logger.info(`Store ${id} updated by ${req.employee.email}`);

    res.json({
      message: 'Store updated successfully',
      store
    });

  } catch (error) {
    logger.error('Update store error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;