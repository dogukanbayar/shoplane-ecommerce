import { useState, useRef } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useMetaDescription, metaDescriptions } from '../../utils/metaDescriptions'
import { Mail, Lock, Eye, EyeOff, User, ArrowLeft, ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import SocialLogin from '../../components/auth/SocialLogin'
import IntroVideoModal from '../../components/auth/IntroVideoModal'
import useAuthStore from '../../store/authStore'

function LoginPage() {
  // Set optimized meta description for SEO
  useMetaDescription(metaDescriptions.login.description, metaDescriptions.login.title)
  const navigate = useNavigate()
  const location = useLocation()
  const { login, register } = useAuthStore()

  // State: 'login' or 'register'
  const [authMode, setAuthMode] = useState('login')
  const isLogin = authMode === 'login' // Derived state for readability

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showVideo, setShowVideo] = useState(false)

  const videoRef = useRef(null)

  const from = location.state?.from?.pathname || '/'

  const handleVideoEnd = () => {
    setShowVideo(false)
    navigate(from, { replace: true })
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
    setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    // Basic Validation
    if (!formData.email || !formData.password) {
      setError('Lütfen gerekli alanları doldurun.')
      return
    }

    if (!isLogin) {
      if (!formData.name) {
        setError('Lütfen adınızı giriniz.')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Şifreler eşleşmiyor.')
        return
      }
    }

    setLoading(true)

    let result
    if (isLogin) {
      result = await login(formData.email, formData.password)
    } else {
      result = await register({ name: formData.name, email: formData.email, password: formData.password })
    }

    setLoading(false)

    if (result.success) {
      setShowVideo(true)
    } else {
      setError(result.error)
    }
  }

  const toggleMode = () => {
    setAuthMode(isLogin ? 'register' : 'login')
    setError('')
    setFormData({ name: '', email: '', password: '', confirmPassword: '' })
  }

  // Styles
  const inputContainerClass = "relative group"
  const iconClass = "absolute left-5 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors duration-300"
  const inputClass = "w-full pl-14 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder:text-white/30 focus:outline-none focus:bg-white/10 focus:border-white/20 transition-all duration-300 font-medium tracking-wide"

  return (
    <>
      <IntroVideoModal isOpen={showVideo} onClose={handleVideoEnd} />
      
      <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden" style={{
        backgroundImage: `url('/neon-bg.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        backgroundColor: '#0a0a0a'
      }}>
      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-black/20 z-0" />

      {/* Auth Card */}
      <div className="relative z-10 w-full max-w-[480px] p-4">
        <motion.div
          layout
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.3 }}
          className="bg-white/5 backdrop-blur-3xl border border-white/10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] rounded-[2.5rem] overflow-hidden"
        >
          {/* Header Area */}
          <div className="px-8 pt-10 pb-4 text-center">
            <Link to="/" className="inline-flex items-center gap-2 text-white/50 hover:text-white transition-colors mb-8 text-sm font-medium tracking-wider uppercase">
              <ArrowLeft size={14} />
              <span>Mağazaya Dön</span>
            </Link>

            <motion.div
              key={authMode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-4xl font-bold text-white mb-3 tracking-tight">
                {isLogin ? 'Hoş Geldiniz' : 'Bize Katılın'}
              </h2>
              <p className="text-white/50 text-base font-light">
                {isLogin ? 'Alışveriş dünyasına giriş yapın.' : 'Ayrıcalıklı bir deneyime adım atın.'}
              </p>
            </motion.div>
          </div>

          {/* Form Area */}
          <div className="p-8 pt-6">
            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                  animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
                  exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                  className="bg-red-500/10 border border-red-500/20 text-red-200 px-4 py-3.5 rounded-2xl text-sm flex items-center gap-3 backdrop-blur-md overflow-hidden"
                >
                  <span className="w-1.5 h-1.5 flex-shrink-0 rounded-full bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.8)]" />
                  <span className="font-medium">{error}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <AnimatePresence mode='wait'>
                {!isLogin && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={inputContainerClass}>
                      <div className={iconClass}>
                        <User size={20} />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Ad Soyad"
                        className={inputClass}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className={inputContainerClass}>
                <div className={iconClass}>
                  <Mail size={20} />
                </div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="E-posta Adresi"
                  className={inputClass}
                  required
                />
              </div>

              <div className={inputContainerClass}>
                <div className={iconClass}>
                  <Lock size={20} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Şifre"
                  className={inputClass}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-white/30 hover:text-white transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              {!isLogin && (
                <motion.div
                  key="confirm"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="overflow-hidden"
                >
                  <div className={inputContainerClass}>
                    <div className={iconClass}>
                      <Lock size={20} />
                    </div>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="Şifreyi Onayla"
                      className={inputClass}
                    />
                  </div>
                </motion.div>
              )}

              <div className="flex items-center justify-between pt-2 px-1 text-sm text-white/60">
                {isLogin ? (
                  <>
                    <label className="flex items-center gap-2 cursor-pointer hover:text-white transition-colors group">
                      <div className="relative flex items-center">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="peers sr-only"
                        />
                        <div className={`w-4 h-4 rounded border border-white/30 transition-all ${rememberMe ? 'bg-white border-white' : 'bg-transparent'}`}>
                          {rememberMe && <div className="absolute inset-0 flex items-center justify-center text-black text-[10px]">✓</div>}
                        </div>
                      </div>
                      <span>Beni Hatırla</span>
                    </label>
                    <Link to="/forgot-password" className="hover:text-white transition-colors font-medium">
                      Şifremi Unuttum
                    </Link>
                  </>
                ) : null}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-white text-black rounded-2xl font-bold text-lg shadow-[0_0_30px_-5px_rgba(255,255,255,0.3)] hover:shadow-[0_0_40px_-5px_rgba(255,255,255,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                    İşleniyor...
                  </span>
                ) : (isLogin ? 'Giriş Yap' : 'Kayıt Ol')}
              </motion.button>
            </form>

            <div className="mt-8 pt-8 border-t border-white/10">
              <SocialLogin />
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={toggleMode}
                className="text-sm text-white/60 hover:text-white transition-colors flex items-center justify-center gap-1.5 mx-auto group"
              >
                {isLogin ? 'Hesabınız yok mu?' : 'Zaten üye misiniz?'}
                <span className="text-white font-semibold group-hover:underline decoration-white/50 underline-offset-4">
                  {isLogin ? 'Hemen Kayıt Olun' : 'Giriş Yapın'}
                </span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

          </div>
        </motion.div>
      </div>
    </div>
    </>
  )
}

export default LoginPage
