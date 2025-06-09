import express from 'express';
import { supabase } from '../config/supabase.js';
import { authenticateToken, requireDriver } from '../middleware/auth.js';
import { logger } from '../utils/logger.js';

const router = express.Router();

// Get gas cards
router.get('/', authenticateToken, async (req, res) => {
  try {
    const { employee_id, status } = req.query;
    
    let query = supabase
      .from('gas_cards')
      .select(`
        *,
        employee:employees!gas_cards_employee_id_fkey (name, email, phone)
      `);

    // Apply filters based on user role
    if (req.employee.role === 'driver') {
      query = query.eq('employee_id', req.employee.id);
    } else if (employee_id) {
      query = query.eq('employee_id', employee_id);
    }

    if (status) query = query.eq('status', status);

    const { data: gasCards, error } = await query.order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ gasCards });

  } catch (error) {
    logger.error('Get gas cards error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single gas card
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    let query = supabase
      .from('gas_cards')
      .select(`
        *,
        employee:employees!gas_cards_employee_id_fkey (name, email, phone),
        gas_card_transactions (
          *
        )
      `)
      .eq('id', id);

    // Apply access control
    if (req.employee.role === 'driver') {
      query = query.eq('employee_id', req.employee.id);
    }

    const { data: gasCard, error } = await query.single();

    if (error) {
      return res.status(404).json({ error: 'Gas card not found' });
    }

    res.json({ gasCard });

  } catch (error) {
    logger.error('Get gas card error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create gas card transaction
router.post('/:id/transactions', authenticateToken, requireDriver, async (req, res) => {
  try {
    const { id } = req.params;
    const { transaction_type, amount, merchant_name, location, fuel_type, fuel_quantity_liters, odometer_reading } = req.body;

    // Get current gas card
    const { data: gasCard, error: cardError } = await supabase
      .from('gas_cards')
      .select('*')
      .eq('id', id)
      .eq('employee_id', req.employee.id) // Ensure driver can only use their own card
      .single();

    if (cardError || !gasCard) {
      return res.status(404).json({ error: 'Gas card not found' });
    }

    if (gasCard.status !== 'active') {
      return res.status(400).json({ error: 'Gas card is not active' });
    }

    // Calculate new balance
    let newBalance = gasCard.balance;
    if (transaction_type === 'purchase') {
      if (gasCard.balance < amount) {
        return res.status(400).json({ error: 'Insufficient balance' });
      }
      newBalance = gasCard.balance - amount;
    } else if (transaction_type === 'credit') {
      newBalance = gasCard.balance + amount;
    }

    // Create transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('gas_card_transactions')
      .insert({
        gas_card_id: id,
        transaction_type,
        amount,
        previous_balance: gasCard.balance,
        new_balance: newBalance,
        merchant_name,
        location,
        fuel_type,
        fuel_quantity_liters,
        odometer_reading
      })
      .select()
      .single();

    if (transactionError) {
      return res.status(400).json({ error: transactionError.message });
    }

    // Update gas card balance
    await supabase
      .from('gas_cards')
      .update({ 
        balance: newBalance,
        last_used_at: new Date().toISOString(),
        last_used_location: location
      })
      .eq('id', id);

    logger.info(`Gas card transaction created: ${transaction_type} ${amount} by ${req.employee.email}`);

    res.status(201).json({
      message: 'Transaction created successfully',
      transaction
    });

  } catch (error) {
    logger.error('Create gas card transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get gas card transactions
router.get('/:id/transactions', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 50, offset = 0 } = req.query;

    // Check access
    if (req.employee.role === 'driver') {
      const { data: gasCard } = await supabase
        .from('gas_cards')
        .select('employee_id')
        .eq('id', id)
        .single();

      if (!gasCard || gasCard.employee_id !== req.employee.id) {
        return res.status(403).json({ error: 'Access denied' });
      }
    }

    const { data: transactions, error } = await supabase
      .from('gas_card_transactions')
      .select('*')
      .eq('gas_card_id', id)
      .order('transaction_timestamp', { ascending: false })
      .range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ transactions });

  } catch (error) {
    logger.error('Get gas card transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;