import { useState } from 'react'
import { motion } from 'framer-motion'
import { Filter, Plus, Trash2, Save, ArrowRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import AdvancedSeo from '../../components/seo/AdvancedSeo'

function CreateFunnel() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    steps: [
      {
        name: 'Homepage Visit',
        type: 'pageview',
        url: '/',
        order: 0
      },
      {
        name: 'Product View',
        type: 'pageview',
        urlPattern: '/products/.*',
        order: 1
      },
      {
        name: 'Add to Cart',
        type: 'event',
        eventName: 'add_to_cart',
        order: 2
      },
      {
        name: 'Checkout',
        type: 'pageview',
        url: '/checkout',
        order: 3
      },
      {
        name: 'Purchase',
        type: 'event',
        eventName: 'purchase',
        order: 4
      }
    ],
    timeWindow: {
      value: 24,
      unit: 'hours'
    },
    isActive: true
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    setLoading(true)
    try {
      await API.post('/funnels', formData)
      toast.success('Funnel oluşturuldu')
      navigate('/admin/funnels')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Oluşturma başarısız')
    } finally {
      setLoading(false)
    }
  }

  const addStep = () => {
    setFormData({
      ...formData,
      steps: [
        ...formData.steps,
        {
          name: `Step ${formData.steps.length + 1}`,
          type: 'pageview',
          url: '',
          order: formData.steps.length
        }
      ]
    })
  }

  const removeStep = (index) => {
    setFormData({
      ...formData,
      steps: formData.steps.filter((_, i) => i !== index)
    })
  }

  const updateStep = (index, field, value) => {
    const newSteps = [...formData.steps]
    newSteps[index] = {
      ...newSteps[index],
      [field]: value
    }
    setFormData({ ...formData, steps: newSteps })
  }

  return (
    <>
      <AdvancedSeo
        title="Create Funnel - MyShop Admin"
        description="Yeni dönüşüm hunisi oluştur"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-4xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Filter size={32} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold dark:text-dark-text">
                Yeni Funnel Oluştur
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Dönüşüm hunisi tanımla
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
                    Funnel Adı *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="E-commerce Purchase Funnel"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:border-blue-500 dark:bg-dark-hover dark:text-dark-text"
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
                    placeholder="Ana satın alma hunisi - homepage'den purchase'a kadar"
                    rows={3}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:border-blue-500 dark:bg-dark-hover dark:text-dark-text resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-dark-text">
                      Time Window
                    </label>
                    <input
                      type="number"
                      value={formData.timeWindow.value}
                      onChange={(e) => setFormData({
                        ...formData,
                        timeWindow: { ...formData.timeWindow, value: parseInt(e.target.value) }
                      })}
                      min="1"
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:border-blue-500 dark:bg-dark-hover dark:text-dark-text"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2 dark:text-dark-text">
                      Unit
                    </label>
                    <select
                      value={formData.timeWindow.unit}
                      onChange={(e) => setFormData({
                        ...formData,
                        timeWindow: { ...formData.timeWindow, unit: e.target.value }
                      })}
                      className="w-full px-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:border-blue-500 dark:bg-dark-hover dark:text-dark-text"
                    >
                      <option value="minutes">Minutes</option>
                      <option value="hours">Hours</option>
                      <option value="days">Days</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            {/* Funnel Steps */}
            <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold dark:text-dark-text">
                  Funnel Steps
                </h2>
                <button
                  type="button"
                  onClick={addStep}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
                >
                  <Plus size={18} />
                  Add Step
                </button>
              </div>

              <div className="space-y-4">
                {formData.steps.map((step, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative p-4 border-2 border-gray-200 dark:border-dark-border rounded-xl"
                  >
                    {/* Step Number */}
                    <div className="absolute -left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                      {index + 1}
                    </div>

                    {/* Delete Button */}
                    {formData.steps.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeStep(index)}
                        className="absolute -right-2 -top-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}

                    <div className="ml-6 space-y-3">
                      {/* Step Name */}
                      <div>
                        <label className="block text-xs font-semibold mb-1 dark:text-dark-text">
                          Step Name
                        </label>
                        <input
                          type="text"
                          value={step.name}
                          onChange={(e) => updateStep(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 dark:border-dark-border rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:bg-dark-card dark:text-dark-text"
                          required
                        />
                      </div>

                      {/* Step Type */}
                      <div>
                        <label className="block text-xs font-semibold mb-1 dark:text-dark-text">
                          Type
                        </label>
                        <select
                          value={step.type}
                          onChange={(e) => updateStep(index, 'type', e.target.value)}
                          className="w-full px-3 py-2 border-2 border-gray-200 dark:border-dark-border rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:bg-dark-card dark:text-dark-text"
                        >
                          <option value="pageview">Page View</option>
                          <option value="event">Event</option>
                        </select>
                      </div>

                      {/* Type-specific fields */}
                      {step.type === 'pageview' ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-semibold mb-1 dark:text-dark-text">
                              URL
                            </label>
                            <input
                              type="text"
                              value={step.url || ''}
                              onChange={(e) => updateStep(index, 'url', e.target.value)}
                              placeholder="/checkout"
                              className="w-full px-3 py-2 border-2 border-gray-200 dark:border-dark-border rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:bg-dark-card dark:text-dark-text"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold mb-1 dark:text-dark-text">
                              URL Pattern (regex)
                            </label>
                            <input
                              type="text"
                              value={step.urlPattern || ''}
                              onChange={(e) => updateStep(index, 'urlPattern', e.target.value)}
                              placeholder="/products/.*"
                              className="w-full px-3 py-2 border-2 border-gray-200 dark:border-dark-border rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:bg-dark-card dark:text-dark-text"
                            />
                          </div>
                        </div>
                      ) : (
                        <div>
                          <label className="block text-xs font-semibold mb-1 dark:text-dark-text">
                            Event Name
                          </label>
                          <input
                            type="text"
                            value={step.eventName || ''}
                            onChange={(e) => updateStep(index, 'eventName', e.target.value)}
                            placeholder="add_to_cart"
                            className="w-full px-3 py-2 border-2 border-gray-200 dark:border-dark-border rounded-lg text-sm focus:outline-none focus:border-blue-500 dark:bg-dark-card dark:text-dark-text"
                          />
                        </div>
                      )}
                    </div>

                    {/* Arrow to next step */}
                    {index < formData.steps.length - 1 && (
                      <div className="flex justify-center mt-4">
                        <ArrowRight size={24} className="text-gray-400" />
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => navigate('/admin/funnels')}
                className="flex-1 py-3 border-2 border-gray-300 dark:border-dark-border rounded-xl font-bold hover:bg-gray-100 dark:hover:bg-dark-hover transition dark:text-dark-text"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold hover:shadow-xl transition disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Oluşturuluyor...
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    Funnel Oluştur
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

export default CreateFunnel