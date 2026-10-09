import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, Users, ShoppingCart, DollarSign, 
  Link as LinkIcon, Calendar, Award, BarChart3,
  Copy, Check, ExternalLink
} from 'lucide-react'
import { Line, Bar } from 'recharts'
import API from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import AdvancedSeo from '../../components/seo/AdvancedSeo'

function InfluencerDashboard() {
  const [dashboard, setDashboard] = useState(null)
  const [influencer, setInfluencer] = useState(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchDashboard()
    fetchProfile()
  }, [])

  const fetchDashboard = async () => {
    try {
      const response = await API.get('/influencers/dashboard')
      setDashboard(response.data.dashboard)
    } catch (error) {
      toast.error('Dashboard yüklenemedi')
    }
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await API.get('/influencers/me')
      setInfluencer(response.data.influencer)
    } catch (error) {
      console.error('Error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyReferralLink = () => {
    const link = `${window.location.origin}?ref=${influencer.referralCode}`
    navigator.clipboard.writeText(link)
    setCopied(true)
    toast.success('Link kopyalandı!')
    setTimeout(() => setCopied(false), 2000)
  }

  const tierConfig = {
    bronze: {
      name: 'Bronze',
      color: 'from-orange-600 to-amber-600',
      badge: '🥉',
      commission: 10
    },
    silver: {
      name: 'Silver',
      color: 'from-gray-400 to-gray-600',
      badge: '🥈',
      commission: 15
    },
    gold: {
      name: 'Gold',
      color: 'from-yellow-400 to-yellow-600',
      badge: '🥇',
      commission: 20
    },
    platinum: {
      name: 'Platinum',
      color: 'from-cyan-400 to-blue-600',
      badge: '💎',
      commission: 25
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!influencer) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="text-center">
          <Users size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-bold mb-2 dark:text-dark-text">
            Influencer Profili Bulunamadı
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Influencer olmak için başvurun!
          </p>
          <button
            onClick={() => window.location.href = '/influencer/apply'}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition"
          >
            Başvuru Yap
          </button>
        </div>
      </div>
    )
  }

  const tier = tierConfig[influencer.tier]

  return (
    <>
      <AdvancedSeo
        title="Influencer Dashboard - MyShop"
        description="Influencer paneli. Kazançlarınızı, istatistiklerinizi ve referral linklerinizi yönetin."
        keywords="influencer, referral, komisyon, kazanç"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-8 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-3xl">
                  {influencer.profileImage ? (
                    <img src={influencer.profileImage} alt={influencer.displayName} className="w-full h-full rounded-full object-cover" />
                  ) : (
                    '👤'
                  )}
                </div>
                <div>
                  <h1 className="text-3xl font-bold dark:text-dark-text">
                    {influencer.displayName}
                  </h1>
                  <div className="flex items-center gap-2 mt-2">
                    <div className={`px-3 py-1 bg-gradient-to-r ${tier.color} text-white rounded-full text-sm font-bold flex items-center gap-1`}>
                      <span>{tier.badge}</span>
                      <span>{tier.name} Influencer</span>
                    </div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      %{dashboard?.commissionRate} Komisyon
                    </span>
                  </div>
                </div>
              </div>

              {/* Referral Link */}
              <div className="w-full md:w-auto">
                <p className="text-sm font-semibold mb-2 dark:text-dark-text">
                  Referral Linkiniz
                </p>
                <div className="flex gap-2">
                  <div className="flex-1 px-4 py-2 bg-gray-100 dark:bg-dark-hover rounded-lg font-mono text-sm dark:text-dark-text">
                    myshop.com?ref={influencer.referralCode}
                  </div>
                  <button
                    onClick={handleCopyReferralLink}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    {copied ? <Check size={20} /> : <Copy size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {/* Total Clicks */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center">
                  <Users className="text-blue-600" size={24} />
                </div>
                <span className="text-sm text-green-600 font-semibold">
                  +{dashboard?.last30Days.clicks} (30 gün)
                </span>
              </div>
              <h3 className="text-3xl font-bold mb-1 dark:text-dark-text">
                {dashboard?.overall.totalClicks.toLocaleString()}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Toplam Tıklama</p>
            </motion.div>

            {/* Total Orders */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center">
                  <ShoppingCart className="text-green-600" size={24} />
                </div>
                <span className="text-sm text-green-600 font-semibold">
                  +{dashboard?.last30Days.orders} (30 gün)
                </span>
              </div>
              <h3 className="text-3xl font-bold mb-1 dark:text-dark-text">
                {dashboard?.overall.totalOrders.toLocaleString()}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Toplam Sipariş</p>
            </motion.div>

            {/* Total Sales */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-xl flex items-center justify-center">
                  <TrendingUp className="text-purple-600" size={24} />
                </div>
                <span className="text-sm text-green-600 font-semibold">
                  +{dashboard?.last30Days.sales.toFixed(0)}₺ (30 gün)
                </span>
              </div>
              <h3 className="text-3xl font-bold mb-1 dark:text-dark-text">
                {dashboard?.overall.totalSales.toLocaleString()}₺
              </h3>
              <p className="text-gray-600 dark:text-gray-400">Toplam Satış</p>
            </motion.div>

            {/* Total Earnings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl shadow-xl p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <DollarSign className="text-white" size={24} />
                </div>
                <span className="text-sm text-white font-semibold">
                  +{dashboard?.last30Days.earnings.toFixed(0)}₺ (30 gün)
                </span>
              </div>
              <h3 className="text-3xl font-bold mb-1 text-white">
                {dashboard?.overall.totalEarnings.toLocaleString()}₺
              </h3>
              <p className="text-white/80">Toplam Kazanç</p>
            </motion.div>
          </div>

          {/* Secondary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {/* Conversion Rate */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <BarChart3 className="text-blue-600" size={24} />
                <h3 className="font-bold dark:text-dark-text">Conversion Rate</h3>
              </div>
              <p className="text-4xl font-bold text-blue-600">
                {dashboard?.overall.conversionRate.toFixed(2)}%
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Her 100 tıklamadan {dashboard?.overall.conversionRate.toFixed(0)} sipariş
              </p>
            </div>

            {/* Average Order Value */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <ShoppingCart className="text-green-600" size={24} />
                <h3 className="font-bold dark:text-dark-text">Ortalama Sipariş</h3>
              </div>
              <p className="text-4xl font-bold text-green-600">
                {dashboard?.overall.averageOrderValue.toFixed(0)}₺
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                Sipariş başına ortalama
              </p>
            </div>

            {/* Pending Earnings */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
              <div className="flex items-center gap-3 mb-3">
                <DollarSign className="text-orange-600" size={24} />
                <h3 className="font-bold dark:text-dark-text">Bekleyen Kazanç</h3>
              </div>
              <p className="text-4xl font-bold text-orange-600">
                {dashboard?.pendingEarnings.toFixed(0)}₺
              </p>
              <button className="mt-3 w-full py-2 bg-orange-600 text-white rounded-lg font-semibold hover:bg-orange-700 transition">
                Ödeme Talep Et
              </button>
            </div>
          </div>

          {/* Charts & Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Chart */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4 dark:text-dark-text">
                Son 7 Gün Performans
              </h3>
              {/* Chart component buraya gelecek */}
              <div className="h-64 flex items-center justify-center text-gray-400">
                Chart Area (Recharts)
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-4 dark:text-dark-text">
                En Çok Satan Ürünler
              </h3>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-dark-hover rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm dark:text-dark-text">Ürün Adı {i}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {Math.floor(Math.random() * 50)} satış
                      </p>
                    </div>
                    <p className="font-bold text-green-600">
                      {Math.floor(Math.random() * 500)}₺
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default InfluencerDashboard