/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Product, CartItem, DiscountResult } from '../types';

const CART_STORAGE_KEY = 'aa2000-cart';

function loadCartFromStorage(): CartItem[] {
  try {
    const stored = localStorage.getItem(CART_STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function loadDiscountState(): { discount: number; appliedCode: string } {
  try {
    const stored = localStorage.getItem(`${CART_STORAGE_KEY}-discount`);
    if (!stored) return { discount: 0, appliedCode: '' };
    const parsed = JSON.parse(stored);
    return { discount: Number(parsed?.discount) || 0, appliedCode: String(parsed?.appliedCode ?? '') };
  } catch {
    return { discount: 0, appliedCode: '' };
  }
}

type ProductToAdd = Product | (Product & { price: number; name: string });

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: ProductToAdd) => void;
  removeFromCart: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  discount: number;
  discountAmount: number;
  totalPrice: number;
  applyDiscount: (code: string) => DiscountResult;
  appliedCode: string;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

interface CartProviderProps {
  children: React.ReactNode;
}

export const CartProvider = ({ children }: CartProviderProps) => {
  const [cart, setCart] = useState<CartItem[]>(loadCartFromStorage);
  const [discount, setDiscount] = useState(() => loadDiscountState().discount);
  const [appliedCode, setAppliedCode] = useState(() => loadDiscountState().appliedCode);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(`${CART_STORAGE_KEY}-discount`, JSON.stringify({ discount, appliedCode }));
  }, [discount, appliedCode]);

  const addToCart = (product: ProductToAdd) => {
    const productData = { ...product } as Product;

    setCart((prevCart) => {
      const existing = prevCart.find(item => item.id === product.id);
      if (existing) {
        return prevCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...productData, quantity: 1 }];
    });
  };

  const removeFromCart = (productId: number) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    setCart(prevCart => prevCart.map(item =>
      item.id === productId ? { ...item, quantity } : item
    ));
  };

  const applyDiscount = (code: string): DiscountResult => {
    if (code.toLowerCase() === 'aa2000') {
      setDiscount(0.20);
      setAppliedCode(code.toUpperCase());
      return { success: true, message: 'Code AA2000 applied successfully!' };
    }
    setDiscount(0);
    setAppliedCode('');
    return { success: false, message: 'Invalid promo code.' };
  };

  const clearCart = () => {
    setCart([]);
    setDiscount(0);
    setAppliedCode('');
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
  const discountAmount = subtotal * discount;
  const totalPrice = subtotal - discountAmount;

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, updateQuantity, clearCart, totalItems, subtotal, discount, discountAmount, totalPrice, applyDiscount, appliedCode }}>
      {children}
    </CartContext.Provider>
  );
};
