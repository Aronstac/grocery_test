import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireLogistics } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get problem reports
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { type, status, priority, submitted_by } = req.query;
    
    let query = supabase
      .from('problem_reports')
      .select(`
        *,
        submitted_by_employee:employees!problem_reports_submitted_by_fkey (name, email),
        assigned_to_employee:employees!problem_reports_assigned_to_fkey (name, email),
        delivery:deliveries (delivery_number, supplier_name),
        product:products (name, sku)
      `);

    if (type) query = query.eq('type', type);
    if (status) query = query.eq('status', status);
    if (priority) query = query.eq('priority', priority);
    if (submitted_by) query = query.eq('submitted_by', submitted_by);

    const { data: reports, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ reports });

  } catch (error) {
    logger.error('Get reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single report
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const { data: report, error } = await supabase
      .from('problem_reports')
      .select(`
        *,
        submitted_by_employee:employees!problem_reports_submitted_by_fkey (name, email, phone),
        assigned_to_employee:employees!problem_reports_assigned_to_fkey (name, email),
        delivery:deliveries (delivery_number, supplier_name, expected_date),
        product:products (name, sku, category)
      `)
      .eq('id', id)
      .single();

    if (error) {
      return res.status(404).json({ error: 'Report not found' });
    }

    res.json({ report });

  } catch (error) {
    logger.error('Get report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create problem report
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { type, priority, title, description, location, delivery_id, product_id, images } = req.body;

    // Generate report number
    const reportNumber = `RPT-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    const { data: report, error } = await supabase
      .from('problem_reports')
      .insert({
        report_number: reportNumber,
        submitted_by: req.employee.id,
        type,
        priority: priority || 'medium',
        title,
        description,
        location,
        delivery_id,
        product_id,
        images,
        status: 'open'
      })
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    logger.info(`Problem report ${reportNumber} created by ${req.employee.email}`);

    res.status(201).json({
      message: 'Problem report created successfully',
      report
    });

  } catch (error) {
    logger.error('Create report error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update report status
router.patch('/:id/status', authenticateToken, requireLogistics, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, assigned_to, resolution, estimated_cost, actual_cost } = req.body;

    const updateData = { status };
    if (assigned_to) updateData.assigned_to = assigned_to;
    if (resolution) updateData.resolution = resolution;
    if (estimated_cost) updateData.estimated_cost = estimated_cost;
    if (actual_cost) updateData.actual_cost = actual_cost;
    if (status === 'resolved') updateData.resolved_at = new Date().toISOString();

    const { error } = await supabase
      .from('problem_reports')
      .update(updateData)
      .eq('id', id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    logger.info(`Report ${id} status updated to ${status} by ${req.employee.email}`);

    res.json({ message: 'Report status updated successfully' });

  } catch (error) {
    logger.error('Update report status error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get analytics data
router.get('/analytics/summary', authenticateToken, requireLogistics, async (req, res) => {
  try {
    const { date_from, date_to } = req.query;

    // Get basic counts
    const { data: totalReports } = await supabase
      .from('problem_reports')
      .select('id', { count: 'exact' });

    const { data: openReports } = await supabase
      .from('problem_reports')
      .select('id', { count: 'exact' })
      .eq('status', 'open');

    const { data: resolvedReports } = await supabase
      .from('problem_reports')
      .select('id', { count: 'exact' })
      .eq('status', 'resolved');

    // Get reports by type
    const { data: reportsByType } = await supabase
      .from('problem_reports')
      .select('type')
      .gte('created_at', date_from || '2024-01-01')
      .lte('created_at', date_to || new Date().toISOString());

    const typeStats = reportsByType?.reduce((acc, report) => {
      acc[report.type] = (acc[report.type] || 0) + 1;
      return acc;
    }, {});

    res.json({
      summary: {
        total: totalReports?.length || 0,
        open: openReports?.length || 0,
        resolved: resolvedReports?.length || 0
      },
      byType: typeStats || {}
    });

  } catch (error) {
    logger.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;