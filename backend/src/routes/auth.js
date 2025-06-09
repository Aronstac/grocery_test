import express from 'express';
import { supabase, supabaseAdmin } from '../config/supabase.js';
import { validateRequest, schemas } from '../middleware/validation.js';
import { logger } from '../utils/logger.js';
import { v4 as uuidv4 } from 'uuid';

const router = express.Router();

// Create admin account and store
router.post('/create-admin', validateRequest(z.object({
  body: z.object({
    storeName: z.string().min(1),
    storeAddress: z.string().min(1),
    storeCity: z.string().min(1),
    storeState: z.string().optional(),
    storeCountry: z.string().default('UA'),
    storePhone: z.string().optional(),
    storeEmail: z.string().email(),
    adminName: z.string().min(1),
    adminEmail: z.string().email(),
    adminPassword: z.string().min(8)
  })
})), async (req, res) => {
  try {
    const {
      storeName, storeAddress, storeCity, storeState, storeCountry,
      storePhone, storeEmail, adminName, adminEmail, adminPassword
    } = req.validated.body;

    // Check if admin email already exists
    const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
    if (existingUser?.users.some(user => user.email === adminEmail)) {
      return res.status(400).json({ error: 'An account with this email already exists' });
    }

    // Create store first
    const { data: store, error: storeError } = await supabaseAdmin
      .from('stores')
      .insert({
        name: storeName,
        address: storeAddress,
        city: storeCity,
        state: storeState,
        country: storeCountry,
        phone: storePhone,
        email: storeEmail
      })
      .select()
      .single();

    if (storeError) {
      logger.error('Store creation error:', storeError);
      throw new Error(`Failed to create store: ${storeError.message}`);
    }

    // Create admin user in Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true
    });

    if (authError) {
      // Rollback store creation
      await supabaseAdmin.from('stores').delete().eq('id', store.id);
      logger.error('Auth user creation error:', authError);
      throw new Error(`Failed to create admin user: ${authError.message}`);
    }

    // Create employee record
    const { error: employeeError } = await supabaseAdmin
      .from('employees')
      .insert({
        id: authData.user.id,
        name: adminName,
        email: adminEmail,
        position: 'Store Manager',
        department: 'Management',
        role: 'admin',
        store_id: store.id,
        status: 'active'
      });

    if (employeeError) {
      // Rollback store and auth user creation
      await supabaseAdmin.from('stores').delete().eq('id', store.id);
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      logger.error('Employee record creation error:', employeeError);
      throw new Error(`Failed to create employee record: ${employeeError.message}`);
    }

    logger.info(`Admin account created successfully for ${adminEmail}`);

    res.status(201).json({
      message: 'Admin account created successfully',
      store: {
        id: store.id,
        name: store.name
      },
      user: {
        id: authData.user.id,
        email: authData.user.email
      }
    });

  } catch (error) {
    logger.error('Create admin error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Sign in
router.post('/signin', validateRequest(z.object({
  body: z.object({
    email: z.string().email(),
    password: z.string().min(1)
  })
})), async (req, res) => {
  try {
    const { email, password } = req.validated.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(401).json({ error: error.message });
    }

    // Get employee details
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select(`
        *,
        stores (
          id,
          name,
          city,
          country
        )
      `)
      .eq('id', data.user.id)
      .single();

    if (employeeError) {
      logger.error('Employee fetch error:', employeeError);
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    res.json({
      user: data.user,
      session: data.session,
      employee: employee
    });

  } catch (error) {
    logger.error('Sign in error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sign out
router.post('/signout', async (req, res) => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: 'Signed out successfully' });
  } catch (error) {
    logger.error('Sign out error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get current user
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get employee details
    const { data: employee, error: employeeError } = await supabase
      .from('employees')
      .select(`
        *,
        stores (
          id,
          name,
          city,
          country
        )
      `)
      .eq('id', user.id)
      .single();

    if (employeeError) {
      return res.status(404).json({ error: 'Employee profile not found' });
    }

    res.json({
      user,
      employee
    });

  } catch (error) {
    logger.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;