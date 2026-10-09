import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Award, TrendingUp, Gift, Users, 
  Star, Clock, Copy, CheckCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import useAuthStore from '../../store/authStore'
import AdvancedSeo from '../../components/seo/AdvancedSeo'

function LoyaltyDashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [program, setProgram] = useState(null)
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!user) {
      navigate('/login')
      return
    }
    fetchData()
  }, [user])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [programRes, transactionsRes] = await Promise.all([
        API.get('/loyalty/my-program'),
        API.get('/loyalty/transactions?limit=10')
      ])

      setProgram(programRes.data.program)
      setTransactions(transactionsRes.data.transactions)
    } catch (error) {
      toast.error('Data yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const copyReferralCode = () => {
    navigator.clipboard.writeText(program.referrals.code)
    setCopied(true)
    toast.success('Referral code copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const getTierColor = (tier) => {
    const colors = {
      bronze: 'from-orange-700 to-orange-900',
      silver: 'from-gray-400 to-gray-600',
      gold: 'from-yellow-400 to-yellow-600',
      platinum: 'from-purple-400 to-purple-600',
      diamond: 'from-blue-400 to-cyan-400'
    }
    return colors[tier] || colors.bronze
  }

  const getTierIcon = (tier) => {
    return tier === 'diamond' ? '💎' : tier === 'platinum' ? '🏆' : tier === 'gold' ? '🥇' : tier === 'silver' ? '🥈' : '🥉'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!program) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Program yüklenemedi</p>
      </div>
    )
  }

  const tierProgress = program.tier.pointsToNextTier > 0
    ? ((program.points.lifetime / (program.points.lifetime + program.tier.pointsToNextTier)) * 100)
    : 100

  return (
    <>
      <AdvancedSeo
        title="Loyalty Program - MyShop"
        description="Earn points, unlock rewards, and enjoy exclusive benefits"
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
                <Award size={40} className="text-white" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-bold mb-4 dark:text-dark-text"
            >
              Loyalty Program
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-400"
            >
              Welcome back, {user.name}! 🎉
            </motion.p>
          </div>

          {/* Tier Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-gradient-to-r ${getTierColor(program.tier.current)} rounded-3xl shadow-2xl p-8 mb-8 text-white`}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-sm opacity-80 mb-2">Current Tier</p>
                <div className="flex items-center gap-3">
                  <span className="text-5xl">{getTierIcon(program.tier.current)}</span>
                  <h2 className="text-4xl font-bold capitalize">
                    {program.tier.current}
                  </h2>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm opacity-80 mb-2">Total Points Earned</p>
                <p className="text-4xl font-bold">
                  {program.points.lifetime.toLocaleString()}
                </p>
              </div>
            </div>

            {/* Progress to Next Tier */}
            {program.tier.pointsToNextTier > 0 && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm opacity-80">
                    Progress to Next Tier
                  </p>
                  <p className="text-sm font-semibold">
                    {program.tier.pointsToNextTier.toLocaleString()} points to go
                  </p>
                </div>
                <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${tierProgress}%` }}
                    transition={{ duration: 1, delay: 0.3 }}
                    className="h-full bg-white rounded-full"
                  />
                </div>
              </div>
            )}

            {/* Benefits */}
            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
              {program.tier.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="px-3 py-2 bg-white/20 backdrop-blur rounded-lg text-center text-sm"
                >
                  ✓ {benefit.type}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={Star}
              label="Available Points"
              value={program.points.current.toLocaleString()}
              color="from-yellow-600 to-orange-600"
            />
            <StatCard
              icon={Clock}
              label="Pending Points"
              value={program.points.pending.toLocaleString()}
              color="from-blue-600 to-cyan-600"
            />
            <StatCard
              icon={TrendingUp}
              label="Current Streak"
              value={`${program.streaks.current} days`}
              color="from-green-600 to-emerald-600"
            />
            <StatCard
              icon={Award}
              label="Achievements"
              value={program.achievements.length}
              color="from-purple-600 to-pink-600"
            />
          </div>

          {/* Referral Card */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 border border-indigo-200 dark:border-indigo-900 rounded-2xl p-6 mb-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Users size={24} className="text-indigo-600" />
                  <h3 className="text-xl font-bold dark:text-dark-text">
                    Refer Friends, Earn Points!
                  </h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Share your referral code and get 500 points for each friend who signs up!
                </p>

                <div className="flex items-center gap-3">
                  <div className="flex-1 px-4 py-3 bg-white dark:bg-dark-card rounded-lg border-2 border-indigo-200 dark:border-indigo-900">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                      Your Referral Code
                    </p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {program.referrals.code}
                    </p>
                  </div>
                  <button
                    onClick={copyReferralCode}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-semibold hover:bg-indigo-700 transition flex items-center gap-2"
                  >
                    {copied ? <CheckCircle size={20} /> : <Copy size={20} />}
                    {copied ? 'Copied!' : 'Copy'}
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="text-center p-3 bg-white dark:bg-dark-card rounded-lg">
                    <p className="text-2xl font-bold text-indigo-600">
                      {program.referrals.totalReferrals}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Total Referrals
                    </p>
                  </div>
                  <div className="text-center p-3 bg-white dark:bg-dark-card rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {program.referrals.pointsEarned}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      Points Earned
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <button
              onClick={() => navigate('/loyalty/rewards')}
              className="p-6 bg-white dark:bg-dark-card rounded-2xl shadow-xl hover:shadow-2xl transition group"
            >
              <Gift size={40} className="text-purple-600 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-xl font-bold mb-2 dark:text-dark-text">
                Browse Rewards
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Redeem your points for exclusive rewards
              </p>
            </button>

            <button
              onClick={() => navigate('/loyalty/leaderboard')}
              className="p-6 bg-white dark:bg-dark-card rounded-2xl shadow-xl hover:shadow-2xl transition group"
            >
              <TrendingUp size={40} className="text-blue-600 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-xl font-bold mb-2 dark:text-dark-text">
                Leaderboard
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                See how you rank against others
              </p>
            </button>

            <button
              onClick={() => navigate('/loyalty/history')}
              className="p-6 bg-white dark:bg-dark-card rounded-2xl shadow-xl hover:shadow-2xl transition group"
            >
              <Clock size={40} className="text-green-600 mb-4 group-hover:scale-110 transition" />
              <h3 className="text-xl font-bold mb-2 dark:text-dark-text">
                Points History
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                View your complete transaction history
              </p>
            </button>
          </div>

          {/* Recent Transactions */}
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
            <h3 className="text-2xl font-bold mb-6 dark:text-dark-text">
              Recent Activity
            </h3>

            {transactions.length === 0 ? (
              <p className="text-center text-gray-600 dark:text-gray-400 py-8">
                No transactions yet
              </p>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-dark-hover rounded-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        transaction.points > 0
                          ? 'bg-green-100 dark:bg-green-900/20'
                          : 'bg-red-100 dark:bg-red-900/20'
                      }`}>
                        {transaction.points > 0 ? (
                          <TrendingUp size={24} className="text-green-600" />
                        ) : (
                          <Gift size={24} className="text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold dark:text-dark-text">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(transaction.earnedAt).toLocaleDateString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.points > 0 ? '+' : ''}{transaction.points}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        points
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {transactions.length > 0 && (
              <button
                onClick={() => navigate('/loyalty/history')}
                className="w-full mt-4 py-3 text-blue-600 font-semibold hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition"
              >
                View All Transactions
              </button>
            )}
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

export default LoyaltyDashboard
