import { useState, useEffect } from 'react'
import { useABTest } from '../../hooks/useABTest'
import { useJourneyTracking } from '../../hooks/useJourneyTracking'
import { useNavigate } from 'react-router-dom'
import { useMetaDescription, metaDescriptions } from '../../utils/metaDescriptions'
import { CreditCard, MapPin, Truck, ChevronRight, Lock, Gift } from 'lucide-react'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import BottomNav from '../../components/layout/BottomNav'
import PaymentForm from '../../components/Payment/PaymentForm'
import GiftWrapSelector from '../../components/giftwrap/GiftWrapSelector'
import useCartStore from '../../store/cartStore'
import useAddressStore from '../../store/addressStore'
import useOrderStore from '../../store/orderStore'
import useAuthStore from '../../store/authStore'
import { paymentAPI } from '../../api/paymentAPI'
import CompareFloatingButton from '../../components/common/CompareFloatingButton';

function CheckoutPage() {
  const { experiments, getVariant, getChanges, trackConversion } = useABTest('checkout')
  const { trackTouchpoint } = useJourneyTracking()

  // Set optimized meta description for SEO
  useMetaDescription(metaDescriptions.checkout.description, metaDescriptions.checkout.title)

  // Trust badges experiment
  const trustVariant = getVariant('Checkout Trust Badges')
  const trustChanges = getChanges('Checkout Trust Badges')

  const showTrustBadges = trustChanges.showBadges !== false
  const badgeStyle = trustChanges.badgeStyle || 'icons'
  const badgePosition = trustChanges.badgePosition || 'top'
  const navigate = useNavigate()
  const { isAuthenticated, user } = useAuthStore()
  const { items, getSubtotal, getShipping, getDiscount, getTotal, clearCart, couponCode } = useCartStore()
  const { addresses, fetchAddresses } = useAddressStore()
  const { createOrder } = useOrderStore()

  const [step, setStep] = useState(1)
  const [selectedAddressId, setSelectedAddressId] = useState(null)
  const [selectedShipping, setSelectedShipping] = useState('standard')
  const [paymentMethod, setPaymentMethod] = useState('creditCard')
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const [giftWrap, setGiftWrap] = useState(null)

  // Track checkout start
  useEffect(() => {
    trackTouchpoint('checkout_start', {
      metadata: {
        cartTotal: getSubtotal()
      }
    })
  }, [])

  // Adresleri getir
  useEffect(() => {
    if (isAuthenticated) {
      fetchAddresses()
    }
  }, [isAuthenticated, fetchAddresses])

  // Varsayılan adresi seç
  useEffect(() => {
    if (addresses.length > 0 && !selectedAddressId) {
      const defaultAddress = addresses.find(a => a.isDefault)
      setSelectedAddressId(defaultAddress?._id || addresses[0]._id)
    }
  }, [addresses, selectedAddressId])

  // Kargo seçenekleri
  const shippingOptions = [
    {
      id: 'standard',
      name: 'Standart Kargo',
      company: 'Aras Kargo',
      duration: '2-4 iş günü',
      price: getSubtotal() >= 500 ? 0 : 29.99
    },
    {
      id: 'fast',
      name: 'Hızlı Kargo',
      company: 'MNG Kargo',
      duration: '1-2 iş günü',
      price: 49.99
    },
    {
      id: 'express',
      name: 'Express Kargo',
      company: 'Yurtiçi Kargo',
      duration: 'Aynı gün',
      price: 79.99
    }
  ]

  // Ödeme yöntemleri
  const paymentMethods = [
    {
      id: 'creditCard',
      name: 'Kredi Kartı',
      icon: '💳',
      description: 'Visa, Mastercard, Troy'
    },
    {
      id: 'debitCard',
      name: 'Banka Kartı',
      icon: '🏦',
      description: 'Banka kartı ile ödeme'
    },
    {
      id: 'bankTransfer',
      name: 'Havale/EFT',
      icon: '💰',
      description: 'Banka havalesi ile ödeme'
    },
    {
      id: 'cashOnDelivery',
      name: 'Kapıda Ödeme',
      icon: '🚪',
      description: 'Teslimat sırasında nakit ödeme'
    }
  ]

  // Giriş kontrolü
  if (!isAuthenticated) {
    navigate('/login', { state: { from: { pathname: '/checkout' } } })
    return null
  }

  const selectedShippingOption = shippingOptions.find(o => o.id === selectedShipping) || shippingOptions[0]

  // Handle complete order with payment and purchase tracking
  const handleCompleteOrder = async (cardDetails, use3D) => {
    try {
      setProcessing(true)
      setError(null)

      // Create order
      const orderData = {
        userId: (typeof user !== "undefined" && user?._id) || undefined,
        items: items.map(item => ({
          product: item.product?._id || item._id || item.id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          size: item.size,
          color: item.color
        })),
        shippingAddress: (() => {
          const raw = addresses.find(a => a._id === selectedAddressId) || addresses[0] || {};
          return {
            fullName: raw.fullName || raw.name || "Müşteri",
            phone: raw.phone || "",
            address: raw.address || raw.addressLine || raw.addressDetail || raw.fullAddress || "Adres belirtilmedi",
            city: raw.city || raw.il || "İstanbul",
            district: raw.district || raw.ilce || "",
            postalCode: raw.postalCode || raw.zipCode || "34000",
            country: raw.country || "Türkiye"
          };
        })(),
        paymentMethod: paymentMethod,
        subtotal: getSubtotal(),
        shippingPrice: selectedShippingOption.price,
        discount: getDiscount(),
        totalPrice: getTotal() - getShipping() + selectedShippingOption.price + (giftWrap?.price || 0),
        couponCode: couponCode || null,
        giftWrap: giftWrap || null
      }

      const orderResult = await createOrder(orderData)

      if (orderResult.success) {
        if (typeof clearCart === "function") clearCart();
        setTimeout(() => navigate("/orders"), 1200);
        const order = orderResult.order

        // Track purchase funnel event
        if (window.trackFunnelEvent) {
          window.trackFunnelEvent('purchase', {
            orderId: order._id,
            orderNumber: order.orderNumber,
            total: order.totalPrice,
            items: order.items.length
          })
        }

        // Track purchase journey touchpoint
        if (window.trackJourneyTouchpoint) {
          trackTouchpoint('purchase', {
            order: order._id,
            metadata: {
              orderTotal: order.totalPrice,
              items: order.items.length
            }
          })
        }

        // Track conversion for A/B test
        trackConversion('Checkout')

        // Clear cart
        clearCart()

        // Navigate to success page
        navigate(`/order-success/${order._id}`)
      } else {
        setError(orderResult.error || 'Sipariş oluşturulamadı')
      }
    } catch (err) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setProcessing(false)
    }
  }

  const trustBadges = [
    { icon: '🔒', text: 'Güvenli Ödeme' },
    { icon: '🚚', text: 'Ücretsiz Kargo' },
    { icon: '↩️', text: '14 Gün İade' },
    { icon: '✅', text: '2 Yıl Garanti' }
  ]



  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-8">
          Ana Sayfa / Sepet / <span className="text-gray-900 font-semibold">Ödeme</span>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-center">
            {/* Step 1 */}
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                {step > 1 ? '✓' : '1'}
              </div>
              <span className={`ml-2 font-semibold ${step >= 1 ? 'text-blue-600' : 'text-gray-400'}`}>
                Adres
              </span>
            </div>

            <div className={`w-20 h-1 mx-4 ${step >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>

            {/* Step 2 */}
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                {step > 2 ? '✓' : '2'}
              </div>
              <span className={`ml-2 font-semibold ${step >= 2 ? 'text-blue-600' : 'text-gray-400'}`}>
                Kargo
              </span>
            </div>

            <div className={`w-20 h-1 mx-4 ${step >= 3 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>

            {/* Step 3 */}
            <div className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-200'
                }`}>
                3
              </div>
              <span className={`ml-2 font-semibold ${step >= 3 ? 'text-blue-600' : 'text-gray-400'}`}>
                Ödeme
              </span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Sol Taraf - Formlar */}
          <div className="lg:col-span-2">
            {/* STEP 1: Adres Seçimi */}
            {step === 1 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-6">
                  <MapPin className="text-blue-600" size={24} />
                  <h2 className="text-2xl font-bold">Teslimat Adresi</h2>
                </div>

                <div className="space-y-4 mb-6">
                  {addresses.map(address => (
                    <label
                      key={address._id}
                      className={`block border-2 rounded-lg p-4 cursor-pointer transition ${selectedAddressId === address._id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <input
                        type="radio"
                        name="address"
                        value={address._id}
                        checked={selectedAddressId === address._id}
                        onChange={() => setSelectedAddressId(address._id)}
                        className="sr-only"
                      />
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-bold text-lg">{address.title}</h3>
                            {address.isDefault && (
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                                Varsayılan
                              </span>
                            )}
                          </div>
                          <p className="font-semibold text-gray-900">{address.fullName}</p>
                          <p className="text-sm text-gray-600">{address.phone}</p>
                          <p className="text-sm text-gray-600">{address.address}</p>
                          <p className="text-sm text-gray-600">
                            {address.district} / {address.city} - {address.zipCode}
                          </p>
                        </div>
                        {selectedAddressId === address._id && (
                          <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-xs">✓</span>
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>

                <button
                  onClick={() => navigate('/addresses')}
                  className="w-full py-3 border-2 border-blue-600 text-blue-600 rounded-lg font-semibold hover:bg-blue-50 transition mb-4"
                >
                  + Yeni Adres Ekle
                </button>

                <button
                  onClick={() => setStep(2)}
                  className="w-full py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                >
                  Devam Et
                  <ChevronRight size={20} />
                </button>
              </div>
            )}

            {/* STEP 2: Kargo Seçimi */}
            {step === 2 && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <div className="flex items-center gap-2 mb-6">
                  <Truck className="text-blue-600" size={24} />
                  <h2 className="text-2xl font-bold">Kargo Seçimi</h2>
                </div>

                <div className="space-y-4 mb-6">
                  {shippingOptions.map(option => (
                    <label
                      key={option.id}
                      className={`block border-2 rounded-lg p-4 cursor-pointer transition ${selectedShipping === option.id
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <input
                        type="radio"
                        name="shipping"
                        value={option.id}
                        checked={selectedShipping === option.id}
                        onChange={() => setSelectedShipping(option.id)}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <Truck size={32} className="text-gray-400" />
                          <div>
                            <h3 className="font-bold">{option.name}</h3>
                            <p className="text-sm text-gray-600">{option.company}</p>
                            <p className="text-sm text-gray-600">{option.duration}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {option.price === 0 ? (
                            <span className="text-green-600 font-bold">ÜCRETSİZ</span>
                          ) : (
                            <span className="text-xl font-bold">₺{option.price.toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 py-4 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                  >
                    Geri
                  </button>
                  <button
                    onClick={() => setStep(3)}
                    className="flex-1 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
                  >
                    Devam Et
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Ödeme */}
            {step === 3 && (
              <div className="space-y-6">
                {/* Gift Wrap Section - YENİ */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                    <Gift size={24} className="text-pink-600" />
                    Hediye Paketi
                  </h3>

                  <GiftWrapSelector
                    selectedWrap={giftWrap}
                    onSelect={setGiftWrap}
                    onRemove={() => setGiftWrap(null)}
                  />
                </div>

                {/* Ödeme Bilgileri */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <CreditCard className="text-blue-600" size={24} />
                    <h2 className="text-2xl font-bold">Ödeme Bilgileri</h2>
                  </div>

                  <PaymentForm
                    onSubmit={handleCompleteOrder}
                    loading={processing}
                  />
                </div>

                {/* Sözleşme */}
                <div className="bg-white rounded-xl shadow-md p-6">
                  <div className="space-y-3">
                    <label className="flex items-start gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-5 h-5 mt-1 accent-blue-600"
                        required
                      />
                      <span className="text-sm text-gray-700">
                        <strong>Ön Bilgilendirme Koşulları</strong>'nı ve <strong>Mesafeli Satış Sözleşmesi</strong>'ni okudum, onaylıyorum.
                      </span>
                    </label>
                  </div>
                </div>

                {/* Geri Butonu */}
                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    disabled={processing}
                    className="flex-1 py-4 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition disabled:opacity-50"
                  >
                    Geri
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Sağ Taraf - Sipariş Özeti */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <h2 className="text-2xl font-bold mb-6">Sipariş Özeti</h2>

              {/* Ürünler */}
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto">
                {items.map(item => (
                  <div key={item.cartId} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{item.name}</p>
                      <p className="text-xs text-gray-600">
                        {item.size} • {item.color} • {item.quantity}x
                      </p>
                      <p className="font-semibold text-blue-600 text-sm">
                        ₺{(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Fiyat Detayları */}
              <div className="space-y-3 mb-4 pb-4 border-t pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Ara Toplam:</span>
                  <span className="font-semibold">₺{getSubtotal().toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Kargo:</span>
                  <span className="font-semibold">
                    {step >= 2 ? (
                      selectedShippingOption.price === 0 ? (
                        <span className="text-green-600">ÜCRETSİZ</span>
                      ) : (
                        `₺${selectedShippingOption.price.toFixed(2)}`
                      )
                    ) : (
                      '₺0.00'
                    )}
                  </span>
                </div>

                {getDiscount() > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>İndirim:</span>
                    <span className="font-semibold">-₺{getDiscount().toFixed(2)}</span>
                  </div>
                )}

                {/* Gift Wrap in Summary */}
                {giftWrap && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Gift size={14} />
                      Hediye Paketi
                    </span>
                    <span className="font-bold text-pink-600">+₺{giftWrap.price.toFixed(2)}</span>
                  </div>
                )}
              </div>

              {/* Toplam */}
              <div className="flex justify-between items-center text-xl font-bold border-t pt-4">
                <span>Toplam:</span>
                <span className="text-blue-600">
                  ₺{(
                    getTotal() - getShipping() +
                    (step >= 2 ? selectedShippingOption.price : 0) +
                    (giftWrap?.price || 0)
                  ).toFixed(2)}
                </span>
              </div>

              {/* Güvenlik */}
              <div className="mt-6 pt-6 border-t">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Lock size={16} className="text-green-600" />
                  <span>Güvenli ödeme</span>
                </div>
                <div className="flex gap-2 mt-3">
                  <img src="/visa-icon.svg" alt="Visa" className="h-6" />
                  <img src="/mastercard-icon.svg" alt="Mastercard" className="h-6" />
                  <img src="/troy-icon.svg" alt="Troy" className="h-6" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
      <BottomNav />
      <CompareFloatingButton />
    </div>
  )
}

export default CheckoutPage