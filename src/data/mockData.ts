// Mock Products Data
export const mockProducts = [
  {
    id: '1e91d3b8-85f7-4c09-b1c5-e7e38e19c15f',
    name: 'Organic Bananas',
    category: 'Fruits & Vegetables',
    price: 1.99,
    cost: 1.20,
    stock: 85,
    reorderLevel: 20,
    supplier: 'Fresh Farms Inc.',
    imageUrl: 'https://images.pexels.com/photos/1093038/pexels-photo-1093038.jpeg',
    expiryDate: '2023-08-15',
    createdAt: '2023-01-10T08:00:00Z',
    updatedAt: '2023-06-12T14:30:00Z'
  },
  {
    id: '2d6f5b9c-94a3-4d2e-b6c7-f8e9d0a1b2c3',
    name: 'Whole Milk',
    category: 'Dairy',
    price: 3.49,
    cost: 2.50,
    stock: 42,
    reorderLevel: 15,
    supplier: 'Valley Dairy Co.',
    imageUrl: 'https://images.pexels.com/photos/8148587/pexels-photo-8148587.jpeg',
    expiryDate: '2023-07-20',
    createdAt: '2023-01-12T09:15:00Z',
    updatedAt: '2023-06-14T11:20:00Z'
  },
  {
    id: '3a7c8d9e-0f1a-2b3c-4d5e-6f7g8h9i0j1k',
    name: 'Sourdough Bread',
    category: 'Bakery',
    price: 4.99,
    cost: 2.80,
    stock: 18,
    reorderLevel: 10,
    supplier: 'Artisan Bakery',
    imageUrl: 'https://images.pexels.com/photos/2286776/pexels-photo-2286776.jpeg',
    expiryDate: '2023-07-05',
    createdAt: '2023-01-10T10:30:00Z',
    updatedAt: '2023-06-13T16:45:00Z'
  },
  {
    id: '4b8c9d0e-1f2a-3b4c-5d6e-7f8g9h0i1j2k',
    name: 'Free Range Eggs',
    category: 'Dairy',
    price: 5.99,
    cost: 4.25,
    stock: 24,
    reorderLevel: 12,
    supplier: 'Happy Hens Farm',
    imageUrl: 'https://images.pexels.com/photos/6941028/pexels-photo-6941028.jpeg',
    expiryDate: '2023-07-25',
    createdAt: '2023-01-15T08:45:00Z',
    updatedAt: '2023-06-15T15:10:00Z'
  },
  {
    id: '5c9d0e1f-2a3b-4c5d-6e7f-8g9h0i1j2k3l',
    name: 'Organic Spinach',
    category: 'Fruits & Vegetables',
    price: 2.99,
    cost: 1.75,
    stock: 15,
    reorderLevel: 8,
    supplier: 'Green Gardens',
    imageUrl: 'https://images.pexels.com/photos/2325843/pexels-photo-2325843.jpeg',
    expiryDate: '2023-07-10',
    createdAt: '2023-01-18T13:20:00Z',
    updatedAt: '2023-06-16T10:30:00Z'
  },
  {
    id: '6d0e1f2a-3b4c-5d6e-7f8g-9h0i1j2k3l4m',
    name: 'Ground Coffee',
    category: 'Beverages',
    price: 12.99,
    cost: 8.50,
    stock: 32,
    reorderLevel: 10,
    supplier: 'Mountain Beans Co.',
    imageUrl: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg',
    createdAt: '2023-02-01T09:00:00Z',
    updatedAt: '2023-06-10T14:15:00Z'
  },
  {
    id: '7e1f2a3b-4c5d-6e7f-8g9h-0i1j2k3l4m5n',
    name: 'Chicken Breast',
    category: 'Meat & Seafood',
    price: 8.99,
    cost: 6.75,
    stock: 25,
    reorderLevel: 10,
    supplier: 'Family Farms',
    imageUrl: 'https://images.pexels.com/photos/6210876/pexels-photo-6210876.jpeg',
    expiryDate: '2023-07-08',
    createdAt: '2023-02-05T11:30:00Z',
    updatedAt: '2023-06-14T09:45:00Z'
  },
  {
    id: '8f2a3b4c-5d6e-7f8g-9h0i-1j2k3l4m5n6o',
    name: 'Pasta Sauce',
    category: 'Pantry',
    price: 3.99,
    cost: 2.25,
    stock: 52,
    reorderLevel: 15,
    supplier: 'Italian Imports',
    imageUrl: 'https://images.pexels.com/photos/5908256/pexels-photo-5908256.jpeg',
    expiryDate: '2023-12-20',
    createdAt: '2023-01-25T14:20:00Z',
    updatedAt: '2023-06-09T16:30:00Z'
  }
];

