import React, { useState, useEffect } from 'react';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { format } from 'date-fns';
import { ChevronRight, ChevronLeft, Save, Truck, User, MapPin, Clock, Package, Store } from 'lucide-react';
import { useAppContext } from '../../context/AppContext';
import CustomerInfoStep from './wizard/CustomerInfoStep';
import ProductSelectionStep from './wizard/ProductSelectionStep';
import SupplierSelectionStep from './wizard/SupplierSelectionStep';
import LocationStep from './wizard/LocationStep';
import TimeSlotStep from './wizard/TimeSlotStep';
import OrderDetailsStep from './wizard/OrderDetailsStep';
import ReviewStep from './wizard/ReviewStep';

interface DeliveryWizardProps {
  onClose: () => void;
}

const generateDeliveryId = () => {
  const date = format(new Date(), 'yyyyMMdd');
  const random = Math.floor(1000 + Math.random() * 9000);
  return `DEL-${date}-${random}`;
};

const DeliveryWizard: React.FC<DeliveryWizardProps> = ({ onClose }) => {
  const { products, addDelivery } = useAppContext();
  const [currentStep, setCurrentStep] = useState(1);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  const validationSchema = Yup.object().shape({
    customerInfo: Yup.object().shape({
      fullName: Yup.string().min(2).max(50).required('Full name is required'),
      phone: Yup.string().matches(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number').required('Phone is required'),
      email: Yup.string().email('Invalid email').required('Email is required'),
    }),
    selectedProduct: Yup.object().shape({
      id: Yup.string().required('Product selection is required'),
      name: Yup.string().required('Product name is required'),
      stock: Yup.number().required('Stock information is required'),
    }),
    supplier: Yup.object().shape({
      id: Yup.string().required('Supplier selection is required'),
      name: Yup.string().required('Supplier name is required'),
      price: Yup.number().required('Price is required'),
    }),
    location: Yup.object().shape({
      address: Yup.string().required('Address is required'),
      unit: Yup.string(),
      accessInstructions: Yup.string(),
      coordinates: Yup.object().shape({
        lat: Yup.number().required('Latitude is required'),
        lng: Yup.number().required('Longitude is required'),
      }),
    }),
    timeSlot: Yup.object().shape({
      date: Yup.date().min(new Date(Date.now() + 24 * 60 * 60 * 1000), 'Date must be at least 24h in advance').required('Date is required'),
      slot: Yup.string().required('Time slot is required'),
    }),
    orderDetails: Yup.object().shape({
      items: Yup.array().of(
        Yup.object().shape({
          productId: Yup.string().required('Product is required'),
          quantity: Yup.number().min(1).required('Quantity is required'),
        })
      ).min(1, 'At least one item is required'),
      specialHandling: Yup.string(),
      temperature: Yup.string(),
    }),
    priority: Yup.string().oneOf(['standard', 'express', 'premium']).required('Priority is required'),
  });

  const initialValues = {
    deliveryId: generateDeliveryId(),
    customerInfo: {
      fullName: '',
      phone: '',
      email: '',
    },
    selectedProduct: {
      id: '',
      name: '',
      stock: 0,
      category: '',
    },
    supplier: {
      id: '',
      name: '',
      price: 0,
    },
    location: {
      address: '',
      unit: '',
      accessInstructions: '',
      coordinates: {
        lat: 0,
        lng: 0,
      },
    },
    timeSlot: {
      date: new Date(Date.now() + 24 * 60 * 60 * 1000),
      slot: '',
    },
    orderDetails: {
      items: [],
      specialHandling: '',
      temperature: 'ambient',
    },
    priority: 'standard',
  };

  const steps = [
    { number: 1, title: 'Customer Info', icon: <User size={20} />, component: CustomerInfoStep },
    { number: 2, title: 'Product', icon: <Package size={20} />, component: ProductSelectionStep },
    { number: 3, title: 'Supplier', icon: <Store size={20} />, component: SupplierSelectionStep },
    { number: 4, title: 'Location', icon: <MapPin size={20} />, component: LocationStep },
    { number: 5, title: 'Time Slot', icon: <Clock size={20} />, component: TimeSlotStep },
    { number: 6, title: 'Order Details', icon: <Package size={20} />, component: OrderDetailsStep },
    { number: 7, title: 'Review', icon: <Truck size={20} />, component: ReviewStep },
  ];

  const handleSubmit = async (values: any) => {
    try {
      await addDelivery({
        supplierId: values.supplier.id,
        supplierName: values.supplier.name,
        status: 'pending',
        expectedDate: values.timeSlot.date,
        totalAmount: calculateTotal(values.orderDetails.items),
        notes: values.orderDetails.specialHandling,
        items: values.orderDetails.items.map((item: any) => ({
          productId: item.productId,
          productName: products.find(p => p.id === item.productId)?.name || '',
          quantity: item.quantity,
          unitPrice: values.supplier.price,
          totalPrice: values.supplier.price * item.quantity,
        })),
      });
      onClose();
    } catch (error) {
      console.error('Failed to create delivery:', error);
    }
  };

  const calculateTotal = (items: any[]) => {
    return items.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product?.price || 0) * item.quantity;
    }, 0);
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={handleOverlayClick}
    >
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="p-6 border-b">
          <h2 className="text-2xl font-semibold">Create New Delivery</h2>
        </div>

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 180px)' }}>
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`flex items-center ${
                    currentStep === step.number
                      ? 'text-blue-600'
                      : currentStep > step.number
                      ? 'text-green-600'
                      : 'text-gray-400'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    currentStep === step.number
                      ? 'border-blue-600 bg-blue-50'
                      : currentStep > step.number
                      ? 'border-green-600 bg-green-50'
                      : 'border-gray-300'
                  }`}>
                    {step.icon}
                  </div>
                  <span className="ml-2 text-sm font-medium hidden md:block">{step.title}</span>
                  {step.number < steps.length && (
                    <div className="w-full h-1 mx-4 bg-gray-200">
                      <div
                        className={`h-full ${
                          currentStep > step.number ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ values, errors, touched, handleChange, setFieldValue }) => (
              <Form className="space-y-6">
                <CurrentStepComponent />

                <div className="mt-6 flex justify-between">
                  {currentStep > 1 && (
                    <button
                      type="button"
                      onClick={() => setCurrentStep(currentStep - 1)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      <ChevronLeft size={16} className="mr-1" />
                      Previous
                    </button>
                  )}
                  <div className="ml-auto flex space-x-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    {currentStep < steps.length ? (
                      <button
                        type="button"
                        onClick={() => setCurrentStep(currentStep + 1)}
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        Next
                        <ChevronRight size={16} className="ml-1" />
                      </button>
                    ) : (
                      <button
                        type="submit"
                        className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                      >
                        <Save size={16} className="mr-1" />
                        Create Delivery
                      </button>
                    )}
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </div>
    </div>
  );
};

export default DeliveryWizard;