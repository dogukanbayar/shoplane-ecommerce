import API from './axiosConfig'

export const orderAPI = {
  // Sipariş oluştur
  createOrder: async (orderData) => {
    const response = await API.post('/orders', orderData)
    return response.data
  },

  // Kullanıcının siparişleri
  getMyOrders: async () => {
    const response = await API.get("/orders/my-orders");
    return response.data;
  },

  // Sipariş İptal Et
  cancelOrder: async (id, reason) => {
    const response = await API.put("/orders/" + id + "/cancel", { reason });
    return response.data;
  },

  // İade Talebi Oluştur
  returnOrder: async (id, reason) => {
    const response = await API.put("/orders/" + id + "/return", { reason });
    return response.data;
  },

  // Tek sipariş detayı
  getOrder: async (id) => {
    const response = await API.get(`/orders/${id}`)
    return response.data
  },

  // Ödeme durumunu güncelle
  updateOrderToPaid: async (id, paymentResult) => {
    const response = await API.put(`/orders/${id}/pay`, paymentResult)
    return response.data
  },

  // Tüm siparişler (Admin)
  getAllOrders: async () => {
    const response = await API.get('/orders')
    return response.data
  },

  // Sipariş durumu güncelle (Admin)
  updateOrderStatus: async (id, status) => {
    const response = await API.put(`/orders/${id}/status`, { status })
    return response.data
  }
}