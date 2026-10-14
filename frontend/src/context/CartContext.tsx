'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Cart } from '@/types';
import { api } from '@/lib/api';

interface CartContextType {
  cart: Cart | null;
  isCartOpen: boolean;
  isLoading: boolean;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  addToCart: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (productId: number, quantity: number) => Promise<void>;
  removeItem: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const refreshCart = async () => {
    try {
      const data = await api.getCart();
      setCart(data);
    } catch (err) {
      console.warn('Could not load cart from backend, using fallback state:', err);
    }
  };

  useEffect(() => {
    refreshCart();
  }, []);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const addToCart = async (productId: number, quantity = 1) => {
    setIsLoading(true);
    try {
      const updated = await api.addToCart(productId, quantity);
      setCart(updated);
      setIsCartOpen(true);
    } catch (err) {
      console.error('Add to cart failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (productId: number, quantity: number) => {
    setIsLoading(true);
    try {
      const updated = await api.updateCartQuantity(productId, quantity);
      setCart(updated);
    } catch (err) {
      console.error('Update quantity failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const removeItem = async (productId: number) => {
    setIsLoading(true);
    try {
      const updated = await api.removeFromCart(productId);
      setCart(updated);
    } catch (err) {
      console.error('Remove item failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      await api.clearCart();
      setCart({
        cartId: 'empty',
        items: [],
        totalItems: 0,
        subtotal: 0,
        estimatedTax: 0,
        estimatedShipping: 0,
        grandTotal: 0,
      });
    } catch (err) {
      console.error('Clear cart failed:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        isCartOpen,
        isLoading,
        openCart,
        closeCart,
        toggleCart,
        addToCart,
        updateQuantity,
        removeItem,
        clearCart,
        refreshCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