// Mock Deliveries Data
export const mockDeliveries = [
  {
    id: '9a3b4c5d-6e7f-8g9h-0i1j-2k3l4m5n6o7p',
    supplierId: 'sup1',
    supplierName: 'Fresh Farms Inc.',
    status: 'delivered',
    items: [
      {
        productId: '1e91d3b8-85f7-4c09-b1c5-e7e38e19c15f',
        productName: 'Organic Bananas',
        quantity: 100,
        unitPrice: 1.20,
        totalPrice: 120.00
      },
      {
        productId: '5c9d0e1f-2a3b-4c5d-6e7f-8g9h0i1j2k3l',
        productName: 'Organic Spinach',
        quantity: 50,
        unitPrice: 1.75,
        totalPrice: 87.50
      }
    ],
    expectedDate: '2023-06-10T10:00:00Z',
    deliveredDate: '2023-06-10T09:45:00Z',
    totalAmount: 207.50,
    notes: 'Delivered on time, all items in good condition',
    createdAt: '2023-06-05T08:30:00Z',
    updatedAt: '2023-06-10T09:45:00Z'
  },
  {
    id: 'b4c5d6e7-f8g9-h0i1-j2k3-l4m5n6o7p8q9',
    supplierId: 'sup2',
    supplierName: 'Valley Dairy Co.',
    status: 'in-transit',
    items: [
      {
        productId: '2d6f5b9c-94a3-4d2e-b6c7-f8e9d0a1b2c3',
        productName: 'Whole Milk',
        quantity: 75,
        unitPrice: 2.50,
        totalPrice: 187.50
      },
      {
        productId: '4b8c9d0e-1f2a-3b4c-5d6e-7f8g9h0i1j2k',
        productName: 'Free Range Eggs',
        quantity: 30,
        unitPrice: 4.25,
        totalPrice: 127.50
      }
    ],
    expectedDate: '2023-07-05T14:00:00Z',
    totalAmount: 315.00,
    notes: 'Delayed due to transportation issues',
    createdAt: '2023-07-01T10:15:00Z',
    updatedAt: '2023-07-03T16:20:00Z'
  },
  {
    id: 'c5d6e7f8-g9h0-i1j2-k3l4-m5n6o7p8q9r0',
    supplierId: 'sup3',
    supplierName: 'Artisan Bakery',
    status: 'pending',
    items: [
      {
        productId: '3a7c8d9e-0f1a-2b3c-4d5e-6f7g8h9i0j1k',
        productName: 'Sourdough Bread',
        quantity: 40,
        unitPrice: 2.80,
        totalPrice: 112.00
      }
    ],
    expectedDate: '2023-07-07T08:30:00Z',
    totalAmount: 112.00,
    createdAt: '2023-07-02T09:00:00Z',
    updatedAt: '2023-07-02T09:00:00Z'
  },
  {
    id: 'd6e7f8g9-h0i1-j2k3-l4m5-n6o7p8q9r0s1',
    supplierId: 'sup6',
    supplierName: 'Mountain Beans Co.',
    status: 'delivered',
    items: [
      {
        productId: '6d0e1f2a-3b4c-5d6e-7f8g-9h0i1j2k3l4m',
        productName: 'Ground Coffee',
        quantity: 25,
        unitPrice: 8.50,
        totalPrice: 212.50
      }
    ],
    expectedDate: '2023-06-20T11:00:00Z',
    deliveredDate: '2023-06-20T10:30:00Z',
    totalAmount: 212.50,
    notes: 'Special order for new coffee blend',
    createdAt: '2023-06-15T14:45:00Z',
    updatedAt: '2023-06-20T10:30:00Z'
  }
] as Delivery[];

