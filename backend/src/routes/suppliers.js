import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireLogistics } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all suppliers
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { city, region, is_active = true } = req.query;
    
    let query = supabase
      .from('suppliers')
      .select('*');

    if (city) query = query.eq('city', city);
    if (region) query = query.eq('region', region);
    if (is_active !== undefined) query = query.eq('is_active', is_active);

    const { data: suppliers, error } = await query.order('name');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ suppliers });

  } catch (error) {
    logger.error('Get suppliers error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single supplier
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: supplier, error } = await supabase
      .from('suppliers')
      .select(`
        *,
        warehouse_locations (*),
        supplier_products (
          *,
          products (name, category)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Supplier not found' });
    }

    res.json({ supplier });

  } catch (error) {
    logger.error('Get supplier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create supplier
router.post('/', authenticateToken, requireLogistics, async (req, res) => {
  try {
    const supplierData = req.body;

    const { data: supplier, error } = await supabase
      .from('suppliers')
      .insert(supplierData)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    logger.info(`Supplier ${supplier.name} created by ${req.employee.email}`);

    res.status(201).json({
      message: 'Supplier created successfully',
      supplier
    });

  } catch (error) {
    logger.error('Create supplier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update supplier
router.put('/:id', authenticateToken, requireLogistics, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;

    const { data: supplier, error } = await supabase
      .from('suppliers')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    logger.info(`Supplier ${id} updated by ${req.employee.email}`);

    res.json({
      message: 'Supplier updated successfully',
      supplier
    });

  } catch (error) {
    logger.error('Update supplier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete supplier (soft delete)
router.delete('/:id', authenticateToken, requireLogistics, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('suppliers')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    logger.info(`Supplier ${id} deleted by ${req.employee.email}`);

    res.json({ message: 'Supplier deleted successfully' });

  } catch (error) {
    logger.error('Delete supplier error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;