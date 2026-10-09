import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flame, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import HeatmapViewer from '../../components/analytics/HeatmapViewer'
import AdvancedSeo from '../../components/seo/AdvancedSeo'

function HeatmapsPage() {
  const navigate = useNavigate()
  const [selectedPage, setSelectedPage] = useState('home')

  const pages = [
    { id: 'home', label: 'Anasayfa', icon: '🏠' },
    { id: 'product', label: 'Ürün Detay', icon: '📦' },
    { id: 'cart', label: 'Sepet', icon: '🛒' },
    { id: 'checkout', label: 'Checkout', icon: '💳' }
  ]

  return (
    <>
      <AdvancedSeo
        title="Heatmaps - MyShop Admin"
        description="Kullanıcı tıklama ve dikkat heatmap analizi"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/admin/analytics')}
              className="p-3 hover:bg-gray-200 dark:hover:bg-dark-hover rounded-lg transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center">
                <Flame size={32} className="text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold dark:text-dark-text">
                  Heatmaps
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Kullanıcı Etkileşim Analizi
                </p>
              </div>
            </div>
          </div>

          {/* Page Selector */}
          <div className="flex gap-3 mb-8">
            {pages.map((page) => (
              <button
                key={page.id}
                onClick={() => setSelectedPage(page.id)}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
                  selectedPage === page.id
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white'
                    : 'bg-white dark:bg-dark-card border-2 border-gray-200 dark:border-dark-border hover:border-orange-500'
                }`}
              >
                <span className="text-2xl">{page.icon}</span>
                {page.label}
              </button>
            ))}
          </div>

          {/* Heatmap Viewer */}
          <HeatmapViewer page={selectedPage} />
        </div>
      </div>
    </>
  )
}

export default HeatmapsPage
