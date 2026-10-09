import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Package, Calendar, CreditCard, Truck, Clock, X } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import AdvancedSeo from '../../components/seo/AdvancedSeo'

function MyPreOrders() {
    const navigate = useNavigate()
    const [preOrders, setPreOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchPreOrders()
    }, [])

    const fetchPreOrders = async () => {
        try {
            setLoading(true)
            const response = await API.get('/pre-orders/my-orders')
            setPreOrders(response.data.preOrders)
        } catch (error) {
            toast.error('Ön siparişler yüklenemedi')
        } finally {
            setLoading(false)
        }
    }

    const handlePayDeposit = async (preOrderId) => {
        navigate('/payment', {
            state: {
                preOrderId,
                isPreOrder: true,
                paymentType: 'deposit'
            }
        })
    }

    const handlePayRemaining = async (preOrderId) => {
        navigate('/payment', {
            state: {
                preOrderId,
                isPreOrder: true,
                paymentType: 'remaining'
            }
        })
    }

    const handleCancel = async (preOrderId) => {
        if (!confirm('Ön siparişi iptal etmek istediğinizden emin misiniz?')) {
            return
        }

        try {
            await API.post(`/pre-orders/${preOrderId}/cancel`, {
                reason: 'Müşteri talebi'
            })
            toast.success('Ön sipariş iptal edildi')
            fetchPreOrders()
        } catch (error) {
            toast.error('İptal işlemi başarısız')
        }
    }

    const statusConfig = {
        pending: {
            color: 'bg-yellow-500',
            text: 'Depozito Bekliyor',
            icon: Clock
        },
        deposit_paid: {
            color: 'bg-blue-500',
            text: 'Depozito Ödendi',
            icon: CreditCard
        },
        full_paid: {
            color: 'bg-green-500',
            text: 'Ödeme Tamamlandı',
            icon: CreditCard
        },
        preparing: {
            color: 'bg-purple-500',
            text: 'Hazırlanıyor',
            icon: Package
        },
        shipped: {
            color: 'bg-indigo-500',
            text: 'Kargoda',
            icon: Truck
        },
        delivered: {
            color: 'bg-green-600',
            text: 'Teslim Edildi',
            icon: Package
        },
        cancelled: {
            color: 'bg-red-500',
            text: 'İptal Edildi',
            icon: X
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
                <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full"></div>
            </div>
        )
    }

    return (
        <>
            <AdvancedSeo
                title="Ön Siparişlerim - MyShop"
                description="Ön siparişlerinizi görüntüleyin, takip edin ve ödemelerinizi yapın."
                keywords="ön sipariş, sipariş takibi, ön ödeme"
            />

            <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
                <div className="max-w-6xl mx-auto px-4">
                    {/* Header */}
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                            <Package size={32} className="text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold dark:text-dark-text">Ön Siparişlerim</h1>
                            <p className="text-gray-600 dark:text-gray-400">{preOrders.length} ön sipariş</p>
                        </div>
                    </div>

                    {/* Pre-Orders List */}
                    {preOrders.length === 0 ? (
                        <div className="text-center py-12">
                            <Package size={64} className="mx-auto mb-4 text-gray-400" />
                            <h3 className="text-xl font-bold mb-2 dark:text-dark-text">Ön Siparişiniz Yok</h3>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">
                                Yeni çıkacak ürünleri ilk alanlardan olun!
                            </p>
                            <button
                                onClick={() => navigate('/products')}
                                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl transition"
                            >
                                Ürünlere Göz At
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {preOrders.map((preOrder) => {
                                const status = statusConfig[preOrder.status]
                                const StatusIcon = status.icon

                                return (
                                    <motion.div
                                        key={preOrder._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden"
                                    >
                                        {/* Status Bar */}
                                        <div className={`${status.color} p-3 flex items-center justify-between text-white`}>
                                            <div className="flex items-center gap-2">
                                                <StatusIcon size={20} />
                                                <span className="font-bold">{status.text}</span>
                                            </div>
                                            <span className="text-sm">#{preOrder.orderNumber}</span>
                                        </div>

                                        <div className="p-6">
                                            <div className="flex flex-col md:flex-row gap-6">
                                                {/* Product Image */}
                                                <img
                                                    src={preOrder.product.images[0]}
                                                    alt={preOrder.product.name}
                                                    className="w-full md:w-32 h-32 object-cover rounded-xl"
                                                />

                                                {/* Details */}
                                                <div className="flex-1">
                                                    <h3 className="text-xl font-bold mb-2 dark:text-dark-text">
                                                        {preOrder.product.name}
                                                    </h3>

                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                        <div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">Adet</p>
                                                            <p className="font-bold dark:text-dark-text">{preOrder.quantity}</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">Toplam</p>
                                                            <p className="font-bold text-purple-600">{preOrder.totalAmount}₺</p>
                                                        </div>
                                                        <div>
                                                            <p className="text-sm text-gray-600 dark:text-gray-400">Depozito</p>
                                                            <p className="font-bold dark:text-dark-text">{preOrder.depositAmount}₺</p>
                                                        </div>
                                                        {preOrder.remainingAmount > 0 && (
                                                            <div>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">Kalan</p>
                                                                <p className="font-bold text-orange-600">{preOrder.remainingAmount}₺</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Estimated Delivery */}
                                                    {preOrder.estimatedDelivery && (
                                                        <div className="flex items-center gap-2 mb-4 text-sm text-gray-600 dark:text-gray-400">
                                                            <Calendar size={16} />
                                                            <span>
                                                                Tahmini Teslimat: {new Date(preOrder.estimatedDelivery).toLocaleDateString('tr-TR')}
                                                            </span>
                                                        </div>
                                                    )}

                                                    {/* Actions */}
                                                    <div className="flex flex-wrap gap-3">
                                                        {!preOrder.depositPaid && (
                                                            <button
                                                                onClick={() => handlePayDeposit(preOrder._id)}
                                                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                                                            >
                                                                Depozito Öde ({preOrder.depositAmount}₺)
                                                            </button>
                                                        )}

                                                        {preOrder.depositPaid && !preOrder.fullPaymentPaid && preOrder.remainingAmount > 0 && (
                                                            <button
                                                                onClick={() => handlePayRemaining(preOrder._id)}
                                                                className="px-6 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg transition"
                                                            >
                                                                Kalan Tutarı Öde ({preOrder.remainingAmount}₺)
                                                            </button>
                                                        )}

                                                        {preOrder.trackingNumber && (
                                                            <button
                                                                onClick={() => window.open(preOrder.trackingUrl, '_blank')}
                                                                className="px-6 py-2 border-2 border-purple-600 text-purple-600 rounded-lg font-semibold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition"
                                                            >
                                                                Kargoyu Takip Et
                                                            </button>
                                                        )}

                                                        {!['shipped', 'delivered', 'cancelled'].includes(preOrder.status) && (
                                                            <button
                                                                onClick={() => handleCancel(preOrder._id)}
                                                                className="px-6 py-2 border-2 border-red-600 text-red-600 rounded-lg font-semibold hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                                            >
                                                                İptal Et
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default MyPreOrders