// Mock Employees Data
export const mockEmployees = [
  {
    id: 'a1b2c3d4-e5f6-4789-90ab-cdef01234567',
    name: 'John Doe',
    position: 'Store Manager',
    email: 'john.doe@groceryops.com',
    phone: '555-123-4567',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    department: 'Management',
    startDate: '2021-03-15',
    status: 'active',
    role: 'admin'
  },
  {
    id: 'b2c3d4e5-f6a7-4890-abcd-ef0123456789',
    name: 'Jane Smith',
    position: 'Inventory Specialist',
    email: 'jane.smith@groceryops.com',
    phone: '555-987-6543',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    department: 'Inventory',
    startDate: '2021-05-10',
    status: 'active',
    role: 'logistics_specialist'
  },
  {
    id: 'c3d4e5f6-a7b8-490a-bcde-f0123456789a',
    name: 'Michael Johnson',
    position: 'Driver',
    email: 'michael.j@groceryops.com',
    phone: '555-456-7890',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    department: 'Logistics',
    startDate: '2022-01-20',
    status: 'active',
    role: 'driver'
  },
  {
    id: 'd4e5f6a7-b8c9-40ab-cdef-0123456789ab',
    name: 'Emily Williams',
    position: 'Warehouse Manager',
    email: 'emily.w@groceryops.com',
    phone: '555-234-5678',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    department: 'Warehouse',
    startDate: '2021-06-15',
    status: 'on-leave',
    role: 'warehouse_worker'
  },
  {
    id: 'e5f6a7b8-c9d0-4abc-def0-123456789abc',
    name: 'David Brown',
    position: 'Delivery Coordinator',
    email: 'david.b@groceryops.com',
    phone: '555-876-5432',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    department: 'Logistics',
    startDate: '2022-03-05',
    status: 'active',
    role: 'logistics_specialist'
  }
] as Employee[];

// Mock Financial Data
export const mockFinancialData = {
  dailyRevenue: [
    { date: '2023-06-01', revenue: 3245.87, expenses: 2150.45, profit: 1095.42 },
    { date: '2023-06-02', revenue: 2987.32, expenses: 1980.21, profit: 1007.11 },
    { date: '2023-06-03', revenue: 3521.56, expenses: 2340.78, profit: 1180.78 },
    { date: '2023-06-04', revenue: 3789.45, expenses: 2567.32, profit: 1222.13 },
    { date: '2023-06-05', revenue: 3156.23, expenses: 2087.65, profit: 1068.58 },
    { date: '2023-06-06', revenue: 2986.78, expenses: 1965.43, profit: 1021.35 },
    { date: '2023-06-07', revenue: 3452.12, expenses: 2310.67, profit: 1141.45 }
  ],
  monthlySales: [
    { month: 'Jan', revenue: 78523.45 },
    { month: 'Feb', revenue: 82167.89 },
    { month: 'Mar', revenue: 84356.23 },
    { month: 'Apr', revenue: 87234.56 },
    { month: 'May', revenue: 92145.78 },
    { month: 'Jun', revenue: 94567.23 },
    { month: 'Jul', revenue: 96789.34 }
  ],
  topSellingCategories: [
    { category: 'Fruits & Vegetables', sales: 28759.34 },
    { category: 'Dairy', sales: 23456.78 },
    { category: 'Bakery', sales: 18234.56 },
    { category: 'Meat & Seafood', sales: 21543.21 },
    { category: 'Beverages', sales: 17890.45 }
  ]
};