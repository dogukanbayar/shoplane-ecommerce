import { useState, useEffect } from 'react'
import { orderAPI } from '../../api/orderAPI'
import { Eye, Filter, Package } from 'lucide-react'
import { Link } from 'react-router-dom'

function AdminOrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      const data = await orderAPI.getAllOrders()
      setOrders(data?.orders || (Array.isArray(data) ? data : []))
    } catch (error) {
      console.error('Orders fetch error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await orderAPI.updateOrderStatus(orderId, newStatus)
      await fetchOrders()
    } catch (error) {
      alert(error.response?.data?.message || 'Durum güncellenemedi')
    }
  }

  const getOrderStatus = (o) => {
    return o.status || o.subOrders?.[0]?.status || 'Hazırlanıyor'
  }

  const getOrderTotal = (o) => {
    return o.totalAmount ?? o.totalPrice ?? o.subOrders?.[0]?.subTotal ?? 0
  }

  const getOrderItemsCount = (o) => {
    if (o.items && Array.isArray(o.items) && o.items.length > 0) return o.items.length
    if (o.subOrders && Array.isArray(o.subOrders)) {
      return o.subOrders.reduce((acc, so) => acc + (so.items?.length || 0), 0)
    }
    return 0
  }

  const filteredOrders = filter === 'all'
    ? orders
    : orders.filter(o => {
        const s = getOrderStatus(o).toLowerCase()
        return s === filter.toLowerCase()
      })

  const statusOptions = [
    { value: 'all', label: 'Tümü' },
    { value: 'Hazırlanıyor', label: 'Hazırlanıyor' },
    { value: 'Kargoya Verildi', label: 'Kargoya Verildi' },
    { value: 'Teslim Edildi', label: 'Teslim Edildi' },
    { value: 'İptal Edildi', label: 'İptal Edildi' },
    { value: 'İade Talebi Alındı', label: 'İade Talebi Alındı' }
  ]

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Sipariş Yönetimi</h1>
          <p className="text-sm text-slate-500 mt-1">Gelen siparişleri görüntüleyin ve durumlarını güncelleyin.</p>
        </div>
      </div>

      {/* Filtre */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 p-5 mb-6">
        <div className="flex items-center gap-3">
          <Filter size={18} className="text-slate-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="flex-1 max-w-xs px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:border-blue-500"
          >
            {statusOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <span className="text-xs text-slate-500 ml-auto font-medium">Toplam {filteredOrders.length} Sipariş</span>
        </div>
      </div>

      {/* Tablo */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Package size={40} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-semibold">Gösterilecek sipariş bulunamadı.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200/80 text-xs font-bold text-slate-600 uppercase tracking-wider">
                <tr>
                  <th className="py-4 px-6">Sipariş No</th>
                  <th className="py-4 px-6">Müşteri</th>
                  <th className="py-4 px-6">Ürün Sayısı</th>
                  <th className="py-4 px-6">Tutar</th>
                  <th className="py-4 px-6">Durum</th>
                  <th className="py-4 px-6">Tarih</th>
                  <th className="py-4 px-6 text-right">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredOrders.map(order => {
                  const currentStatus = getOrderStatus(order)
                  const total = getOrderTotal(order)
                  const itemsCount = getOrderItemsCount(order)

                  return (
                    <tr key={order._id} className="hover:bg-slate-50/60 transition">
                      <td className="py-4 px-6 font-mono font-bold text-slate-800">
                        {order.orderNumber || order._id}
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <p className="font-semibold text-slate-900">{order.user?.name || order.shippingAddress?.fullName || 'Misafir'}</p>
                          <p className="text-xs text-slate-500">{order.user?.email || order.shippingAddress?.phone || '-'}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-slate-600 font-medium">
                        {itemsCount} ürün
                      </td>
                      <td className="py-4 px-6 font-extrabold text-blue-600">
                        ₺{Number(total).toFixed(2)}
                      </td>
                      <td className="py-4 px-6">
                        <select
                          value={currentStatus}
                          onChange={(e) => handleStatusChange(order._id, e.target.value)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border outline-none cursor-pointer ${
                            currentStatus === 'Teslim Edildi' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                            currentStatus === 'Kargoya Verildi' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            currentStatus === 'İptal Edildi' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                            currentStatus === 'İade Talebi Alındı' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                            'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          <option value="Hazırlanıyor">Hazırlanıyor</option>
                          <option value="Kargoya Verildi">Kargoya Verildi</option>
                          <option value="Teslim Edildi">Teslim Edildi</option>
                          <option value="İade Talebi Alındı">İade Talebi Alındı</option>
                          <option value="İptal Edildi">İptal Edildi</option>
                        </select>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500 font-medium">
                        {new Date(order.createdAt).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/orders`}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-xl font-bold text-xs transition"
                        >
                          <Eye size={15} /> Görüntüle
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminOrdersPage
