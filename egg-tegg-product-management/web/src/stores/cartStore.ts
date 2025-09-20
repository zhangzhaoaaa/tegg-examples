import { create } from 'zustand';
import { Cart, CartItem, Product } from '../types';
import { cartApi } from '../services/api';

interface CartState {
  cart: Cart | null;
  isLoading: boolean;
  
  // Actions
  getCart: () => Promise<void>;
  addToCart: (productId: number, quantity: number) => Promise<void>;
  updateCartItem: (productId: number, quantity: number) => Promise<void>;
  removeFromCart: (productId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  setCart: (cart: Cart | null) => void;
  
  // Computed
  getTotalItems: () => number;
  getTotalPrice: () => number;
  getCartItem: (productId: number) => CartItem | undefined;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isLoading: false,

  getCart: async () => {
    set({ isLoading: true });
    try {
      const response = await cartApi.getCart();
      if (response.success && response.data) {
        set({ cart: response.data, isLoading: false });
      } else {
        set({ cart: null, isLoading: false });
      }
    } catch (error) {
      console.error('Get cart error:', error);
      set({ cart: null, isLoading: false });
    }
  },

  addToCart: async (productId: number, quantity: number) => {
    set({ isLoading: true });
    try {
      await cartApi.addToCart(productId, quantity);
      // 重新获取购物车数据
      await get().getCart();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  updateCartItem: async (productId: number, quantity: number) => {
    set({ isLoading: true });
    try {
      await cartApi.updateCartItem(productId, quantity);
      // 重新获取购物车数据
      await get().getCart();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  removeFromCart: async (productId: number) => {
    set({ isLoading: true });
    try {
      await cartApi.removeFromCart(productId);
      // 重新获取购物车数据
      await get().getCart();
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  clearCart: async () => {
    set({ isLoading: true });
    try {
      await cartApi.clearCart();
      set({ cart: null, isLoading: false });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  setCart: (cart: Cart | null) => {
    set({ cart });
  },

  getTotalItems: () => {
    const { cart } = get();
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => total + item.quantity, 0);
  },

  getTotalPrice: () => {
    const { cart } = get();
    if (!cart || !cart.items) return 0;
    return cart.items.reduce((total, item) => {
      const price = item.product?.quantity || 0; // 这里应该是商品价格，暂时用quantity代替
      return total + (price * item.quantity);
    }, 0);
  },

  getCartItem: (productId: number) => {
    const { cart } = get();
    if (!cart || !cart.items) return undefined;
    return cart.items.find(item => item.product_id === productId);
  },
}));