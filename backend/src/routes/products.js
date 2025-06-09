import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireLogistics } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all products
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { category, low_stock, search, limit = 50, offset = 0 } = req.query;
    
    let query = supabase
      .from('products')
      .select(`
        *,
        suppliers (name, contact_email),
        category_details:product_categories (name, description)
      `);

    if (category) query = query.eq('category', category);
    if (search) query = query.ilike('name', `%${search}%`);
    if (low_stock === 'true') query = query.lt('stock', supabase.raw('reorder_level'));

    const { data: products, error } = await query
      .eq('is_active', true)
      .order('name')
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ products });

  } catch (error) {
    logger.error('Get products error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single product
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: product, error } = await supabase
      .from('products')
      .select(`
        *,
        suppliers (name, contact_email, contact_phone),
        category_details:product_categories (name, description),
        supplier_products (
          cost,
          price,
          minimum_order_quantity,
          lead_time_days,
          is_preferred
        ),
        inventory (
          stock_level,
          reserved_quantity,
          available_quantity,
          min_threshold,
          max_threshold,
          location_code,
          warehouse_locations (name, address)
        )
      `)
      .eq('id', id)
      .eq('is_active', true)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Product not found' });
    }

    res.json({ product });

  } catch (error) {
    logger.error('Get product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create product
router.post('/', authenticateToken, requireLogistics, validateRequest(schemas.createProduct), async (req, res) => {
  try {
    const productData = req.validated.body;

    const { data: product, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    logger.info(`Product ${product.name} created by ${req.employee.email}`);

    res.status(201).json({
      message: 'Product created successfully',
      product
    });

  } catch (error) {
    logger.error('Create product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update product
router.put('/:id', authenticateToken, requireLogistics, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Remove fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;

    const { data: product, error } = await supabase
      .from('products')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    logger.info(`Product ${id} updated by ${req.employee.email}`);

    res.json({
      message: 'Product updated successfully',
      product
    });

  } catch (error) {
    logger.error('Update product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete product (soft delete)
router.delete('/:id', authenticateToken, requireLogistics, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('products')
      .update({ is_active: false })
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    logger.info(`Product ${id} deleted by ${req.employee.email}`);

    res.json({ message: 'Product deleted successfully' });

  } catch (error) {
    logger.error('Delete product error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get product categories
router.get('/categories/list', authenticateToken, async (req, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('product_categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ categories });

  } catch (error) {
    logger.error('Get categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update stock level
router.patch('/:id/stock', authenticateToken, requireLogistics, async (req, res) => {
  try {
    const { id } = req.params;
    const { stock, notes } = req.body;

    if (typeof stock !== 'number' || stock < 0) {
      return res.status(400).json({ error: 'Invalid stock value' });
    }

    // Get current stock
    const { data: currentProduct } = await supabase
      .from('products')
      .select('stock')
      .eq('id', id)
      .single();

    if (!currentProduct) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Update stock
    const { error } = await supabase
      .from('products')
      .update({ stock })
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Log inventory transaction
    const quantityChange = stock - currentProduct.stock;
    const transactionType = quantityChange > 0 ? 'inbound' : 
                           quantityChange < 0 ? 'outbound' : 'adjustment';

    // Note: This would need to be adapted to work with the new inventory system
    // For now, we'll just log the change

    logger.info(`Product ${id} stock updated from ${currentProduct.stock} to ${stock} by ${req.employee.email}`);

    res.json({ 
      message: 'Stock updated successfully',
      previous_stock: currentProduct.stock,
      new_stock: stock,
      change: quantityChange
    });

  } catch (error) {
    logger.error('Update stock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;