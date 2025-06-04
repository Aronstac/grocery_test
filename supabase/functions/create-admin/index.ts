import { createClient } from 'npm:@supabase/supabase-js@2.39.7';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

interface CreateAdminRequest {
  storeName: string;
  storeAddress: string;
  storeCity: string;
  storeState: string;
  storeCountry: string;
  storePhone: string;
  storeEmail: string;
  adminEmail: string;
  adminName: string;
  adminPassword: string;
}

Deno.serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const body: CreateAdminRequest = await req.json();

    // Check if admin email already exists in auth.users
    const { data: existingUser } = await supabase.auth.admin.listUsers();
    if (existingUser?.users.some(user => user.email === body.adminEmail)) {
      throw new Error('An account with this email already exists');
    }

    // Create store
    const { data: store, error: storeError } = await supabase
      .from('stores')
      .insert({
        name: body.storeName,
        address: body.storeAddress,
        city: body.storeCity,
        state: body.storeState,
        country: body.storeCountry,
        phone: body.storePhone,
        email: body.storeEmail,
      })
      .select()
      .single();

    if (storeError) {
      console.error('Store creation error:', storeError);
      throw new Error(`Failed to create store: ${storeError.message}`);
    }

    // Create admin user in Auth
    const { data: auth, error: authError } = await supabase.auth.admin.createUser({
      email: body.adminEmail,
      password: body.adminPassword,
      email_confirm: true,
    });

    if (authError) {
      // Rollback store creation
      await supabase.from('stores').delete().eq('id', store.id);
      console.error('Auth user creation error:', authError);
      throw new Error(`Failed to create admin user: ${authError.message}`);
    }

    // Create employee record
    const { error: employeeError } = await supabase
      .from('employees')
      .insert({
        id: auth.user.id,
        name: body.adminName,
        email: body.adminEmail,
        position: 'Store Manager',
        department: 'Management',
        role: 'admin',
        store_id: store.id,
        start_date: new Date().toISOString().split('T')[0],
        status: 'active',
      });

    if (employeeError) {
      // Rollback store and auth user creation
      await supabase.from('stores').delete().eq('id', store.id);
      await supabase.auth.admin.deleteUser(auth.user.id);
      console.error('Employee record creation error:', employeeError);
      throw new Error(`Failed to create employee record: ${employeeError.message}`);
    }

    return new Response(
      JSON.stringify({
        message: 'Admin account created successfully',
        store: store,
        user: auth.user,
      }),
      {
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
      }),
      {
        status: 400,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders,
        },
      }
    );
  }
});