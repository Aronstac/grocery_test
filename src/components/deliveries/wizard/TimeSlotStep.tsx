import React from 'react';
import { Field, ErrorMessage, useFormikContext } from 'formik';
import Datepicker from 'tailwind-datepicker-react';
import { addDays } from 'date-fns';
import { DeliveryWizardValues } from './types';

const TimeSlotStep = () => {
  const { setFieldValue } = useFormikContext<DeliveryWizardValues>();
  const [showDatePicker, setShowDatePicker] = React.useState(false);

  const minDate = addDays(new Date(), 1);
  const maxDate = addDays(new Date(), 14);

  const timeSlots = [
    { id: '1', time: '09:00-11:00', label: 'Morning (9:00 AM - 11:00 AM)' },
    { id: '2', time: '11:00-13:00', label: 'Late Morning (11:00 AM - 1:00 PM)' },
    { id: '3', time: '13:00-15:00', label: 'Early Afternoon (1:00 PM - 3:00 PM)' },
    { id: '4', time: '15:00-17:00', label: 'Afternoon (3:00 PM - 5:00 PM)' },
    { id: '5', time: '17:00-19:00', label: 'Evening (5:00 PM - 7:00 PM)' }
  ];

  const datePickerOptions = {
    autoHide: true,
    minDate,
    maxDate,
    theme: {
      background: "bg-white",
      todayBtn: "bg-blue-500 hover:bg-blue-600",
      clearBtn: "",
      icons: "",
      text: "",
      disabledText: "text-gray-300",
      input: "",
      inputIcon: "",
      selected: "bg-blue-500 hover:bg-blue-600",
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Delivery Date
        </label>
        <div className="mt-1">
          <Datepicker
            options={datePickerOptions}
            onChange={(date) => setFieldValue('timeSlot.date', date)}
            show={showDatePicker}
            setShow={setShowDatePicker}
          />
        </div>
        <ErrorMessage
          name="timeSlot.date"
          component="div"
          className="mt-1 text-sm text-red-600"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Delivery Time Slot
        </label>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
          {timeSlots.map((slot) => (
            <label
              key={slot.id}
              className="relative flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
            >
              <Field
                type="radio"
                name="timeSlot.slot"
                value={slot.time}
                className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <span className="ml-3 text-sm font-medium text-gray-900">
                {slot.label}
              </span>
            </label>
          ))}
        </div>
        <ErrorMessage
          name="timeSlot.slot"
          component="div"
          className="mt-1 text-sm text-red-600"
        />
      </div>
    </div>
  );
};

export default TimeSlotStep;