import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Users, Instagram, Youtube, MessageSquare, Globe,
  TrendingUp, DollarSign, Award, CheckCircle, AlertCircle
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import API from '../../api/axiosConfig'
import useAuthStore from '../../store/authStore'
import toast from 'react-hot-toast'
import AdvancedSeo from '../../components/seo/AdvancedSeo'

function InfluencerApply() {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    socialMedia: {
      instagram: '',
      youtube: '',
      tiktok: '',
      twitter: '',
      website: ''
    },
    followers: '',
    platform: 'instagram',
    reason: ''
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name.startsWith('socialMedia.')) {
      const field = name.split('.')[1]
      setFormData({
        ...formData,
        socialMedia: {
          ...formData.socialMedia,
          [field]: value
        }
      })
    } else {
      setFormData({ ...formData, [name]: value })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!isAuthenticated) {
      toast.error('Başvuru için giriş yapmalısınız')
      navigate('/login')
      return
    }

    setLoading(true)
    try {
      await API.post('/influencers/apply', formData)
      toast.success('Başvurunuz alındı! 3-5 iş günü içinde değerlendirilecektir.')
      navigate('/influencer/dashboard')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Başvuru gönderilemedi')
    } finally {
      setLoading(false)
    }
  }

  const benefits = [
    {
      icon: DollarSign,
      title: 'Yüksek Komisyon',
      description: '%10 - %25 arası kazanç fırsatı'
    },
    {
      icon: TrendingUp,
      title: 'Kademeli Artış',
      description: 'Satışlarınız arttıkça komisyon oranınız da artar'
    },
    {
      icon: Award,
      title: 'Özel Avantajlar',
      description: 'Erken ürün erişimi, özel kampanyalar'
    },
    {
      icon: Users,
      title: 'Özel Destek',
      description: 'Özel influencer destek ekibi'
    }
  ]

  const tiers = [
    {
      name: 'Bronze',
      badge: '🥉',
      commission: 10,
      requirement: '0 - 10.000₺',
      color: 'from-orange-600 to-amber-600'
    },
    {
      name: 'Silver',
      badge: '🥈',
      commission: 15,
      requirement: '10.000₺ - 25.000₺',
      color: 'from-gray-400 to-gray-600'
    },
    {
      name: 'Gold',
      badge: '🥇',
      commission: 20,
      requirement: '25.000₺ - 50.000₺',
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      name: 'Platinum',
      badge: '💎',
      commission: 25,
      requirement: '50.000₺+',
      color: 'from-cyan-400 to-blue-600'
    }
  ]

  return (
    <>
      <AdvancedSeo
        title="Influencer Ol - MyShop"
        description="MyShop influencer programına katıl, ürünleri tanıt ve kazanmaya başla. %10-25 arası komisyon oranları."
        keywords="influencer, referral program, kazanç, komisyon, iş birliği"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-6xl mx-auto px-4">
          {/* Hero Section */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-24 h-24 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6"
            >
              <Users size={48} className="text-white" />
            </motion.div>
            <h1 className="text-5xl font-bold mb-4 dark:text-dark-text">
              Influencer Programı
            </h1>
            <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Takipçilerinle ürünleri paylaş, her satıştan kazanç elde et. 
              Başlamak için hemen başvur!
            </p>
          </div>

          {/* Benefits */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white dark:bg-dark-card rounded-2xl p-6 shadow-xl text-center"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <Icon size={32} className="text-white" />
                  </div>
                  <h3 className="font-bold mb-2 dark:text-dark-text">{benefit.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {benefit.description}
                  </p>
                </motion.div>
              )
            })}
          </div>

          {/* Tier System */}
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-8 mb-12">
            <h2 className="text-3xl font-bold text-center mb-8 dark:text-dark-text">
              Kademeli Komisyon Sistemi
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {tiers.map((tier, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="relative"
                >
                  {index === 3 && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold rounded-full">
                      EN YÜKSEK
                    </div>
                  )}
                  <div className={`bg-gradient-to-r ${tier.color} rounded-xl p-6 text-white text-center h-full`}>
                    <div className="text-5xl mb-3">{tier.badge}</div>
                    <h3 className="text-2xl font-bold mb-2">{tier.name}</h3>
                    <div className="text-4xl font-bold mb-3">%{tier.commission}</div>
                    <p className="text-sm opacity-90">Komisyon</p>
                    <div className="mt-4 pt-4 border-t border-white/30">
                      <p className="text-xs opacity-75">{tier.requirement}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Application Form */}
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-6 dark:text-dark-text">
              Başvuru Formu
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Display Name */}
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-dark-text">
                  Görünen İsim *
                </label>
                <input
                  type="text"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleChange}
                  placeholder="Takipçilerinizin göreceği isim"
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:border-blue-500 dark:bg-dark-hover dark:text-dark-text"
                  required
                />
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-dark-text">
                  Biyografi
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Kendinizi kısaca tanıtın..."
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:border-blue-500 dark:bg-dark-hover dark:text-dark-text resize-none"
                />
              </div>

              {/* Social Media */}
              <div>
                <label className="block text-sm font-semibold mb-3 dark:text-dark-text">
                  Sosyal Medya Hesapları
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Instagram size={20} className="text-pink-600" />
                      <span className="text-sm font-semibold dark:text-dark-text">Instagram</span>
                    </div>
                    <input
                      type="text"
                      name="socialMedia.instagram"
                      value={formData.socialMedia.instagram}
                      onChange={handleChange}
                      placeholder="@kullaniciadi"
                      className="w-full px-4 py-2 border-2 border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:border-pink-500 dark:bg-dark-hover dark:text-dark-text"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Youtube size={20} className="text-red-600" />
                      <span className="text-sm font-semibold dark:text-dark-text">YouTube</span>
                    </div>
                    <input
                      type="text"
                      name="socialMedia.youtube"
                      value={formData.socialMedia.youtube}
                      onChange={handleChange}
                      placeholder="Kanal linki"
                      className="w-full px-4 py-2 border-2 border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:border-red-500 dark:bg-dark-hover dark:text-dark-text"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={20} className="text-black dark:text-white" />
                      <span className="text-sm font-semibold dark:text-dark-text">TikTok</span>
                    </div>
                    <input
                      type="text"
                      name="socialMedia.tiktok"
                      value={formData.socialMedia.tiktok}
                      onChange={handleChange}
                      placeholder="@kullaniciadi"
                      className="w-full px-4 py-2 border-2 border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:border-gray-500 dark:bg-dark-hover dark:text-dark-text"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Globe size={20} className="text-blue-600" />
                      <span className="text-sm font-semibold dark:text-dark-text">Website</span>
                    </div>
                    <input
                      type="url"
                      name="socialMedia.website"
                      value={formData.socialMedia.website}
                      onChange={handleChange}
                      placeholder="https://..."
                      className="w-full px-4 py-2 border-2 border-gray-200 dark:border-dark-border rounded-lg focus:outline-none focus:border-blue-500 dark:bg-dark-hover dark:text-dark-text"
                    />
                  </div>
                </div>
              </div>

              {/* Followers & Platform */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-dark-text">
                    Takipçi Sayısı *
                  </label>
                  <input
                    type="number"
                    name="followers"
                    value={formData.followers}
                    onChange={handleChange}
                    placeholder="Örn: 10000"
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:border-blue-500 dark:bg-dark-hover dark:text-dark-text"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2 dark:text-dark-text">
                    Ana Platform *
                  </label>
                  <select
                    name="platform"
                    value={formData.platform}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:border-blue-500 dark:bg-dark-hover dark:text-dark-text"
                    required
                  >
                    <option value="instagram">Instagram</option>
                    <option value="youtube">YouTube</option>
                    <option value="tiktok">TikTok</option>
                    <option value="twitter">Twitter</option>
                    <option value="blog">Blog/Website</option>
                  </select>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-semibold mb-2 dark:text-dark-text">
                  Neden Influencer Olmak İstiyorsunuz? *
                </label>
                <textarea
                  name="reason"
                  value={formData.reason}
                  onChange={handleChange}
                  placeholder="İş birliği yapmak isteme nedenlerinizi paylaşın..."
                  rows={5}
                  className="w-full px-4 py-3 border-2 border-gray-200 dark:border-dark-border rounded-xl focus:outline-none focus:border-blue-500 dark:bg-dark-hover dark:text-dark-text resize-none"
                  required
                />
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-900 rounded-xl">
                <div className="flex items-start gap-3">
                  <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-semibold mb-1">Başvuru Süreci:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Başvurunuz 3-5 iş günü içinde değerlendirilecektir</li>
                      <li>Onaylanan başvurular email ile bilgilendirilir</li>
                      <li>Minimum 1000 takipçi gereklidir</li>
                      <li>Aktif ve etkileşim oranı yüksek hesaplar tercih edilir</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Gönderiliyor...' : 'Başvuruyu Gönder'}
              </button>
            </form>
          </div>

          {/* FAQ */}
          <div className="mt-12 bg-white dark:bg-dark-card rounded-2xl shadow-xl p-8">
            <h2 className="text-3xl font-bold mb-6 dark:text-dark-text">
              Sıkça Sorulan Sorular
            </h2>
            <div className="space-y-4">
              {[
                {
                  q: 'Minimum takipçi sayısı var mı?',
                  a: 'Evet, en az 1000 takipçiye sahip olmanız gerekmektedir.'
                },
                {
                  q: 'Komisyon ödemeleri nasıl yapılır?',
                  a: 'Minimum 100₺ kazanca ulaştığınızda ödeme talep edebilirsiniz. Ödemeler 3-5 iş günü içinde banka hesabınıza yapılır.'
                },
                {
                  q: 'Hangi ürünleri tanıtabilirim?',
                  a: 'Tüm ürünlerimizi tanıtabilirsiniz. Özel kampanyalı ürünlerde daha yüksek komisyon kazanabilirsiniz.'
                },
                {
                  q: 'Referral linkim nasıl çalışır?',
                  a: 'Size özel bir referral kodu verilir. Bu kod ile yapılan alışverişlerden otomatik komisyon kazanırsınız.'
                }
              ].map((faq, index) => (
                <div key={index} className="p-4 bg-gray-50 dark:bg-dark-hover rounded-xl">
                  <p className="font-bold mb-2 dark:text-dark-text">{faq.q}</p>
                  <p className="text-gray-600 dark:text-gray-400">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default InfluencerApply