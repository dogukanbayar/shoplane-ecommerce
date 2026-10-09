import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Trophy, TrendingUp, Award } from 'lucide-react'
import API from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import AdvancedSeo from '../../components/seo/AdvancedSeo'

function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState([])
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState('all_time')

  useEffect(() => {
    fetchLeaderboard()
  }, [period])

  const fetchLeaderboard = async () => {
    try {
      setLoading(true)
      const response = await API.get(`/loyalty/leaderboard?period=${period}&limit=50`)
      setLeaderboard(response.data.leaderboard)
    } catch (error) {
      toast.error('Leaderboard yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const getTierColor = (tier) => {
    const colors = {
      bronze: 'text-orange-700',
      silver: 'text-gray-500',
      gold: 'text-yellow-500',
      platinum: 'text-purple-500',
      diamond: 'text-cyan-400'
    }
    return colors[tier] || colors.bronze
  }

  const getRankMedal = (rank) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return null
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
        title="Leaderboard - MyShop Loyalty"
        description="See top loyalty program members"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-block mb-4"
            >
              <div className="w-20 h-20 bg-gradient-to-r from-yellow-600 to-orange-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                <Trophy size={40} className="text-white" />
              </div>
            </motion.div>
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-5xl font-bold mb-4 dark:text-dark-text"
            >
              Leaderboard
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-gray-600 dark:text-gray-400"
            >
              Top loyalty program members
            </motion.p>
          </div>

          {/* Period Filter */}
          <div className="flex justify-center gap-3 mb-8">
            {[
              { id: 'all_time', label: 'All Time' },
              { id: 'month', label: 'This Month' },
              { id: 'week', label: 'This Week' }
            ].map((p) => (
              <button
                key={p.id}
                onClick={() => setPeriod(p.id)}
                className={`px-6 py-3 rounded-xl font-semibold transition ${
                  period === p.id
                    ? 'bg-gradient-to-r from-yellow-600 to-orange-600 text-white'
                    : 'bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border hover:border-yellow-500'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>

          {/* Top 3 Podium */}
          {leaderboard.length >= 3 && (
            <div className="grid grid-cols-3 gap-4 mb-8">
              {/* 2nd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-8"
              >
                <div className="bg-gradient-to-r from-gray-400 to-gray-600 rounded-2xl p-6 text-white text-center">
                  <div className="text-6xl mb-2">🥈</div>
                  <p className="text-2xl font-bold mb-1">
                    {leaderboard[1].user.name}
                  </p>
                  <p className="text-3xl font-bold mb-2">
                    {leaderboard[1].points.toLocaleString()}
                  </p>
                  <p className="text-sm opacity-80">points</p>
                  <div className="mt-3 px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                    {leaderboard[1].tier.toUpperCase()}
                  </div>
                </div>
              </motion.div>

              {/* 1st Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-2xl p-6 text-white text-center">
                  <div className="text-7xl mb-2">🥇</div>
                  <p className="text-3xl font-bold mb-1">
                    {leaderboard[0].user.name}
                  </p>
                  <p className="text-4xl font-bold mb-2">
                    {leaderboard[0].points.toLocaleString()}
                  </p>
                  <p className="text-sm opacity-80">points</p>
                  <div className="mt-3 px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                    {leaderboard[0].tier.toUpperCase()}
                  </div>
                </div>
              </motion.div>

              {/* 3rd Place */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="mt-16"
              >
                <div className="bg-gradient-to-r from-orange-700 to-orange-900 rounded-2xl p-6 text-white text-center">
                  <div className="text-5xl mb-2">🥉</div>
                  <p className="text-xl font-bold mb-1">
                    {leaderboard[2].user.name}
                  </p>
                  <p className="text-2xl font-bold mb-2">
                    {leaderboard[2].points.toLocaleString()}
                  </p>
                  <p className="text-sm opacity-80">points</p>
                  <div className="mt-3 px-3 py-1 bg-white/20 rounded-full text-xs font-bold">
                    {leaderboard[2].tier.toUpperCase()}
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* Rest of Leaderboard */}
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6 border-b dark:border-dark-border">
              <h2 className="text-2xl font-bold dark:text-dark-text">
                Full Rankings
              </h2>
            </div>

            <div className="divide-y dark:divide-dark-border">
              {leaderboard.slice(3).map((entry, index) => {
                const actualRank = index + 4
                const medal = getRankMedal(actualRank)

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.02 }}
                    className="p-6 hover:bg-gray-50 dark:hover:bg-dark-hover transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gray-100 dark:bg-dark-border rounded-full flex items-center justify-center font-bold text-gray-600 dark:text-gray-400">
                          {medal || `#${actualRank}`}
                        </div>
                        <div>
                          <p className="font-bold text-lg dark:text-dark-text">
                            {entry.user.name}
                          </p>
                          <p className={`text-sm font-semibold capitalize ${getTierColor(entry.tier)}`}>
                            {entry.tier}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold dark:text-dark-text">
                          {entry.points.toLocaleString()}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          points
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default LeaderboardPage