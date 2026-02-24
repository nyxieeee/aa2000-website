export interface ProductSpecs {
  [key: string]: string;
}

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  fullDescription: string;
  image: string;
  specs: ProductSpecs;
  inclusions: string[];
  installationPrice: number;
  supplierId?: number | null;
  supplierName?: string | null;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  category: string;
  image: string;
}

export interface DiscountResult {
  success: boolean;
  message: string;
}

export interface OrderItemPayload {
  id: number;
  name: string;
  price: number;
  quantity: number;
}

export interface OrderPayload {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  subtotal: number;
  discountAmount: number;
  discountCode?: string;
  total: number;
  items: OrderItemPayload[];
}

export interface Order {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  zipCode: string;
  subtotal: number;
  discountAmount: number;
  discountCode: string;
  total: number;
  status: string;
  createdAt: string;
  items?: { id: number; productId: number; productName: string; price: number; quantity: number }[];
}

export interface Supplier {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  image: string;
  createdAt?: string;
}

export interface Customer {
  id: number;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt?: string;
}
