jsx
import { useState } from 'react'
import GiftWrapSelector from '../../components/giftwrap/GiftWrapSelector'
import { Gift } from 'lucide-react'

function GuestCheckout() {
  const [giftWrap, setGiftWrap] = useState(null)
  
  // ... mevcut kod

  const totalPrice = getTotalPrice()
  const giftWrapPrice = giftWrap?.price || 0
  const shippingPrice = totalPrice >= 500 ? 0 : 29.99
  const finalPrice = totalPrice + shippingPrice + giftWrapPrice

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!formData.acceptsTerms) {
      toast.error('Lütfen kullanım koşullarını kabul edin')
      return
    }

    setLoading(true)
    try {
      const orderData = {
        ...formData,
        items: items.map(item => ({
          product: item._id,
          quantity: item.quantity
        })),
        // Gift wrap - YENİ
        giftWrap: giftWrap ? {
          enabled: true,
          wrapId: giftWrap._id,
          price: giftWrap.price,
          message: giftWrap.giftMessage?.message,
          from: giftWrap.giftMessage?.from,
          to: giftWrap.giftMessage?.to
        } : {
          enabled: false
        }
      }

      const response = await API.post('/guest-orders', orderData)

      toast.success('Sipariş başarıyla oluşturuldu!')
      clearCart()
      
      navigate(`/guest-order-tracking/${response.data.trackingToken}`)
    } catch (error) {
      toast.error(error.response?.data?.message || 'Sipariş oluşturulamadı')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="...">
      {/* ... mevcut steps */}

      {/* Step 2'de Gift Wrap Section - YENİ */}
      {step === 2 && (
        <motion.div className="...">
          {/* ... mevcut address form */}

          {/* Gift Wrap */}
          <div className="mt-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2 dark:text-dark-text">
              <Gift size={24} className="text-pink-600" />
              Hediye Paketi (Opsiyonel)
            </h3>
            
            <GiftWrapSelector
              selectedWrap={giftWrap}
              onSelect={setGiftWrap}
              onRemove={() => setGiftWrap(null)}
            />
          </div>

          {/* ... buttons */}
        </motion.div>
      )}

      {/* Sipariş Özeti - Güncelle */}
      <div className="...">
        {/* ... mevcut items */}

        {/* Gift Wrap in Summary */}
        {giftWrap && (
          <div className="flex items-center gap-3 mb-3 p-3 bg-pink-50 dark:bg-pink-900/20 rounded-lg border border-pink-200 dark:border-pink-900">
            <div className="text-2xl">{giftWrap.icon}</div>
            <div className="flex-1">
              <p className="font-semibold text-sm dark:text-dark-text">{giftWrap.name}</p>
              {giftWrap.giftMessage?.message && (
                <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                  "{giftWrap.giftMessage.message}"
                </p>
              )}
            </div>
            <span className="font-bold text-pink-600">+{giftWrap.price}₺</span>
          </div>
        )}

        {/* ... summary totals */}
      </div>
    </div>
  )
}