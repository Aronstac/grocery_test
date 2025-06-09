import express from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { authenticateToken, requireAdmin, requireLogistics } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get all employees
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { role, status, department } = req.query;
    
    let query = supabase
      .from('employees')
      .select(`
        *,
        stores (name, city, country)
      `)
      .eq('store_id', req.employee.store_id);

    if (role) query = query.eq('role', role);
    if (status) query = query.eq('status', status);
    if (department) query = query.eq('department', department);

    const { data: employees, error } = await query.order('name');

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ employees });

  } catch (error) {
    logger.error('Get employees error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single employee
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: employee, error } = await supabase
      .from('employees')
      .select(`
        *,
        stores (name, address, city, country),
        gas_cards (*),
        employee_shifts (
          *
        )
      `)
      .eq('id', id)
      .eq('store_id', req.employee.store_id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.json({ employee });

  } catch (error) {
    logger.error('Get employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update employee
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Check permissions
    if (req.employee.id !== id && !['admin', 'logistics_specialist'].includes(req.employee.role)) {
      return res.status(403).json({ error: 'You can only update your own profile' });
    }

    // Remove sensitive fields that shouldn't be updated directly
    delete updateData.id;
    delete updateData.created_at;
    delete updateData.updated_at;
    delete updateData.store_id; // Prevent store changes

    // Only admins can change roles and status
    if (req.employee.role !== 'admin') {
      delete updateData.role;
      delete updateData.status;
      delete updateData.salary;
      delete updateData.hourly_rate;
    }

    const { data: employee, error } = await supabase
      .from('employees')
      .update(updateData)
      .eq('id', id)
      .eq('store_id', req.employee.store_id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    logger.info(`Employee ${id} updated by ${req.employee.email}`);

    res.json({
      message: 'Employee updated successfully',
      employee
    });

  } catch (error) {
    logger.error('Update employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete employee
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    // Can't delete yourself
    if (req.employee.id === id) {
      return res.status(400).json({ error: 'You cannot delete your own account' });
    }

    // Delete from auth.users (this will cascade to employees table)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(id);

    if (authError) {
      logger.error('Auth user deletion error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    logger.info(`Employee ${id} deleted by ${req.employee.email}`);

    res.json({ message: 'Employee deleted successfully' });

  } catch (error) {
    logger.error('Delete employee error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get employee shifts
router.get('/:id/shifts', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { date_from, date_to, status } = req.query;

    // Check permissions
    if (req.employee.id !== id && !['admin', 'logistics_specialist'].includes(req.employee.role)) {
      return res.status(403).json({ error: 'You can only view your own shifts' });
    }

    let query = supabase
      .from('employee_shifts')
      .select('*')
      .eq('employee_id', id);

    if (date_from) query = query.gte('shift_date', date_from);
    if (date_to) query = query.lte('shift_date', date_to);
    if (status) query = query.eq('status', status);

    const { data: shifts, error } = await query.order('shift_date', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ shifts });

  } catch (error) {
    logger.error('Get employee shifts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create employee shift
router.post('/:id/shifts', authenticateToken, requireLogistics, async (req, res) => {
  try {
    const { id } = req.params;
    const { shift_date, start_time, end_time, break_duration_minutes, notes } = req.body;

    // Verify employee exists and is in same store
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select('id')
      .eq('id', id)
      .eq('store_id', req.employee.store_id)
      .single();

    if (employeeError || !employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const { data: shift, error } = await supabase
      .from('employee_shifts')
      .insert({
        employee_id: id,
        shift_date,
        start_time,
        end_time,
        break_duration_minutes: break_duration_minutes || 0,
        notes
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    logger.info(`Shift created for employee ${id} by ${req.employee.email}`);

    res.status(201).json({
      message: 'Shift created successfully',
      shift
    });

  } catch (error) {
    logger.error('Create shift error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update shift status
router.patch('/shifts/:shiftId/status', authenticateToken, async (req, res) => {
  try {
    const { shiftId } = req.params;
    const { status, actual_start_time, actual_end_time, notes } = req.body;

    // Get shift details
    const { data: shift, error: shiftError } = await supabase
      .from('employee_shifts')
      .select('employee_id')
      .eq('id', shiftId)
      .single();

    if (shiftError || !shift) {
      return res.status(404).json({ error: 'Shift not found' });
    }

    // Check permissions
    if (req.employee.id !== shift.employee_id && !['admin', 'logistics_specialist'].includes(req.employee.role)) {
      return res.status(403).json({ error: 'You can only update your own shifts' });
    }

    const updateData = { status };
    if (actual_start_time) updateData.actual_start_time = actual_start_time;
    if (actual_end_time) updateData.actual_end_time = actual_end_time;
    if (notes) updateData.notes = notes;

    const { error } = await supabase
      .from('employee_shifts')
      .update(updateData)
      .eq('id', shiftId);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    logger.info(`Shift ${shiftId} status updated to ${status} by ${req.employee.email}`);

    res.json({ message: 'Shift status updated successfully' });

  } catch (error) {
    logger.error('Update shift status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;