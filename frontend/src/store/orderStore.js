import { create } from 'zustand'
import { orderAPI } from '../api/orderAPI'

const useOrderStore = create((set, get) => ({
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,

  // Siparişleri getir
  fetchOrders: async () => {
    set({ loading: true, error: null })
    try {
      const data = await orderAPI.getMyOrders()
      set({ orders: data.orders, loading: false })
    } catch (error) {
      const message = error.response?.data?.message || 'Siparişler yüklenemedi'
      set({ loading: false, error: message })
    }
  },

  // Tek sipariş getir
  fetchOrder: async (id) => {
    set({ loading: true, error: null })
    try {
      const data = await orderAPI.getOrder(id)
      set({ currentOrder: data.order, loading: false })
    } catch (error) {
      const message = error.response?.data?.message || 'Sipariş yüklenemedi'
      set({ loading: false, error: message })
    }
  },

  // Sipariş oluştur
  createOrder: async (orderData) => {
    set({ loading: true, error: null })
    try {
      const data = await orderAPI.createOrder(orderData)
      // Otomatik mock ödeme onayı
      try {
        await fetch(`/api/payments/mock-pay/${data.order._id}`, { method: "POST" });
        data.order.isPaid = true;
      } catch (payErr) {
        console.warn("Mock ödeme tetiklenemedi:", payErr);
      }
      set({
        orders: [data.order, ...get().orders],
        loading: false
      })
      return { success: true, order: data.order }
    } catch (error) {
      const message = error.response?.data?.message || 'Sipariş oluşturulamadı'
      set({ loading: false, error: message })
      return { success: false, error: message }
    }
  },

  // ID ile sipariş getir (local)
  getOrderById: (id) => {
    return get().orders.find(order => order._id === id || order.orderNumber === id)
  }
}))

export default useOrderStore