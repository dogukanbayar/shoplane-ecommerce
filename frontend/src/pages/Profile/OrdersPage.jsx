import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Package, Truck, Clock, CheckCircle2, XCircle, FileText, Eye, ArrowLeft, Download, X, AlertTriangle, RotateCcw } from 'lucide-react'
import { orderAPI } from '../../api/orderAPI'

function OrdersPage() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  // İptal & İade State'leri
  const [actionModal, setActionModal] = useState({ open: false, type: '', orderId: null })
  const [actionReason, setActionReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [actionMessage, setActionMessage] = useState({ type: '', text: '' })

  useEffect(() => {
    fetchOrders()
  }, [])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const res = await orderAPI.getMyOrders()
      if (res?.orders) {
        setOrders(res.orders)
      } else if (Array.isArray(res)) {
        setOrders(res)
      } else if (res?.data?.orders) {
        setOrders(res.data.orders)
      } else {
        setOrders([])
      }
    } catch (err) {
      console.error('Siparişler yüklenemedi:', err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase()
    if (s.includes('teslim') || s === 'delivered') {
      return { text: 'Teslim Edildi', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' }
    }
    if (s.includes('kargo') || s === 'shipped') {
      return { text: 'Kargoya Verildi', color: 'bg-blue-50 text-blue-700 border-blue-200' }
    }
    if (s.includes('hazır') || s === 'processing') {
      return { text: 'Hazırlanıyor', color: 'bg-amber-50 text-amber-700 border-amber-200' }
    }
    if (s.includes('iade talebi') || s === 'return_requested') {
      return { text: 'İade Talebi Alındı', color: 'bg-purple-50 text-purple-700 border-purple-200' }
    }
    if (s.includes('iade') || s === 'returned') {
      return { text: 'İade Edildi', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' }
    }
    if (s.includes('iptal') || s === 'cancelled') {
      return { text: 'İptal Edildi', color: 'bg-rose-50 text-rose-700 border-rose-200' }
    }
    return { text: status || 'Sipariş Alındı', color: 'bg-slate-100 text-slate-700 border-slate-200' }
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return '-'
    const d = new Date(dateStr)
    return d.toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })
  }

  // Fatura İndir / Yazdır
  const handleDownloadInvoice = (order) => {
    const items = (order.items && order.items.length > 0) ? order.items : (order.subOrders?.[0]?.items || order.orderItems || [])
    const subtotal = order.subtotal || (order.totalPrice || order.total || 0) * 0.82
    const tax = order.taxPrice || (order.totalPrice || order.total || 0) * 0.18
    const total = Number(order.totalPrice || order.total || 0).toFixed(2)

    const invoiceWindow = window.open('', '_blank')
    invoiceWindow.document.write(`
      <!DOCTYPE html>
      <html lang="tr">
      <head>
        <meta charset="UTF-8">
        <title>Fatura - ${order.orderNumber || order._id}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #1e293b; margin: 0; padding: 40px; }
          .invoice-box { max-width: 800px; margin: auto; border: 1px solid #e2e8f0; padding: 32px; border-radius: 16px; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #3b82f6; padding-bottom: 20px; }
          .logo { font-size: 26px; font-weight: 800; color: #2563eb; }
          .info { display: flex; justify-content: space-between; margin: 24px 0; font-size: 13px; line-height: 1.6; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
          th { background: #f8fafc; text-align: left; padding: 12px; border-bottom: 1px solid #cbd5e1; color: #475569; }
          td { padding: 12px; border-bottom: 1px solid #f1f5f9; }
          .totals { margin-top: 24px; margin-left: auto; width: 260px; font-size: 13px; }
          .totals div { display: flex; justify-content: space-between; padding: 6px 0; }
          .total-row { font-size: 16px; font-weight: 800; color: #1e293b; border-top: 2px solid #e2e8f0; padding-top: 10px; }
          .footer { margin-top: 40px; text-align: center; font-size: 11px; color: #94a3b8; }
          @media print { body { padding: 0; } .invoice-box { border: none; } }
        </style>
      </head>
      <body>
        <div class="invoice-box">
          <div class="header">
            <div>
              <div class="logo">ShopLane E-Ticaret</div>
              <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Elektronik Arşiv Faturası</div>
            </div>
            <div style="text-align: right; font-size: 13px;">
              <strong>Fatura No:</strong> ${order.orderNumber || order._id}<br>
              <strong>Tarih:</strong> ${formatDate(order.createdAt || order.date)}
            </div>
          </div>
          <div class="info">
            <div>
              <strong style="color: #0f172a;">Alıcı / Teslimat:</strong><br>
              ${order.shippingAddress?.fullName || 'Değerli Müşterimiz'}<br>
              ${order.shippingAddress?.address || order.shippingAddress?.addressDetail || ''}<br>
              ${order.shippingAddress?.district || ''} / ${order.shippingAddress?.city || ''}<br>
              Tel: ${order.shippingAddress?.phone || '-'}
            </div>
            <div style="text-align: right;">
              <strong style="color: #0f172a;">Ödeme Bilgisi:</strong><br>
              Yöntem: ${order.paymentMethod || 'Kredi Kartı'}<br>
              Durum: Başarılı / Tahsil Edildi
            </div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Ürün Adı</th>
                <th style="text-align: center;">Adet</th>
                <th style="text-align: right;">Birim Fiyat</th>
                <th style="text-align: right;">Tutar</th>
              </tr>
            </thead>
            <tbody>
              ${items.map(it => `
                <tr>
                  <td>${it.name || it.product?.name || 'Ürün'}</td>
                  <td style="text-align: center;">${it.quantity}</td>
                  <td style="text-align: right;">₺${Number(it.price || 0).toFixed(2)}</td>
                  <td style="text-align: right;">₺${(Number(it.price || 0) * it.quantity).toFixed(2)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div class="totals">
            <div><span>Ara Toplam:</span> <span>₺${Number(subtotal).toFixed(2)}</span></div>
            <div><span>KDV (%18):</span> <span>₺${Number(tax).toFixed(2)}</span></div>
            <div class="total-row"><span>Genel Toplam:</span> <span>₺${total}</span></div>
          </div>
          <div class="footer">Bu fatura elektronik ortamda düzenlenmiştir. Teşekkür ederiz.</div>
        </div>
        <script>window.onload = function() { window.print(); }</script>
      </body>
      </html>
    `)
    invoiceWindow.document.close()
  }

  // İptal / İade Talebi Gönderme
  const handleActionSubmit = async () => {
    if (!actionReason) {
      setActionMessage({ type: 'error', text: 'Lütfen bir gerekçe belirtin.' })
      return
    }

    setActionLoading(true)
    setActionMessage({ type: '', text: '' })

    try {
      if (actionModal.type === 'cancel') {
        await orderAPI.cancelOrder(actionModal.orderId, actionReason)
      } else {
        await orderAPI.returnOrder(actionModal.orderId, actionReason)
      }

      setActionModal({ open: false, type: '', orderId: null })
      setActionReason('')
      await fetchOrders()
    } catch (err) {
      setActionMessage({
        type: 'error',
        text: err.response?.data?.message || err.message || 'İşlem gerçekleştirilemedi.'
      })
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50/70 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Üst Başlık */}
        <div className="flex items-center justify-between mb-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Siparişlerim</h1>
            <p className="text-sm text-slate-500 mt-0.5">Siparişlerinizi takip edin, faturanızı indirin veya iade/iptal talebi oluşturun</p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-4 py-2.5 rounded-xl transition"
          >
            <ArrowLeft size={16} /> Alışverişe Dön
          </Link>
        </div>

        {/* Sipariş Listesi */}
        {loading ? (
          <div className="space-y-4 animate-pulse">
            {[1, 2].map(n => (
              <div key={n} className="h-44 bg-white rounded-2xl border border-slate-200"></div>
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center max-w-md mx-auto shadow-xs">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Package size={30} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Henüz Siparişiniz Yok</h3>
            <p className="text-xs text-slate-500 mb-6">Satın aldığınız ürünler burada listelenecektir.</p>
            <Link
              to="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition inline-block"
            >
              Alışverişe Başla
            </Link>
          </div>
        ) : (
          <div className="space-y-5">
            {orders.map((order) => {
              const currentStatus = order.status || order.subOrders?.[0]?.status || 'Hazırlanıyor'
              const statusInfo = getStatusBadge(currentStatus)
              const items = (order.items && order.items.length > 0) ? order.items : (order.subOrders?.[0]?.items || order.orderItems || [])
              const totalAmount = Number(order.totalAmount ?? order.totalPrice ?? order.subOrders?.[0]?.subTotal ?? 0).toFixed(2)

              const isCancellable = ['hazırlanıyor', 'processing'].includes(currentStatus.toLowerCase())
              const isReturnable = ['teslim edildi', 'delivered'].includes(currentStatus.toLowerCase())

              return (
                <div
                  key={order._id}
                  className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-slate-300 transition overflow-hidden"
                >
                  {/* Kart Başlığı */}
                  <div className="bg-slate-50/70 px-6 py-4 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="text-xs text-slate-500 font-medium">Sipariş No:</span>
                        <h4 className="text-sm font-bold text-slate-900 font-mono">
                          {order.orderNumber || order._id}
                        </h4>
                      </div>
                      <span className={`text-[11px] font-bold px-3 py-1 rounded-full border ${statusInfo.color}`}>
                        {statusInfo.text}
                      </span>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <span className="text-xs text-slate-500">Tarih</span>
                        <p className="text-xs font-semibold text-slate-800">
                          {formatDate(order.createdAt || order.date)}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500">Toplam Tutar</span>
                        <p className="text-base font-extrabold text-blue-600">
                          ₺{totalAmount}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ürün Listesi */}
                  <div className="p-6 divide-y divide-slate-100">
                    {items.map((item, idx) => (
                      <div key={idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={item.image || item.product?.image || 'https://placehold.co/80x80?text=Urun'}
                            alt={item.name}
                            className="w-16 h-16 object-cover rounded-xl border border-slate-100 bg-slate-50"
                          />
                          <div>
                            <h5 className="text-sm font-bold text-slate-900">{item.name}</h5>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {item.size ? `Beden: ${item.size}` : ''} {item.color ? `• Renk: ${item.color}` : ''}
                            </p>
                            <span className="text-xs font-medium text-slate-600 mt-1 inline-block">
                              Adet: {item.quantity}
                            </span>
                          </div>
                        </div>

                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">
                            ₺{Number(item.price || 0).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Alt Aksiyon Butonları */}
                  <div className="bg-slate-50/40 px-6 py-3.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      {isCancellable && (
                        <button
                          onClick={() => {
                            setActionModal({ open: true, type: 'cancel', orderId: order._id })
                            setActionReason('')
                            setActionMessage({ type: '', text: '' })
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-xs font-bold transition"
                        >
                          <XCircle size={14} /> Siparişi İptal Et
                        </button>
                      )}
                      {isReturnable && (
                        <button
                          onClick={() => {
                            setActionModal({ open: true, type: 'return', orderId: order._id })
                            setActionReason('')
                            setActionMessage({ type: '', text: '' })
                          }}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 border border-purple-200 text-purple-600 hover:bg-purple-50 rounded-xl text-xs font-bold transition"
                        >
                          <RotateCcw size={14} /> İade Talebi Oluştur
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => { setSelectedOrder(order); setShowDetailModal(true); }}
                        className="inline-flex items-center gap-1.5 px-4 py-2 border border-slate-200 hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold transition"
                      >
                        <Eye size={15} /> Detayları Gör
                      </button>
                      <button
                        onClick={() => handleDownloadInvoice(order)}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition"
                      >
                        <Download size={15} /> Fatura İndir
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Sipariş Detay Modalı */}
        {showDetailModal && selectedOrder && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Sipariş Detayı</h3>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">#{selectedOrder.orderNumber || selectedOrder._id}</p>
                </div>
                <button onClick={() => setShowDetailModal(false)} className="p-2 rounded-full hover:bg-slate-100 text-slate-500">
                  <X size={18} />
                </button>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl mb-6">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Teslimat Adresi</h4>
                <p className="text-sm font-bold text-slate-900">{selectedOrder.shippingAddress?.fullName}</p>
                <p className="text-xs text-slate-600 mt-1">{selectedOrder.shippingAddress?.address || selectedOrder.shippingAddress?.addressDetail}</p>
                <p className="text-xs text-slate-500 mt-0.5">{selectedOrder.shippingAddress?.district} / {selectedOrder.shippingAddress?.city}</p>
                <p className="text-xs font-mono text-slate-600 mt-1">Tel: {selectedOrder.shippingAddress?.phone}</p>
              </div>

              <div className="space-y-3 mb-6">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Satın Alınan Ürünler</h4>
                {(selectedOrder.items || selectedOrder.orderItems || []).map((item, i) => (
                  <div key={i} className="flex justify-between items-center text-xs border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="font-bold text-slate-900">{item.name}</span>
                      <span className="text-slate-500 ml-2">x {item.quantity}</span>
                    </div>
                    <span className="font-bold text-slate-800">
                      ₺{(Number(item.price || 0) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-100 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-500">Ödeme Yöntemi</span>
                  <p className="text-xs font-bold text-slate-800">{selectedOrder.paymentMethod || 'Kredi Kartı'}</p>
                </div>
                <button
                  onClick={() => handleDownloadInvoice(selectedOrder)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition"
                >
                  <Download size={14} /> Fatura Yazdır/İndir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* İptal / İade Talebi Modalı */}
        {actionModal.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  {actionModal.type === 'cancel' ? (
                    <AlertTriangle className="text-rose-500" size={20} />
                  ) : (
                    <RotateCcw className="text-purple-600" size={20} />
                  )}
                  <h3 className="text-base font-bold text-slate-900">
                    {actionModal.type === 'cancel' ? 'Siparişi İptal Et' : 'İade Talebi Oluştur'}
                  </h3>
                </div>
                <button onClick={() => setActionModal({ open: false, type: '', orderId: null })} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-400">
                  <X size={18} />
                </button>
              </div>

              <p className="text-xs text-slate-600 mb-4">
                {actionModal.type === 'cancel'
                  ? 'Siparişinizi iptal etmek istediğinizden emin misiniz? Bu işlem geri alınamaz ve ürün stokları sisteme iade edilir.'
                  : 'Teslim aldığınız ürünle ilgili iade süreci başlatılacaktır. Lütfen gerekçenizi belirtin.'}
              </p>

              {actionMessage.text && (
                <div className="mb-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                  {actionMessage.text}
                </div>
              )}

              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  {actionModal.type === 'cancel' ? 'İptal Gerekçesi' : 'İade Sebebi'}
                </label>
                <select
                  value={actionReason}
                  onChange={(e) => setActionReason(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-blue-600 mb-2"
                >
                  <option value="">Lütfen bir neden seçin...</option>
                  {actionModal.type === 'cancel' ? (
                    <>
                      <option value="Yanlış ürün/beden seçimi">Yanlış ürün/beden seçimi</option>
                      <option value="Teslimat adresini yanlış girdim">Teslimat adresini yanlış girdim</option>
                      <option value="Fikrimi değiştirdim">Fikrimi değiştirdim</option>
                      <option value="Daha uygun fiyata buldum">Daha uygun fiyata buldum</option>
                      <option value="Diğer">Diğer</option>
                    </>
                  ) : (
                    <>
                      <option value="Beden uymadı">Beden uymadı</option>
                      <option value="Ürün hasarlı/kusurlu geldi">Ürün hasarlı/kusurlu geldi</option>
                      <option value="Görseldeki ürünle uyuşmuyor">Görseldeki ürünle uyuşmuyor</option>
                      <option value="Beklediğim kalitede değil">Beklediğim kalitede değil</option>
                      <option value="Diğer">Diğer</option>
                    </>
                  )}
                </select>
              </div>

              <div className="flex gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setActionModal({ open: false, type: '', orderId: null })}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold"
                >
                  Vazgeç
                </button>
                <button
                  type="button"
                  disabled={actionLoading}
                  onClick={handleActionSubmit}
                  className={`px-4 py-2 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    actionModal.type === 'cancel'
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-purple-600 hover:bg-purple-700'
                  }`}
                >
                  {actionLoading ? 'İşleniyor...' : actionModal.type === 'cancel' ? 'İptal Et' : 'Talebi Gönder'}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default OrdersPage
