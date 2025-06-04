export interface OrderItem {
  productId: string;
  quantity: number;
}

export interface DeliveryWizardValues {
  deliveryId: string;
  customerInfo: {
    fullName: string;
    phone: string;
    email: string;
  };
  selectedProduct: {
    id: string;
    name: string;
    stock: number;
    category: string;
  };
  supplier: {
    id: string;
    name: string;
    price: number;
  };
  location: {
    address: string;
    unit: string;
    accessInstructions: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  timeSlot: {
    date: Date;
    slot: string;
  };
  orderDetails: {
    items: OrderItem[];
    specialHandling: string;
    temperature: string;
  };
  priority: 'standard' | 'express' | 'premium';
}
