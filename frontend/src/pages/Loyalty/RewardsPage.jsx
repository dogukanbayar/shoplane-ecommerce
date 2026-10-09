import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Gift, Star, ShoppingBag, Truck, CreditCard, Award } from 'lucide-react'
import API from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import AdvancedSeo from '../../components/seo/AdvancedSeo'

function RewardsPage() {
  const { user } = useAuthStore()
  const [rewards, setRewards] = useState([])
  const [program, setProgram] = useState(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    type: '',
    featured: false
  })

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filters.type) params.append('type', filters.type)
      if (filters.featured) params.append('featured', 'true')

      const [rewardsRes, programRes] = await Promise.all([
        API.get(`/loyalty/rewards?${params.toString()}`),
        user ? API.get('/loyalty/my-program') : Promise.resolve({ data: { program: null } })
      ])

      setRewards(rewardsRes.data.rewards)
      setProgram(programRes.data.program)
    } catch (error) {
      toast.error('Rewards yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleRedeem = async (rewardId) => {
    if (!user) {
      toast.error('Please login to redeem rewards')
      return
    }

    try {
      const response = await API.post(`/loyalty/redeem/${rewardId}`)
      toast.success(response.data.message)
      
      // Show redemption code
      toast.success(`Your code: ${response.data.code}`, { duration: 5000 })
      
      // Refresh data
      fetchData()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Redemption failed')
    }
  }

  const getRewardIcon = (type) => {
    const icons = {
      discount_percentage: CreditCard,
      discount_amount: CreditCard,
      free_shipping: Truck,
      free_product: ShoppingBag,
      gift_card: Gift
    }
    return icons[type] || Gift
  }

  const getRewardColor = (type) => {
    const colors = {
      discount_percentage: 'from-blue-600 to-cyan-600',
      discount_amount: 'from-purple-600 to-pink-600',
      free_shipping: 'from-green-600 to-emerald-600',
      free_product: 'from-orange-600 to-red-600',
      gift_card: 'from-yellow-600 to-orange-600'
    }
    return colors[type] || 'from-gray-600 to-gray-800'
  }

  const canAfford = (reward) => {
    return program && program.points.current >= reward.pointsCost
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  return (
    <>
      <AdvancedSeo
        title="Rewards Catalog - MyShop"
        description="Redeem your loyalty points for exclusive rewards"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block mb-4"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                <Gift size={40} className="text-white" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-bold mb-4 dark:text-dark-text"
            >
              Rewards Catalog
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-400"
            >
              Redeem your points for exclusive rewards!
            </motion.p>

            {program && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-6 inline-block px-6 py-3 bg-gradient-to-r from-yellow-600 to-orange-600 text-white rounded-xl font-bold text-lg"
              >
                <Star size={20} className="inline mr-2" />
                You have {program.points.current.toLocaleString()} points
              </motion.div>
            )}
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-dark-card rounded-xl shadow-xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <label className="font-semibold dark:text-dark-text">
                Filter by Type:
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters({ ...filters, type: e.target.value })}
                className="px-4 py-2 border-2 border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:border-blue-500 dark:bg-dark-hover dark:text-dark-text"
              >
                <option value="">All Types</option>
                <option value="discount_percentage">Percentage Discount</option>
                <option value="discount_amount">Amount Discount</option>
                <option value="free_shipping">Free Shipping</option>
                <option value="free_product">Free Product</option>
                <option value="gift_card">Gift Card</option>
              </select>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.featured}
                  onChange={(e) => setFilters({ ...filters, featured: e.target.checked })}
                  className="w-5 h-5"
                />
                <span className="font-semibold dark:text-dark-text">Featured Only</span>
              </label>
            </div>
          </div>

          {/* Rewards Grid */}
          {rewards.length === 0 ? (
            <div className="text-center py-20">
              <Gift size={64} className="mx-auto mb-4 text-gray-400" />
              <p className="text-xl text-gray-600 dark:text-gray-400">
                No rewards available
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward, index) => {
                const Icon = getRewardIcon(reward.type)
                const color = getRewardColor(reward.type)
                const affordable = canAfford(reward)

                return (
                  <motion.div
                    key={reward._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden"
                  >
                    {/* Badge */}
                    {reward.badge && (
                      <div className="absolute top-4 left-4 px-3 py-1 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-full text-xs font-bold z-10">
                        {reward.badge}
                      </div>
                    )}

                    {/* Header */}
                    <div className={`bg-gradient-to-r ${color} p-6 text-white`}>
                      <Icon size={48} className="mb-4" />
                      <h3 className="text-2xl font-bold mb-2">
                        {reward.name}
                      </h3>
                      <p className="text-sm opacity-90">
                        {reward.description}
                      </p>
                    </div>

                    {/* Content */}
                    <div className="p-6">
                      {/* Value Display */}
                      <div className="mb-4 text-center">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                          Reward Value
                        </p>
                        <p className="text-4xl font-bold text-purple-600">
                          {reward.type.includes('percentage') 
                            ? `${reward.value}%`
                            : `${reward.value}₺`
                          }
                        </p>
                      </div>

                      {/* Points Cost */}
                      <div className="mb-4 p-4 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 rounded-xl border border-yellow-200 dark:border-yellow-900">
                        <div className="flex items-center justify-center gap-2">
                          <Star size={24} className="text-yellow-600" />
                          <p className="text-2xl font-bold text-yellow-600">
                            {reward.pointsCost.toLocaleString()}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            points
                          </p>
                        </div>
                      </div>

                      {/* Restrictions */}
                      {reward.restrictions && (
                        <div className="mb-4 space-y-2 text-xs text-gray-600 dark:text-gray-400">
                          {reward.restrictions.minPurchaseAmount && (
                            <p>• Min purchase: {reward.restrictions.minPurchaseAmount}₺</p>
                          )}
                          {reward.restrictions.maxDiscountAmount && (
                            <p>• Max discount: {reward.restrictions.maxDiscountAmount}₺</p>
                          )}
                          {reward.restrictions.tierRequired && (
                            <p>• Requires: {reward.restrictions.tierRequired} tier</p>
                          )}
                        </div>
                      )}

                      {/* Stock */}
                      {reward.stock !== -1 && (
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
                          {reward.stock} remaining
                        </p>
                      )}

                      {/* Redeem Button */}
                      <button
                        onClick={() => handleRedeem(reward._id)}
                        disabled={!user || !affordable}
                        className={`w-full py-3 rounded-xl font-bold transition ${
                          !user || !affordable
                            ? 'bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-xl'
                        }`}
                      >
                        {!user 
                          ? 'Login to Redeem'
                          : !affordable
                          ? `Need ${(reward.pointsCost - (program?.points.current || 0)).toLocaleString()} more points`
                          : 'Redeem Now'
                        }
                      </button>
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

export default RewardsPage