import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireLogistics } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get dashboard analytics
router.get('/dashboard', authenticateToken, async (req, res) => {
  try {
    const { date_from, date_to } = req.query;
    
    // Get basic counts
    const [
      { data: products },
      { data: deliveries },
      { data: employees },
      { data: lowStockProducts }
    ] = await Promise.all([
      supabase.from('products').select('id', { count: 'exact' }).eq('is_active', true),
      supabase.from('deliveries').select('id, total_amount, status', { count: 'exact' }),
      supabase.from('employees').select('id', { count: 'exact' }).eq('status', 'active'),
      supabase.from('products').select('id', { count: 'exact' }).lt('stock', supabase.raw('reorder_level'))
    ]);

    // Calculate revenue from deliveries
    const totalRevenue = deliveries?.reduce((sum, delivery) => {
      return sum + (delivery.total_amount || 0);
    }, 0) || 0;

    const pendingDeliveries = deliveries?.filter(d => d.status === 'pending').length || 0;

    // Generate mock daily revenue for the last 7 days
    const dailyRevenue = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const baseRevenue = 3000 + Math.random() * 1000;
      const expenses = baseRevenue * (0.6 + Math.random() * 0.2);
      
      dailyRevenue.push({
        date: date.toISOString().split('T')[0],
        revenue: Math.round(baseRevenue * 100) / 100,
        expenses: Math.round(expenses * 100) / 100,
        profit: Math.round((baseRevenue - expenses) * 100) / 100
      });
    }

    // Generate mock monthly sales
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'];
    const monthlySales = months.map(month => ({
      month,
      revenue: Math.round((75000 + Math.random() * 25000) * 100) / 100
    }));

    // Generate mock category sales
    const categories = [
      'Fruits & Vegetables',
      'Dairy',
      'Bakery',
      'Meat & Seafood',
      'Beverages'
    ];
    
    const topSellingCategories = categories.map(category => ({
      category,
      sales: Math.round((15000 + Math.random() * 15000) * 100) / 100
    }));

    res.json({
      stats: {
        totalProducts: products?.length || 0,
        totalDeliveries: deliveries?.length || 0,
        activeEmployees: employees?.length || 0,
        lowStockItems: lowStockProducts?.length || 0,
        totalRevenue: Math.round(totalRevenue * 100) / 100,
        pendingDeliveries,
        todaysRevenue: dailyRevenue[dailyRevenue.length - 1]?.revenue || 0
      },
      charts: {
        dailyRevenue,
        monthlySales,
        topSellingCategories
      }
    });

  } catch (error) {
    logger.error('Get dashboard analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;