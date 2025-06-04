import React from 'react';
import { useFormikContext } from 'formik';
import { useAppContext } from '../../../context/AppContext';
import { format } from 'date-fns';

const ReviewStep = () => {
  const { values } = useFormikContext<any>();
  const { products } = useAppContext();

  const calculateTotal = () => {
    return values.orderDetails.items.reduce((total: number, item: any) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h3>
        
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-medium text-gray-700">Customer Information</h4>
            <div className="mt-2 text-sm text-gray-600">
              <p>{values.customerInfo.fullName}</p>
              <p>{values.customerInfo.email}</p>
              <p>{values.customerInfo.phone}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700">Delivery Location</h4>
            <div className="mt-2 text-sm text-gray-600">
              <p>{values.location.address}</p>
              {values.location.unit && <p>Unit: {values.location.unit}</p>}
              {values.location.accessInstructions && (
                <p className="mt-1 italic">
                  Note: {values.location.accessInstructions}
                </p>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700">Delivery Time</h4>
            <div className="mt-2 text-sm text-gray-600">
              <p>{format(values.timeSlot.date, 'MMMM d, yyyy')}</p>
              <p>Time Slot: {values.timeSlot.slot}</p>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium text-gray-700">Order Items</h4>
            <div className="mt-2">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th className="text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase">Qty</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase">Price</th>
                    <th className="text-right text-xs font-medium text-gray-500 uppercase">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {values.orderDetails.items.map((item: any, index: number) => {
                    const product = products.find(p => p.id === item.productId);
                    return (
                      <tr key={index}>
                        <td className="py-2 text-sm text-gray-900">{product?.name}</td>
                        <td className="py-2 text-sm text-gray-900 text-right">{item.quantity}</td>
                        <td className="py-2 text-sm text-gray-900 text-right">
                          ${product?.price.toFixed(2)}
                        </td>
                        <td className="py-2 text-sm text-gray-900 text-right">
                          ${((product?.price || 0) * item.quantity).toFixed(2)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan={3}className="py-2 text-sm font-medium text-gray-900 text-right">
                      Total
                    </td>
                    <td className="py-2 text-sm font-medium text-gray-900 text-right">
                      ${calculateTotal().toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {values.orderDetails.specialHandling && (
            <div>
              <h4 className="text-sm font-medium text-gray-700">Special Instructions</h4>
              <p className="mt-2 text-sm text-gray-600">{values.orderDetails.specialHandling}</p>
            </div>
          )}

          <div>
            <h4 className="text-sm font-medium text-gray-700">Temperature Requirements</h4>
            <p className="mt-2 text-sm text-gray-600 capitalize">{values.orderDetails.temperature}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewStep;