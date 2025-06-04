import React from 'react';
import { Field, ErrorMessage } from 'formik';

const CustomerInfoStep = () => {
  return (
    <div className="space-y-6">
      <div>
        <label htmlFor="customerInfo.fullName" className="block text-sm font-medium text-gray-700 mb-1">
          Full Name
        </label>
        <Field
          type="text"
          name="customerInfo.fullName"
          id="customerInfo.fullName"
          className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
          placeholder="Enter customer's full name"
        />
        <ErrorMessage
          name="customerInfo.fullName"
          component="div"
          className="mt-1 text-sm text-red-600"
        />
      </div>

      <div>
        <label htmlFor="customerInfo.phone" className="block text-sm font-medium text-gray-700 mb-1">
          Phone Number
        </label>
        <Field
          type="tel"
          name="customerInfo.phone"
          id="customerInfo.phone"
          className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
          placeholder="+1234567890"
          pattern="[+]?[0-9]*"
          onKeyPress={(e: React.KeyboardEvent) => {
            if (!/[0-9+]/.test(e.key)) {
              e.preventDefault();
            }
          }}
        />
        <ErrorMessage
          name="customerInfo.phone"
          component="div"
          className="mt-1 text-sm text-red-600"
        />
      </div>

      <div>
        <label htmlFor="customerInfo.email" className="block text-sm font-medium text-gray-700 mb-1">
          Email Address
        </label>
        <Field
          type="email"
          name="customerInfo.email"
          id="customerInfo.email"
          className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
          placeholder="customer@example.com"
        />
        <ErrorMessage
          name="customerInfo.email"
          component="div"
          className="mt-1 text-sm text-red-600"
        />
      </div>
    </div>
  );
};

export default CustomerInfoStep;