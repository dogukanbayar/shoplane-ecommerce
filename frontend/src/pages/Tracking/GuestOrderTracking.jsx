import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Package, MapPin, Truck, CheckCircle, Clock, Mail, Phone, ExternalLink } from 'lucide-react'
import API from '../../api/axiosConfig'
import AdvancedSeo from '../../components/seo/AdvancedSeo'

function GuestOrderTracking() {
  const { token } = useParams()
  const navigate = useNavigate()
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Email ile sipariş sorgulama için
  const [showEmailSearch, setShowEmailSearch] = useState(!token)
  const [emailSearchData, setEmailSearchData] = useState({
    email: '',
    orderNumber: ''
  })

  useEffect(() => {
    if (token) {
      fetchOrderByToken()
    }
  }, [token])

  const fetchOrderByToken = async () => {
    try {
      setLoading(true)
      const response = await API.get(`/guest-orders/track/${token}`)
      setOrder(response.data.order)
      setError(null)
    } catch (err) {
      setError('Sipariş bulunamadı. Lütfen bilgilerinizi kontrol edin.')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailSearch = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const response = await API.post('/guest-orders/track-by-email', emailSearchData)
      setOrder(response.data.order)
      setError(null)
      setShowEmailSearch(false)
      
      // URL'i güncelle
      navigate(`/guest-order-tracking/${response.data.trackingToken}`, { replace: true })
    } catch (err) {
      setError('Sipariş bulunamadı. Email ve sipariş numarasını kontrol edin.')
    } finally {
      setLoading(false)
    }
  }

  const statusConfig = {
    pending: {
      icon: Clock,
      color: 'bg-yellow-500',
      text: 'Beklemede',
      description: 'Siparişiniz onay bekliyor'
    },
    processing: {
      icon: Package,
      color: 'bg-blue-500',
      text: 'Hazırlanıyor',
      description: 'Siparişiniz hazırlanıyor'
    },
    shipped: {
      icon: Truck,
      color: 'bg-purple-500',
      text: 'Kargoda',
      description: 'Siparişiniz kargoya verildi'
    },
    delivered: {
      icon: CheckCircle,
      color: 'bg-green-500',
      text: 'Teslim Edildi',
      description: 'Siparişiniz teslim edildi'
    },
    cancelled: {
      icon: Clock,
      color: 'bg-red-500',
      text: 'İptal Edildi',
      description: 'Sipariş iptal edildi'
    }
  }

  const getStatusIndex = (status) => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered']
    return statuses.indexOf(status)
  }

  if (showEmailSearch) {
    return (
      <>
        <AdvancedSeo
          title="Misafir Sipariş Takibi - Siparişinizi Takip Edin | MyShop"
          description="MyShop misafir sipariş takibi. Email adresiniz ve sipariş numaranız ile kolayca siparişinizi takip edin. Anlık kargo durumu, teslimat bilgileri."
          keywords="sipariş takibi, misafir sipariş, kargo takibi, teslimat sorgulama, sipariş durumu"
        />

        <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
          <div className="max-w-md mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-card rounded-2xl p-8 shadow-xl"
            >
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Package size={40} className="text-white" />
                </div>
                <h1 className="text-3xl font-bold mb-2 dark:text-dark-text">Sipariş Takibi</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Siparişinizi takip etmek için bilgilerinizi girin
                </p>
              </div>

              <form onSubmit={handleEmailSearch} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-dark-text">
                    Email Adresi
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                      type="email"
                      value={emailSearchData.email}
                      onChange={(e) => setEmailSearchData({ ...emailSearchData, email: e.target.value })}
                      placeholder="ornek@email.com"
                      className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:border-blue-500 dark:bg-dark-hover dark:text-dark-text"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-dark-text">
                    Sipariş Numarası
                  </label>
                  <input
                    type="text"
                    value={emailSearchData.orderNumber}
                    onChange={(e) => setEmailSearchData({ ...emailSearchData, orderNumber: e.target.value })}
                    placeholder="GO-12345678"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:border-blue-500 dark:bg-dark-hover dark:text-dark-text"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">Email ile gönderilen sipariş numaranız</p>
                </div>

                {error && (
                  <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900 rounded-xl">
                    <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition disabled:opacity-50"
                >
                  {loading ? 'Sorgulanıyor...' : 'Siparişi Sorgula'}
                </button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-xl">
                <p className="text-sm text-blue-800 dark:text-blue-200 text-center">
                  💡 Sipariş numaranızı email adresinize göndermiştik
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Sipariş bilgileri getiriliyor...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <Package size={64} className="text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2 dark:text-dark-text">Sipariş Bulunamadı</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">{error}</p>
          <button
            onClick={() => setShowEmailSearch(true)}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    )
  }

  const currentStatus = statusConfig[order.status]
  const StatusIcon = currentStatus.icon
  const currentStatusIndex = getStatusIndex(order.status)

  return (
    <>
      <AdvancedSeo
        title={`Sipariş Takibi #${order.orderNumber} | MyShop`}
        description={`${order.orderNumber} numaralı siparişinizin detaylarını görüntüleyin. Anlık kargo durumu, teslimat bilgileri ve sipariş özeti.`}
        keywords="sipariş detay, kargo takibi, teslimat durumu, sipariş özeti"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className={`w-24 h-24 ${currentStatus.color} rounded-full flex items-center justify-center mx-auto mb-4 shadow-2xl`}
            >
              <StatusIcon size={48} className="text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold mb-2 dark:text-dark-text">{currentStatus.text}</h1>
            <p className="text-xl text-gray-600 dark:text-gray-400">{currentStatus.description}</p>
            <p className="text-lg font-semibold text-blue-600 mt-2">
              Sipariş #{order.orderNumber}
            </p>
          </div>

          {/* Timeline */}
          <div className="bg-white dark:bg-dark-card rounded-2xl p-8 shadow-xl mb-8">
            <h2 className="text-2xl font-bold mb-6 dark:text-dark-text">Sipariş Durumu</h2>
            
            <div className="relative">
              {/* Progress Line */}
              <div className="absolute top-6 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700">
                <div 
                  className="h-full bg-gradient-to-r from-blue-600 to-purple-600 transition-all duration-500"
                  style={{ width: `${(currentStatusIndex / 3) * 100}%` }}
                />
              </div>

              {/* Steps */}
              <div className="relative flex justify-between">
                {['pending', 'processing', 'shipped', 'delivered'].map((status, index) => {
                  const config = statusConfig[status]
                  const Icon = config.icon
                  const isActive = index <= currentStatusIndex
                  const isCurrent = order.status === status

                  return (
                    <div key={status} className="flex flex-col items-center">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white dark:border-dark-card shadow-lg transition-all ${
                          isActive
                            ? config.color + ' text-white'
                            : 'bg-gray-300 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                        } ${isCurrent ? 'ring-4 ring-blue-200 dark:ring-blue-900' : ''}`}
                      >
                        <Icon size={24} />
                      </motion.div>
                      <p className={`mt-2 text-sm font-semibold text-center ${
                        isActive ? 'text-gray-900 dark:text-dark-text' : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        {config.text}
                      </p>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tracking Info */}
            {order.trackingNumber && (
              <div className="mt-8 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Kargo Takip No</p>
                    <p className="text-xl font-bold text-blue-600">{order.trackingNumber}</p>
                  </div>
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                      Kargo Firmasında Takip Et
                      <ExternalLink size={16} />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Ürünler */}
            <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-xl">
              <h3 className="text-xl font-bold mb-4 dark:text-dark-text">Sipariş Ürünleri</h3>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex gap-4 pb-4 border-b dark:border-dark-border last:border-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <p className="font-semibold dark:text-dark-text">{item.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Adet: {item.quantity}</p>
                      <p className="font-bold text-blue-600">{item.price}₺</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 pt-4 border-t dark:border-dark-border">
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Ara Toplam</span>
                  <span className="font-bold dark:text-dark-text">{(order.totalPrice - order.shippingPrice).toFixed(2)}₺</span>
                </div>
                <div className="flex justify-between mb-2">
                  <span className="text-gray-600 dark:text-gray-400">Kargo</span>
                  <span className="font-bold text-green-600">
                    {order.shippingPrice === 0 ? 'ÜCRETSİZ' : `${order.shippingPrice}₺`}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t dark:border-dark-border">
                  <span className="dark:text-dark-text">Toplam</span>
                  <span className="text-blue-600">{order.totalPrice.toFixed(2)}₺</span>
                </div>
              </div>
            </div>

            {/* Teslimat & İletişim */}
            <div className="space-y-6">
              {/* Teslimat Adresi */}
              <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-dark-text">
                  <MapPin className="text-blue-600" />
                  Teslimat Adresi
                </h3>
                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  <p className="font-semibold text-gray-900 dark:text-dark-text">{order.shippingAddress.fullName}</p>
                  <p>{order.shippingAddress.address}</p>
                  <p>{order.shippingAddress.district} / {order.shippingAddress.city}</p>
                  {order.shippingAddress.zipCode && <p>Posta Kodu: {order.shippingAddress.zipCode}</p>}
                  <p className="flex items-center gap-2">
                    <Phone size={16} />
                    {order.shippingAddress.phone}
                  </p>
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-dark-text">
                  <Mail className="text-blue-600" />
                  İletişim Bilgileri
                </h3>
                <div className="space-y-2 text-gray-600 dark:text-gray-400">
                  <p className="font-semibold text-gray-900 dark:text-dark-text">{order.guestName}</p>
                  <p className="flex items-center gap-2">
                    <Mail size={16} />
                    {order.guestEmail}
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone size={16} />
                    {order.guestPhone}
                  </p>
                </div>
              </div>

              {/* Ödeme Yöntemi */}
              <div className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-xl">
                <h3 className="text-xl font-bold mb-4 dark:text-dark-text">Ödeme Yöntemi</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {order.paymentMethod === 'credit_card' && '💳 Kredi Kartı'}
                  {order.paymentMethod === 'debit_card' && '💳 Banka Kartı'}
                  {order.paymentMethod === 'kapida_odeme' && '💵 Kapıda Ödeme'}
                </p>
              </div>
            </div>
          </div>

          {/* Yardım */}
          <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-2xl p-6 border border-blue-200 dark:border-blue-900">
            <h3 className="text-xl font-bold mb-2 dark:text-dark-text">Yardıma mı ihtiyacınız var?</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Sipariş detayları email adresinize gönderilmiştir. 
              Bu sayfayı yer imlerine ekleyerek daha sonra tekrar ziyaret edebilirsiniz.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="mailto:destek@myshop.com"
                className="px-6 py-3 bg-white dark:bg-dark-card border-2 border-blue-200 dark:border-blue-900 rounded-xl font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/30 transition dark:text-dark-text"
              >
                📧 Email Gönder
              </a>
              <a
                href="tel:+905551234567"
                className="px-6 py-3 bg-white dark:bg-dark-card border-2 border-blue-200 dark:border-blue-900 rounded-xl font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/30 transition dark:text-dark-text"
              >
                📞 Bizi Ara
              </a>
              <button
                onClick={() => window.open('https://wa.me/905551234567', '_blank')}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
              >
                💬 WhatsApp
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default GuestOrderTracking