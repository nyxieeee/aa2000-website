import { z } from 'zod';

export const contactSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(1, 'Please select a subject'),
  message: z.string().min(10, 'Message must be at least 10 characters'),
});

export const checkoutSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(8, 'Please enter a valid phone number'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
  city: z.string().min(2, 'City is required'),
  zipCode: z.string().min(2, 'Zip code is required'),
  cardNumber: z.string().min(13, 'Enter a valid card number'),
  expiryDate: z.string().regex(/^\d{1,2}\/\d{2}$/, 'Use MM/YY format'),
  cvv: z.string().min(3, 'CVV must be 3-4 digits'),
});

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  category: z.string().min(1, 'Category is required'),
  price: z.number().min(0, 'Price must be 0 or greater'),
  description: z.string().min(1, 'Short description is required'),
  fullDescription: z.string().min(1, 'Full description is required'),
  image: z.string().url('Enter a valid image URL').or(z.literal('')),
  installationPrice: z.number().min(0, 'Installation price must be 0 or greater'),
});

export type ContactFormData = z.infer<typeof contactSchema>;
export type CheckoutFormData = z.infer<typeof checkoutSchema>;
export type ProductFormData = z.infer<typeof productSchema>;
