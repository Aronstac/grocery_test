import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireLogistics, requireDriver } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all deliveries
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { status, driver_id, date_from, date_to } = req.query;
    
    let query = supabase
      .from('deliveries')
      .select(`
        *,
        suppliers (name, contact_email, contact_phone),
        stores (name, address, city),
        driver:employees!deliveries_driver_id_fkey (name, email, phone),
        delivery_items (
          *,
          products (name, sku, category)
        )
      `);

    // Apply filters based on user role
    if (req.employee.role === 'driver') {
      query = query.eq('driver_id', req.employee.id);
    } else {
      query = query.eq('store_id', req.employee.store_id);
    }

    if (status) query = query.eq('status', status);
    if (driver_id) query = query.eq('driver_id', driver_id);
    if (date_from) query = query.gte('expected_date', date_from);
    if (date_to) query = query.lte('expected_date', date_to);

    const { data: deliveries, error } = await query.order('expected_date', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ deliveries });

  } catch (error) {
    logger.error('Get deliveries error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single delivery
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    let query = supabase
      .from('deliveries')
      .select(`
        *,
        suppliers (name, contact_email, contact_phone, address, city),
        stores (name, address, city),
        driver:employees!deliveries_driver_id_fkey (name, email, phone),
        delivery_items (
          *,
          products (name, sku, category, image_url)
        ),
        delivery_events (
          *,
          created_by_employee:employees!delivery_events_created_by_fkey (name)
        )
      `)
      .eq('id', id);

    // Apply access control
    if (req.employee.role === 'driver') {
      query = query.eq('driver_id', req.employee.id);
    } else {
      query = query.eq('store_id', req.employee.store_id);
    }

    const { data: delivery, error } = await query.single();

    if (error) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    res.json({ delivery });

  } catch (error) {
    logger.error('Get delivery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create delivery
router.post('/', authenticateToken, requireLogistics, validateRequest(schemas.createDelivery), async (req, res) => {
  try {
    const { supplier_id, store_id, expected_date, priority, special_instructions, items } = req.validated.body;

    // Generate delivery number
    const deliveryNumber = `DEL-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Get supplier name
    const { data: supplier } = await supabase
      .from('suppliers')
      .select('name')
      .eq('id', supplier_id)
      .single();

    // Calculate total amount
    const totalAmount = items.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0);

    // Create delivery
    const { data: delivery, error: deliveryError } = await supabase
      .from('deliveries')
      .insert({
        delivery_number: deliveryNumber,
        supplier_id,
        supplier_name: supplier?.name || 'Unknown Supplier',
        store_id,
        expected_date,
        priority,
        special_instructions,
        total_amount: totalAmount,
        total_items: items.length,
        status: 'pending'
      })
      .select()
      .single();

    if (deliveryError) {
      return res.status(400).json({ error: deliveryError.message });
    }

    // Create delivery items
    const deliveryItems = items.map(item => ({
      delivery_id: delivery.id,
      product_id: item.product_id,
      quantity: item.quantity,
      unit_price: item.unit_price
    }));

    const { error: itemsError } = await supabase
      .from('delivery_items')
      .insert(deliveryItems);

    if (itemsError) {
      // Rollback delivery creation
      await supabase.from('deliveries').delete().eq('id', delivery.id);
      return res.status(400).json({ error: itemsError.message });
    }

    // Create delivery event
    await supabase
      .from('delivery_events')
      .insert({
        delivery_id: delivery.id,
        event_type: 'created',
        event_status: 'completed',
        notes: 'Delivery order created',
        created_by: req.employee.id
      });

    logger.info(`Delivery ${deliveryNumber} created by ${req.employee.email}`);

    res.status(201).json({
      message: 'Delivery created successfully',
      delivery
    });

  } catch (error) {
    logger.error('Create delivery error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update delivery status
router.patch('/:id/status', authenticateToken, validateRequest(schemas.updateDeliveryStatus), async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes, actual_delivery_date } = req.validated.body;

    // Check if user can update this delivery
    const { data: delivery, error: fetchError } = await supabase
      .from('deliveries')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError) {
      return res.status(404).json({ error: 'Delivery not found' });
    }

    // Access control
    if (req.employee.role === 'driver' && delivery.driver_id !== req.employee.id) {
      return res.status(403).json({ error: 'You can only update your assigned deliveries' });
    }

    if (!['admin', 'logistics_specialist', 'driver'].includes(req.employee.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Update delivery
    const updateData = { status, notes };
    if (actual_delivery_date) {
      updateData.actual_delivery_date = actual_delivery_date;
    }

    const { error: updateError } = await supabase
      .from('deliveries')
      .update(updateData)
      .eq('id', id);

    if (updateError) {
      return res.status(400).json({ error: updateError.message });
    }

    // Create delivery event
    await supabase
      .from('delivery_events')
      .insert({
        delivery_id: id,
        event_type: status,
        event_status: 'completed',
        notes: notes || `Status updated to ${status}`,
        created_by: req.employee.id
      });

    logger.info(`Delivery ${id} status updated to ${status} by ${req.employee.email}`);

    res.json({ message: 'Delivery status updated successfully' });

  } catch (error) {
    logger.error('Update delivery status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Assign driver to delivery
router.patch('/:id/assign-driver', authenticateToken, requireLogistics, async (req, res) => {
  try {
    const { id } = req.params;
    const { driver_id } = req.body;

    // Verify driver exists and is in the same store
    const { data: driver, error: driverError } = await supabase
      .from('employees')
      .select('*')
      .eq('id', driver_id)
      .eq('role', 'driver')
      .eq('store_id', req.employee.store_id)
      .single();

    if (driverError || !driver) {
      return res.status(404).json({ error: 'Driver not found' });
    }

    // Update delivery
    const { error } = await supabase
      .from('deliveries')
      .update({ driver_id })
      .eq('id', id)
      .eq('store_id', req.employee.store_id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Create delivery event
    await supabase
      .from('delivery_events')
      .insert({
        delivery_id: id,
        event_type: 'dispatched',
        event_status: 'completed',
        notes: `Driver ${driver.name} assigned`,
        created_by: req.employee.id
      });

    logger.info(`Driver ${driver.name} assigned to delivery ${id} by ${req.employee.email}`);

    res.json({ message: 'Driver assigned successfully' });

  } catch (error) {
    logger.error('Assign driver error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;