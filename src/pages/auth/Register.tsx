import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package } from 'lucide-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { supabase } from '../../lib/supabase';

const validationSchema = Yup.object().shape({
  storeName: Yup.string().required('Store name is required'),
  storeAddress: Yup.string().required('Store address is required'),
  storeCity: Yup.string().required('City is required'),
  storeRegion: Yup.string().required('Region is required'),
  storeCountry: Yup.string().required('Country is required'),
  storePhone: Yup.string()
    .matches(/^\+?[0-9\s-()]+$/, 'Invalid phone number format')
    .required('Phone is required'),
  storeEmail: Yup.string().email('Invalid email').required('Email is required'),
  adminName: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .required('Admin name is required'),
  adminEmail: Yup.string().email('Invalid email').required('Email is required'),
  adminPassword: Yup.string()
    .min(8, 'Password must be at least 8 characters')
    .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
    .matches(/[0-9]/, 'Password must contain at least one number')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('adminPassword')], 'Passwords must match')
    .required('Confirm password is required'),
});

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: { adminEmail: string; adminPassword: string }) => {
    try {
      setIsSubmitting(true);
      setError(null);

      // In demo mode, just sign in with the provided credentials
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: values.adminEmail,
        password: values.adminPassword,
      });

      if (signInError) {
        throw signInError;
      }

      navigate('/');
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Package className="text-blue-600" size={48} />
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Create Store Account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Set up your store and admin account
        </p>
        <p className="mt-2 text-center text-sm text-amber-600">
          Demo Mode: All registrations will succeed
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white py-8 px-4 shadow-xl sm:rounded-lg sm:px-10">
          <Formik
            initialValues={{
              storeName: '',
              storeAddress: '',
              storeCity: '',
              storeRegion: '',
              storeCountry: '',
              storePhone: '',
              storeEmail: '',
              adminName: '',
              adminEmail: '',
              adminPassword: '',
              confirmPassword: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ isSubmitting: formSubmitting }) => (
              <Form className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Store Information</h3>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="storeName" className="block text-sm font-medium text-gray-700">
                        Store Name
                      </label>
                      <Field
                        type="text"
                        name="storeName"
                        className="mt-1 block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your store name"
                      />
                      <ErrorMessage name="storeName" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="storeAddress" className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <Field
                        type="text"
                        name="storeAddress"
                        className="mt-1 block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter store address"
                      />
                      <ErrorMessage name="storeAddress" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="storeCity" className="block text-sm font-medium text-gray-700">
                        City
                      </label>
                      <Field
                        type="text"
                        name="storeCity"
                        className="mt-1 block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter city"
                      />
                      <ErrorMessage name="storeCity" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="storeRegion" className="block text-sm font-medium text-gray-700">
                        Region
                      </label>
                      <Field
                        type="text"
                        name="storeRegion"
                        className="mt-1 block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter region"
                      />
                      <ErrorMessage name="storeRegion" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="storeCountry" className="block text-sm font-medium text-gray-700">
                        Country
                      </label>
                      <Field
                        type="text"
                        name="storeCountry"
                        className="mt-1 block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter country"
                      />
                      <ErrorMessage name="storeCountry" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="storePhone" className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <Field
                        type="text"
                        name="storePhone"
                        className="mt-1 block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+380 XX XXX XXXX"
                      />
                      <ErrorMessage name="storePhone" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="storeEmail" className="block text-sm font-medium text-gray-700">
                        Store Email
                      </label>
                      <Field
                        type="email"
                        name="storeEmail"
                        className="mt-1 block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="store@example.com"
                      />
                      <ErrorMessage name="storeEmail" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Admin Account</h3>
                  <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                      <label htmlFor="adminName" className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <Field
                        type="text"
                        name="adminName"
                        className="mt-1 block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter your full name"
                      />
                      <ErrorMessage name="adminName" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div className="sm:col-span-2">
                      <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700">
                        Admin Email
                      </label>
                      <Field
                        type="email"
                        name="adminEmail"
                        className="mt-1 block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="admin@example.com"
                      />
                      <ErrorMessage name="adminEmail" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700">
                        Password
                      </label>
                      <Field
                        type="password"
                        name="adminPassword"
                        className="mt-1 block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="••••••••"
                      />
                      <ErrorMessage name="adminPassword" component="div" className="mt-1 text-sm text-red-600" />
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                        Confirm Password
                      </label>
                      <Field
                        type="password"
                        name="confirmPassword"
                        className="mt-1 block w-full h-12 rounded-lg border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        placeholder="••••••••"
                      />
                      <ErrorMessage name="confirmPassword" component="div" className="mt-1 text-sm text-red-600" />
                    </div>
                  </div>
                </div>

                {error && (
                  <div className="rounded-md bg-red-50 p-4">
                    <div className="flex">
                      <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Registration Error</h3>
                        <div className="mt-2 text-sm text-red-700">
                          <p>{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex flex-col space-y-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || formSubmitting}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </button>

                  <button
                    type="button"
                    onClick={() => navigate('/login')}
                    className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Already have an account? Sign in
                  </button>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default Register;