import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireWarehouse } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get inventory items
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { warehouse_id, low_stock, search } = req.query;
    
    let query = supabase
      .from('inventory')
      .select(`
        *,
        warehouse_locations (name, address),
        supplier_products (
          *,
          suppliers (name),
          products (name, category, sku)
        )
      `);

    if (warehouse_id) query = query.eq('warehouse_id', warehouse_id);
    if (low_stock === 'true') {
      query = query.lt('stock_level', supabase.raw('min_threshold'));
    }

    const { data: inventory, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Filter by search if provided
    let filteredInventory = inventory;
    if (search) {
      filteredInventory = inventory.filter(item => 
        item.supplier_products?.products?.name?.toLowerCase().includes(search.toLowerCase()) ||
        item.supplier_products?.products?.sku?.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.json({ inventory: filteredInventory });

  } catch (error) {
    logger.error('Get inventory error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single inventory item
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: inventoryItem, error } = await supabase
      .from('inventory')
      .select(`
        *,
        warehouse_locations (name, address, city),
        supplier_products (
          *,
          suppliers (name, contact_email),
          products (name, category, sku, image_url)
        ),
        inventory_transactions (
          *,
          performed_by_user:users!inventory_transactions_performed_by_fkey (full_name, email)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    res.json({ inventoryItem });

  } catch (error) {
    logger.error('Get inventory item error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update inventory stock level
router.patch('/:id/stock', authenticateToken, requireWarehouse, async (req, res) => {
  try {
    const { id } = req.params;
    const { stock_level, notes } = req.body;

    if (typeof stock_level !== 'number' || stock_level < 0) {
      return res.status(400).json({ error: 'Invalid stock level' });
    }

    // Get current inventory item
    const { data: currentItem, error: fetchError } = await supabase
      .from('inventory')
      .select('stock_level')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Inventory item not found' });
    }

    // Update stock level
    const { error: updateError } = await supabase
      .from('inventory')
      .update({ stock_level })
      .eq('id', id);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // Create inventory transaction
    const quantityChange = stock_level - currentItem.stock_level;
    const transactionType = quantityChange > 0 ? 'inbound' : 
                           quantityChange < 0 ? 'outbound' : 'adjustment';

    await supabase
      .from('inventory_transactions')
      .insert({
        inventory_id: id,
        transaction_type: transactionType,
        quantity_change: quantityChange,
        previous_stock: currentItem.stock_level,
        new_stock: stock_level,
        notes,
        performed_by: req.user.id
      });

    logger.info(`Inventory ${id} stock updated from ${currentItem.stock_level} to ${stock_level} by ${req.employee.email}`);

    res.json({ 
      message: 'Stock level updated successfully',
      previous_stock: currentItem.stock_level,
      new_stock: stock_level,
      change: quantityChange
    });

  } catch (error) {
    logger.error('Update inventory stock error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get inventory transactions
router.get('/:id/transactions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    const { data: transactions, error } = await supabase
      .from('inventory_transactions')
      .select(`
        *,
        performed_by_user:users!inventory_transactions_performed_by_fkey (full_name, email)
      `)
      .eq('inventory_id', id)
      .order('created_at', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ transactions });

  } catch (error) {
    logger.error('Get inventory transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;