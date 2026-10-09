import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, DollarSign, ShoppingCart, Users,
  Package, Star, Activity, Award, Gift, Filter
} from 'lucide-react'
import { Line, Bar, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import API from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import AdvancedSeo from '../../components/seo/AdvancedSeo'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

function ComprehensiveAnalytics() {
  const [data, setData] = useState(null)
  const [realtime, setRealtime] = useState(null)
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchRealtime, 30000) // Every 30 seconds
    return () => clearInterval(interval)
  }, [dateRange])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams(dateRange)
      const response = await API.get(`/analytics/dashboard?${params.toString()}`)
      setData(response.data.data)
      await fetchRealtime()
    } catch (error) {
      toast.error('Analytics yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  const fetchRealtime = async () => {
    try {
      const response = await API.get('/analytics/realtime')
      setRealtime(response.data.data)
    } catch (error) {
      console.error('Realtime error:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!data) return null

  // Revenue chart data
  const revenueChartData = {
    labels: data.revenueByDay.map(d => new Date(d.date).toLocaleDateString('tr-TR')),
    datasets: [
      {
        label: 'Revenue',
        data: data.revenueByDay.map(d => d.revenue),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  // Category performance chart
  const categoryChartData = {
    labels: data.categoryPerformance.map(c => c._id),
    datasets: [
      {
        label: 'Revenue by Category',
        data: data.categoryPerformance.map(c => c.revenue),
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ]
      }
    ]
  }

  return (
    <>
      <AdvancedSeo
        title="Comprehensive Analytics - MyShop Admin"
        description="Full business intelligence dashboard"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-[1800px] mx-auto px-4">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
                <Activity size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold dark:text-dark-text">
                  Comprehensive Analytics
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Complete business intelligence dashboard
                </p>
              </div>
            </div>

            {/* Date Range Picker */}
            <div className="flex items-center gap-3">
              <Filter size={20} className="text-gray-600" />
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) => setDateRange({ ...dateRange, startDate: e.target.value })}
                className="px-4 py-2 border-2 border-gray-200 dark:border-dark-border rounded-lg dark:bg-dark-card dark:text-dark-text"
              />
              <span className="text-gray-600 dark:text-gray-400">to</span>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) => setDateRange({ ...dateRange, endDate: e.target.value })}
                className="px-4 py-2 border-2 border-gray-200 dark:border-dark-border rounded-lg dark:bg-dark-card dark:text-dark-text"
              />
            </div>
          </div>

          {/* Realtime Stats */}
          {realtime && (
            <div className="grid grid-cols-3 gap-6 mb-8">
              <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl p-6 text-white">
                <p className="text-sm opacity-80 mb-1">🔴 Live - Last 24H</p>
                <p className="text-4xl font-bold">{realtime.ordersLast24h}</p>
                <p className="text-sm">Orders</p>
              </div>
              <div className="bg-gradient-to-r from-blue-600 to-cyan-600 rounded-xl p-6 text-white">
                <p className="text-sm opacity-80 mb-1">👥 Active Now</p>
                <p className="text-4xl font-bold">{realtime.activeUsers}</p>
                <p className="text-sm">Users</p>
              </div>
              <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl p-6 text-white">
                <p className="text-sm opacity-80 mb-1">📦 Recent</p>
                <p className="text-4xl font-bold">{realtime.recentOrders.length}</p>
                <p className="text-sm">Latest Orders</p>
              </div>
            </div>
          )}

          {/* Main Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <MetricCard
              icon={DollarSign}
              label="Total Revenue"
              value={`${data.revenue.total.toFixed(2)}₺`}
              growth={data.revenue.growth}
              color="from-green-600 to-emerald-600"
            />
            <MetricCard
              icon={ShoppingCart}
              label="Total Orders"
              value={data.orders.total}
              subtitle={`Avg ${data.orders.avgItemsPerOrder.toFixed(1)} items/order`}
              color="from-blue-600 to-cyan-600"
            />
            <MetricCard
              icon={Users}
              label="Total Customers"
              value={data.customers.total}
              subtitle={`${data.customers.new} new`}
              color="from-purple-600 to-pink-600"
            />
            <MetricCard
              icon={Package}
              label="Total Products"
              value={data.products.total}
              subtitle={`${data.products.lowStock} low stock`}
              color="from-orange-600 to-red-600"
            />
          </div>

          {/* Revenue Chart */}
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6 mb-8">
            <h3 className="text-xl font-bold mb-6 dark:text-dark-text">
              Revenue Trend
            </h3>
            <Line 
              data={revenueChartData}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: false }
                }
              }}
            />
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-2 gap-8 mb-8">
            {/* Category Performance */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-6 dark:text-dark-text">
                Category Performance
              </h3>
              <Bar 
                data={categoryChartData}
                options={{
                  responsive: true,
                  plugins: {
                    legend: { display: false }
                  }
                }}
              />
            </div>

            {/* Top Products */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-6 dark:text-dark-text">
                Top Products
              </h3>
              <div className="space-y-3">
                {data.topProducts.slice(0, 5).map((product, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-gray-50 dark:bg-dark-hover rounded-lg"
                  >
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold dark:text-dark-text">{product.name}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {product.totalSold} sold
                      </p>
                    </div>
                    <p className="font-bold text-green-600">
                      {product.revenue.toFixed(2)}₺
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Additional Stats Grid */}
          <div className="grid grid-cols-3 gap-6">
            {/* Conversion Funnel */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-6 dark:text-dark-text">
                Conversion Funnel
              </h3>
              <div className="space-y-4">
                <FunnelStep 
                  label="Visitors"
                  value={data.conversionFunnel.visitors}
                  percentage={100}
                />
                <FunnelStep 
                  label="Added to Cart"
                  value={data.conversionFunnel.addedToCart}
                  percentage={data.conversionFunnel.rates.cartConversion}
                />
                <FunnelStep 
                  label="Checkouts"
                  value={data.conversionFunnel.checkouts}
                  percentage={data.conversionFunnel.rates.checkoutConversion}
                />
                <FunnelStep 
                  label="Purchases"
                  value={data.conversionFunnel.purchases}
                  percentage={data.conversionFunnel.rates.purchaseConversion}
                />
              </div>
            </div>

            {/* Customer Lifetime Value */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-6 dark:text-dark-text">
                Customer Metrics
              </h3>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Avg Lifetime Value
                  </p>
                  <p className="text-3xl font-bold text-purple-600">
                    {data.customerLifetimeValue.avgLifetimeValue.toFixed(2)}₺
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Avg Order Count
                  </p>
                  <p className="text-2xl font-bold dark:text-dark-text">
                    {data.customerLifetimeValue.avgOrderCount.toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                    Avg Order Value
                  </p>
                  <p className="text-2xl font-bold dark:text-dark-text">
                    {data.customerLifetimeValue.avgOrderValue.toFixed(2)}₺
                  </p>
                </div>
              </div>
            </div>

            {/* Bundle Performance */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
              <h3 className="text-xl font-bold mb-6 dark:text-dark-text">
                Bundle Performance
              </h3>
              <div className="space-y-3">
                {data.bundlePerformance.slice(0, 5).map((bundle, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-dark-hover rounded-lg">
                    <p className="font-semibold text-sm dark:text-dark-text mb-1">
                      {bundle.name}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-600 dark:text-gray-400">
                        {bundle.sales} sales
                      </span>
                      <span className="font-bold text-green-600">
                        {bundle.revenue.toFixed(0)}₺
                      </span>
                    </div>
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

// Metric Card Component
function MetricCard({ icon: Icon, label, value, growth, subtitle, color }) {
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
        {growth !== undefined && (
          <div className={`px-2 py-1 rounded-full text-xs font-bold ${
            growth >= 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
          }`}>
            {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
          </div>
        )}
      </div>
      <p className="text-3xl font-bold mb-1 dark:text-dark-text">{value}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      {subtitle && (
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">{subtitle}</p>
      )}
    </motion.div>
  )
}

// Funnel Step Component
function FunnelStep({ label, value, percentage }) {
  return (
    <div>
      <div className="flex justify-between mb-1">
        <span className="text-sm font-semibold dark:text-dark-text">{label}</span>
        <span className="text-sm text-gray-600 dark:text-gray-400">
          {value} ({percentage.toFixed(1)}%)
        </span>
      </div>
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-purple-600"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default ComprehensiveAnalytics