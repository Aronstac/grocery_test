import express from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import { validateRequest, schemas } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';
import { sendInvitationEmail } from '../services/emailService.js';

const router = express.Router();

// Create invitation
router.post('/', authenticateToken, requireAdmin, validateRequest(schemas.createInvitation), async (req, res) => {
  try {
    const { email, role, store_id } = req.validated.body;
    const invitedBy = req.employee.id;

    // Check if user already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    if (existingUser?.users.some(user => user.email === email)) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Check if invitation already exists
    const { data: existingInvitation } = await supabase
      .from('invitations')
      .select('*')
      .eq('email', email)
      .eq('status', 'pending')
      .single();

    if (existingInvitation) {
      return res.status(400).json({ error: 'Pending invitation already exists for this email' });
    }

    // Create invitation
    const token = `inv_${uuidv4()}`;
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const { data: invitation, error } = await supabase
      .from('invitations')
      .insert({
        email,
        role,
        store_id,
        invited_by: invitedBy,
        token,
        expires_at: expiresAt.toISOString()
      })
      .select(`
        *,
        stores (name),
        invited_by_employee:employees!invitations_invited_by_fkey (name)
      `)
      .single();

    if (error) {
      logger.error('Invitation creation error:', error);
      return res.status(400).json({ error: error.message });
    }

    // Send invitation email
    try {
      await sendInvitationEmail(email, token, invitation.stores.name, role);
    } catch (emailError) {
      logger.error('Failed to send invitation email:', emailError);
      // Don't fail the request if email fails
    }

    logger.info(`Invitation created for ${email} by ${req.employee.email}`);

    res.status(201).json({
      message: 'Invitation created successfully',
      invitation: {
        id: invitation.id,
        email: invitation.email,
        role: invitation.role,
        status: invitation.status,
        expires_at: invitation.expires_at
      }
    });

  } catch (error) {
    logger.error('Create invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Accept invitation
router.post('/accept', validateRequest(z.object({
  body: z.object({
    token: z.string().min(1),
    password: z.string().min(8),
    name: z.string().min(1),
    phone: z.string().optional()
  })
})), async (req, res) => {
  try {
    const { token, password, name, phone } = req.validated.body;

    // Find invitation
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select(`
        *,
        stores (name)
      `)
      .eq('token', token)
      .eq('status', 'pending')
      .single();

    if (invitationError || !invitation) {
      return res.status(404).json({ error: 'Invalid or expired invitation' });
    }

    // Check if invitation is expired
    if (new Date(invitation.expires_at) < new Date()) {
      return res.status(400).json({ error: 'Invitation has expired' });
    }

    // Create user account
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: invitation.email,
      password,
      email_confirm: true
    });

    if (authError) {
      logger.error('User creation error:', authError);
      return res.status(400).json({ error: authError.message });
    }

    // Create employee record
    const { error: employeeError } = await supabaseAdmin
      .from('employees')
      .insert({
        id: authData.user.id,
        name,
        email: invitation.email,
        phone,
        position: invitation.role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        department: getDepartmentByRole(invitation.role),
        role: invitation.role,
        store_id: invitation.store_id,
        status: 'active'
      });

    if (employeeError) {
      // Rollback user creation
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      logger.error('Employee creation error:', employeeError);
      return res.status(400).json({ error: employeeError.message });
    }

    // Update invitation status
    await supabase
      .from('invitations')
      .update({
        status: 'accepted',
        accepted_at: new Date().toISOString()
      })
      .eq('id', invitation.id);

    logger.info(`Invitation accepted by ${invitation.email}`);

    res.json({
      message: 'Invitation accepted successfully',
      user: {
        id: authData.user.id,
        email: authData.user.email
      }
    });

  } catch (error) {
    logger.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get invitations (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { data: invitations, error } = await supabase
      .from('invitations')
      .select(`
        *,
        stores (name),
        invited_by_employee:employees!invitations_invited_by_fkey (name, email)
      `)
      .eq('store_id', req.employee.store_id)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ invitations });

  } catch (error) {
    logger.error('Get invitations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete invitation
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from('invitations')
      .delete()
      .eq('id', id)
      .eq('store_id', req.employee.store_id); // Ensure admin can only delete from their store

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Invitation deleted successfully' });

  } catch (error) {
    logger.error('Delete invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

function getDepartmentByRole(role) {
  const departments = {
    'admin': 'Management',
    'logistics_specialist': 'Logistics',
    'driver': 'Logistics',
    'warehouse_worker': 'Warehouse'
  };
  return departments[role] || 'General';
}

export default router;