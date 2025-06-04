import React from 'react';
import { Field, ErrorMessage, useFormikContext, FieldArray } from 'formik';
import { Plus, Minus, Trash2 } from 'lucide-react';
import { useAppContext } from '../../../context/AppContext';

const OrderDetailsStep = () => {
  const { products } = useAppContext();
  const { values, setFieldValue } = useFormikContext<any>();

  const temperatureOptions = [
    { value: 'ambient', label: 'Ambient' },
    { value: 'refrigerated', label: 'Refrigerated' },
    { value: 'frozen', label: 'Frozen' }
  ];

  return (
    <div className="space-y-6">
      <FieldArray name="orderDetails.items">
        {({ push, remove }) => (
          <div>
            <div className="flex justify-between items-center mb-4">
              <label className="block text-sm font-medium text-gray-700">
                Order Items
              </label>
              <button
                type="button"
                onClick={() => push({ productId: '', quantity: 1 })}
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <Plus size={16} className="mr-1" />
                Add Item
              </button>
            </div>

            {values.orderDetails.items.map((item: any, index: number) => (
              <div key={index} className="flex items-start space-x-4 mb-4">
                <div className="flex-1">
                  <Field
                    as="select"
                    name={`orderDetails.items.${index}.productId`}
                    className="block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
                  >
                    <option value="">Select a product</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.name} - ${product.price.toFixed(2)}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name={`orderDetails.items.${index}.productId`}
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                <div className="w-40">
                  <div className="flex items-center border rounded-md h-12">
                    <button
                      type="button"
                      onClick={() => {
                        const currentQty = values.orderDetails.items[index].quantity;
                        if (currentQty > 1) {
                          setFieldValue(`orderDetails.items.${index}.quantity`, currentQty - 1);
                        }
                      }}
                      className="p-3 text-gray-500 hover:text-gray-700"
                    >
                      <Minus size={16} />
                    </button>
                    <Field
                      type="number"
                      name={`orderDetails.items.${index}.quantity`}
                      className="w-20 text-center border-0 focus:ring-0 text-base"
                      min="1"
                      onKeyPress={(e: React.KeyboardEvent) => {
                        if (!/[0-9]/.test(e.key)) {
                          e.preventDefault();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const currentQty = values.orderDetails.items[index].quantity;
                        setFieldValue(`orderDetails.items.${index}.quantity`, currentQty + 1);
                      }}
                      className="p-3 text-gray-500 hover:text-gray-700"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                  <ErrorMessage
                    name={`orderDetails.items.${index}.quantity`}
                    component="div"
                    className="mt-1 text-sm text-red-600"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="p-3 text-red-500 hover:text-red-700"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </FieldArray>

      <div>
        <label htmlFor="orderDetails.temperature" className="block text-sm font-medium text-gray-700 mb-1">
          Temperature Requirements
        </label>
        <Field
          as="select"
          name="orderDetails.temperature"
          className="mt-1 block w-full h-12 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
        >
          {temperatureOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Field>
      </div>

      <div>
        <label htmlFor="orderDetails.specialHandling" className="block text-sm font-medium text-gray-700 mb-1">
          Special Handling Instructions
        </label>
        <Field
          as="textarea"
          name="orderDetails.specialHandling"
          rows={4}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-base"
          placeholder="Add any special handling instructions"
        />
      </div>
    </div>
  );
};

export default OrderDetailsStep;