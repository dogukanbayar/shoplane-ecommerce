import { useState } from 'react'
import { motion } from 'framer-motion'
import { FlaskConical, Plus, Trash2, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import AdvancedSeo from '../../components/seo/AdvancedSeo'

function CreateExperiment() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'ab',
    targetPage: 'home',
    primaryGoal: {
      type: 'click',
      element: ''
    },
    variants: [
      {
        name: 'Control',
        description: 'Original version',
        traffic: 50,
        isControl: true,
        changes: {}
      },
      {
        name: 'Variant A',
        description: 'Test version',
        traffic: 50,
        isControl: false,
        changes: {}
      }
    ],
    settings: {
      trafficAllocation: 100,
      confidenceLevel: 95,
      autoSelectWinner: false
    }
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Validation
    const totalTraffic = formData.variants.reduce((sum, v) => sum + v.traffic, 0)
    if (totalTraffic !== 100) {
      toast.error('Traffic toplamı %100 olmalı')
      return
    }

    setLoading(true)
    try {
      await API.post('/experiments', formData)
      toast.success('Experiment oluşturuldu')
      navigate('/admin/experiments')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Oluşturma başarısız')
    } finally {
      setLoading(false)
    }
  }

  const addVariant = () => {
    const newVariant = {
      name: `Variant ${String.fromCharCode(65 + formData.variants.length - 1)}`,
      description: '',
      traffic: 0,
      isControl: false,
      changes: {}
    }
    setFormData({
      ...formData,
      variants: [...formData.variants, newVariant]
    })
  }

  const removeVariant = (index) => {
    if (formData.variants[index].isControl) {
      toast.error('Control variant silinemez')
      return
    }
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index)
    })
  }

  const updateVariant = (index, field, value) => {
    const newVariants = [...formData.variants]
    newVariants[index] = {
      ...newVariants[index],
      [field]: value
    }
    setFormData({ ...formData, variants: newVariants })
  }

  return (
    <>
      <AdvancedSeo
        title="Create A/B Test - MyShop Admin"
        description="Yeni A/B test oluştur"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
              <FlaskConical size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold dark:text-dark-text">
                Yeni A/B Test Oluştur
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Conversion optimizasyonu için deney tasarla
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Info */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold mb-4 dark:text-dark-text">
                Temel Bilgiler
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-dark-text">
                    Experiment Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Homepage CTA Button Color Test"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:border-purple-500 dark:bg-dark-hover dark:text-dark-text"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-dark-text">
                    Açıklama
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Test açıklaması..."
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:border-purple-500 dark:bg-dark-hover dark:text-dark-text resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-dark-text">
                      Test Tipi
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:border-purple-500 dark:bg-dark-hover dark:text-dark-text"
                    >
                      <option value="ab">A/B Test</option>
                      <option value="multivariate">Multivariate</option>
                      <option value="split_url">Split URL</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-dark-text">
                      Hedef Sayfa
                    </label>
                    <select
                      value={formData.targetPage}
                      onChange={(e) => setFormData({ ...formData, targetPage: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:border-purple-500 dark:bg-dark-hover dark:text-dark-text"
                    >
                      <option value="all">Tüm Sayfalar</option>
                      <option value="home">Anasayfa</option>
                      <option value="product">Ürün Detay</option>
                      <option value="cart">Sepet</option>
                      <option value="checkout">Checkout</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Primary Goal */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold mb-4 dark:text-dark-text">
                Birincil Hedef
              </h2>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-dark-text">
                    Hedef Tipi
                  </label>
                  <select
                    value={formData.primaryGoal.type}
                    onChange={(e) => setFormData({
                      ...formData,
                      primaryGoal: { ...formData.primaryGoal, type: e.target.value }
                    })}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:border-purple-500 dark:bg-dark-hover dark:text-dark-text"
                  >
                    <option value="click">Click</option>
                    <option value="purchase">Purchase</option>
                    <option value="signup">Sign Up</option>
                    <option value="addToCart">Add to Cart</option>
                    <option value="custom">Custom Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-dark-text">
                    Element Selector (CSS)
                  </label>
                  <input
                    type="text"
                    value={formData.primaryGoal.element}
                    onChange={(e) => setFormData({
                      ...formData,
                      primaryGoal: { ...formData.primaryGoal, element: e.target.value }
                    })}
                    placeholder=".cta-button"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:border-purple-500 dark:bg-dark-hover dark:text-dark-text"
                  />
                </div>
              </div>
            </div>

            {/* Variants */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold dark:text-dark-text">
                  Varyantlar
                </h2>
                <button
                  type="button"
                  onClick={addVariant}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition"
                >
                  <Plus size={18} />
                  Varyant Ekle
                </button>
              </div>

              <div className="space-y-4">
                {formData.variants.map((variant, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-xl border-2 ${
                      variant.isControl
                        ? 'border-gray-400 bg-gray-50 dark:bg-gray-900'
                        : 'border-purple-400 bg-purple-50 dark:bg-purple-900/20'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold dark:text-dark-text">
                        {variant.isControl ? '🎯 ' : '🧪 '}
                        {variant.name}
                      </h3>
                      {!variant.isControl && (
                        <button
                          type="button"
                          onClick={() => removeVariant(index)}
                          className="p-1 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/20 rounded"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold mb-1 dark:text-dark-text">
                          İsim
                        </label>
                        <input
                          type="text"
                          value={variant.name}
                          onChange={(e) => updateVariant(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 dark:border-dark-border rounded-lg text-sm focus:outline-none focus:border-purple-500 dark:bg-dark-card dark:text-dark-text"
                          disabled={variant.isControl}
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 dark:text-dark-text">
                          Traffic (%)
                        </label>
                        <input
                          type="number"
                          value={variant.traffic}
                          onChange={(e) => updateVariant(index, 'traffic', parseInt(e.target.value))}
                          min="0"
                          max="100"
                          className="w-full px-3 py-2 border-2 border-gray-200 dark:border-dark-border rounded-lg text-sm focus:outline-none focus:border-purple-500 dark:bg-dark-card dark:text-dark-text"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold mb-1 dark:text-dark-text">
                          Açıklama
                        </label>
                        <input
                          type="text"
                          value={variant.description}
                          onChange={(e) => updateVariant(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 dark:border-dark-border rounded-lg text-sm focus:outline-none focus:border-purple-500 dark:bg-dark-card dark:text-dark-text"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-900 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  ℹ️ Traffic toplamı: {formData.variants.reduce((sum, v) => sum + v.traffic, 0)}% 
                  (100% olmalı)
                </p>
              </div>
            </div>

            {/* Settings */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
              <h2 className="text-xl font-bold mb-4 dark:text-dark-text">
                Ayarlar
              </h2>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-dark-text">
                    Traffic Allocation (%)
                  </label>
                  <input
                    type="number"
                    value={formData.settings.trafficAllocation}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, trafficAllocation: parseInt(e.target.value) }
                    })}
                    min="0"
                    max="100"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:border-purple-500 dark:bg-dark-hover dark:text-dark-text"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-dark-text">
                    Confidence Level (%)
                  </label>
                  <input
                    type="number"
                    value={formData.settings.confidenceLevel}
                    onChange={(e) => setFormData({
                      ...formData,
                      settings: { ...formData.settings, confidenceLevel: parseInt(e.target.value) }
                    })}
                    min="80"
                    max="99"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:border-purple-500 dark:bg-dark-hover dark:text-dark-text"
                  />
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.settings.autoSelectWinner}
                      onChange={(e) => setFormData({
                        ...formData,
                        settings: { ...formData.settings, autoSelectWinner: e.target.checked }
                      })}
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-semibold dark:text-dark-text">
                      Auto Select Winner
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/experiments')}
                className="flex-1 py-3 border-2 border-gray-300 dark:border-dark-border rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-dark-hover transition dark:text-dark-text"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Experiment Oluştur
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  )
}

export default CreateExperiment