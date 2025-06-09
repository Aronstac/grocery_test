import { z } from 'zod';
import { logger } from '../utils/logger.js';

export const validateRequest = (schema) => {
  return (req, res, next) => {
    try {
      const validated = schema.parse({
        body: req.body,
        query: req.query,
        params: req.params
      });

      req.validated = validated;
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          error: 'Validation failed',
          details: errors
        });
      }

      logger.error('Validation middleware error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};

// Common validation schemas
export const schemas = {
  createStore: z.object({
    body: z.object({
      name: z.string().min(1).max(255),
      address: z.string().min(1),
      city: z.string().min(1).max(100),
      state: z.string().max(100).optional(),
      country: z.enum(['US', 'CA', 'GB', 'IN', 'DE', 'FR', 'AU', 'OTHER']).default('US'),
      postal_code: z.string().max(20).optional(),
      phone: z.string().regex(/^\+?[0-9\s\-\(\)]+$/).optional(),
      email: z.string().email().optional(),
      timezone: z.string().default('UTC')
    })
  }),

  createProduct: z.object({
    body: z.object({
      name: z.string().min(1).max(255),
      description: z.string().optional(),
      category: z.enum(['produce', 'dairy', 'bakery', 'meat', 'beverage', 'frozen', 'household', 'other']).default('other'),
      price: z.number().positive(),
      cost: z.number().positive().optional(),
      stock: z.number().int().min(0).default(0),
      reorder_level: z.number().int().min(0).default(0),
      sku: z.string().max(100).optional(),
      barcode: z.string().max(100).optional(),
      supplier_id: z.string().uuid().optional(),
      image_url: z.string().url().optional(),
      weight_grams: z.number().positive().optional(),
      requires_refrigeration: z.boolean().default(false)
    })
  }),

  createDelivery: z.object({
    body: z.object({
      supplier_id: z.string().uuid(),
      store_id: z.string().uuid(),
      expected_date: z.string().datetime(),
      priority: z.number().int().min(1).max(5).default(1),
      special_instructions: z.string().optional(),
      items: z.array(z.object({
        product_id: z.string().uuid(),
        quantity: z.number().int().positive(),
        unit_price: z.number().positive()
      })).min(1)
    })
  }),

  createEmployee: z.object({
    body: z.object({
      name: z.string().min(1).max(255),
      email: z.string().email(),
      phone: z.string().regex(/^\+?[0-9\s\-\(\)]+$/).optional(),
      position: z.string().min(1).max(100),
      department: z.string().min(1).max(100),
      role: z.enum(['admin', 'logistics_specialist', 'driver', 'warehouse_worker']),
      store_id: z.string().uuid(),
      salary: z.number().positive().optional(),
      hourly_rate: z.number().positive().optional()
    })
  }),

  createInvitation: z.object({
    body: z.object({
      email: z.string().email(),
      role: z.enum(['admin', 'logistics_specialist', 'driver', 'warehouse_worker']),
      store_id: z.string().uuid()
    })
  }),

  updateDeliveryStatus: z.object({
    body: z.object({
      status: z.enum(['pending', 'in-transit', 'delivered', 'canceled']),
      notes: z.string().optional(),
      actual_delivery_date: z.string().datetime().optional()
    })
  })
};