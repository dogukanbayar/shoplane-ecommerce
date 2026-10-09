import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Award, TrendingUp, Users, Star } from 'lucide-react'
import API from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import AdvancedSeo from '../../components/seo/AdvancedSeo'

function LoyaltyStats() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await API.get('/loyalty/admin/stats')
      setStats(response.data.stats)
    } catch (error) {
      toast.error('Stats yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!stats) return null

  const redemptionRate = stats.totalPointsIssued > 0
    ? (stats.totalPointsRedeemed / stats.totalPointsIssued) * 100
    : 0

  return (
    <>
      <AdvancedSeo
        title="Loyalty Stats - MyShop Admin"
        description="Loyalty program statistics and analytics"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
              <Award size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold dark:text-dark-text">
                Loyalty Program Stats
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Program performance ve kullanıcı istatistikleri
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Users}
              label="Total Programs"
              value={stats.totalPrograms.toLocaleString()}
              color="from-blue-600 to-cyan-600"
            />
            <StatCard
              icon={Award}
              label="Active Programs"
              value={stats.activePrograms.toLocaleString()}
              color="from-green-600 to-emerald-600"
            />
            <StatCard
              icon={Star}
              label="Points Issued"
              value={stats.totalPointsIssued.toLocaleString()}
              color="from-yellow-600 to-orange-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Points Redeemed"
              value={stats.totalPointsRedeemed.toLocaleString()}
              color="from-purple-600 to-pink-600"
            />
          </div>

          {/* Redemption Rate */}
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 dark:text-dark-text">
              Redemption Rate
            </h2>
            <div className="mb-2 flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {redemptionRate.toFixed(2)}%
              </span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {stats.totalPointsRedeemed.toLocaleString()} / {stats.totalPointsIssued.toLocaleString()} points
              </span>
            </div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                style={{ width: `${redemptionRate}%` }}
              />
            </div>
          </div>

          {/* Tier Distribution */}
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
            <h2 className="text-xl font-bold mb-6 dark:text-dark-text">
              Tier Distribution
            </h2>

            <div className="space-y-4">
              {stats.tierDistribution.map((tier, index) => {
                const percentage = (tier.count / stats.totalPrograms) * 100

                const tierColors = {
                  bronze: 'from-orange-700 to-orange-900',
                  silver: 'from-gray-400 to-gray-600',
                  gold: 'from-yellow-400 to-yellow-600',
                  platinum: 'from-purple-400 to-purple-600',
                  diamond: 'from-blue-400 to-cyan-400'
                }

                return (
                  <div key={index}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold capitalize dark:text-dark-text">
                        {tier._id}
                      </span>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {tier.count} ({percentage.toFixed(1)}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 0.5, delay: index * 0.1 }}
                        className={`h-full bg-gradient-to-r ${tierColors[tier._id] || tierColors.bronze}`}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

// Stat Card Component
function StatCard({ icon: Icon, label, value, color }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-dark-card rounded-xl shadow-xl p-6"
    >
      <div className="flex items-center justify-between mb-3">
        <div className={`w-12 h-12 bg-gradient-to-r ${color} rounded-xl flex items-center justify-center`}>
          <Icon size={24} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold mb-1 dark:text-dark-text">{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
    </motion.div>
  )
}

export default LoyaltyStats