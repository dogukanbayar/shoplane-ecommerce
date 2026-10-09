import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { 
  User, Mail, Phone, Lock, Eye, EyeOff, 
  CheckCircle2, ArrowRight, ShieldCheck, Truck, Sparkles, AlertCircle, ShoppingBag 
} from 'lucide-react'
import useAuthStore from '../../store/authStore'

function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuthStore()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    termsAccepted: true
  })

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')

  // Şifre gücü hesaplama (UX)
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: '', color: 'bg-slate-200' }
    let score = 0
    if (pwd.length >= 6) score += 1
    if (pwd.length >= 8) score += 1
    if (/[A-Z]/.test(pwd) || /[a-z]/.test(pwd)) score += 1
    if (/[0-9]/.test(pwd) || /[^A-Za-z0-9]/.test(pwd)) score += 1

    if (score <= 1) return { score: 1, label: 'Zayıf', color: 'bg-rose-500' }
    if (score === 2 || score === 3) return { score: 2, label: 'Orta', color: 'bg-amber-500' }
    return { score: 3, label: 'Güçlü', color: 'bg-emerald-500' }
  }

  const strength = getPasswordStrength(formData.password)

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
    setGeneralError('')
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim() || formData.name.trim().length < 2) {
      newErrors.name = 'Lütfen adınızı ve soyadınızı eksiksiz girin.'
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!formData.email.trim() || !emailRegex.test(formData.email)) {
      newErrors.email = 'Geçerli bir e-posta adresi girin.'
    }

    if (!formData.password || formData.password.length < 6) {
      newErrors.password = 'Şifre en az 6 karakter olmalıdır.'
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Şifreler birbiriyle eşleşmiyor.'
    }

    if (!formData.termsAccepted) {
      newErrors.termsAccepted = 'Kullanım koşullarını onaylamalısınız.'
    }

    return newErrors
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')

    const validationErrors = validateForm()
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    try {
      // Backend'e confirmPassword ve termsAccepted göndermiyoruz
      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        phone: formData.phone.trim() || undefined
      }

      const res = await register(payload)
      setLoading(false)

      if (res?.success) {
        navigate('/', { replace: true })
      } else {
        setGeneralError(res?.error || res?.message || 'Kayıt işlemi tamamlanamadı. Bilgilerinizi kontrol edin.')
      }
    } catch (err) {
      setLoading(false)
      const msg = err.response?.data?.message || err.message || 'Kayıt olurken beklenmeyen bir hata oluştu.'
      setGeneralError(msg)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:5001/api/auth/google'
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl w-full bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* Sol Kolon: Brand & Value Props (Masaüstü) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-br from-blue-600 via-indigo-600 to-slate-900 p-10 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-400/20 via-transparent to-transparent pointer-events-none"></div>

          <div>
            <Link to="/" className="inline-flex items-center gap-2.5 text-white font-extrabold text-2xl tracking-tight">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
                <ShoppingBag className="text-white" size={20} />
              </div>
              ShopLane
            </Link>
            <p className="mt-2 text-blue-100/80 text-sm">Geleceğin alışveriş deneyimine hoş geldiniz.</p>
          </div>

          <div className="space-y-6 my-auto">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10">
                <Sparkles size={18} className="text-amber-300" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Kişiselleştirilmiş İndirimler</h4>
                <p className="text-xs text-blue-100/70 mt-0.5">Üyelere özel kuponlar ve anlık fırsatlardan yararlanın.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10">
                <Truck size={18} className="text-sky-300" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Hızlı & Güvenli Teslimat</h4>
                <p className="text-xs text-blue-100/70 mt-0.5">Siparişlerinizi canlı harita ve bildirimlerle takip edin.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/10">
                <ShieldCheck size={18} className="text-emerald-300" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">%100 Alıcı Koruması</h4>
                <p className="text-xs text-blue-100/70 mt-0.5">Kolay iade ve 256-bit SSL korumalı ödeme altyapısı.</p>
              </div>
            </div>
          </div>

          <div className="text-xs text-blue-200/60 pt-4 border-t border-white/10">
            © 2026 ShopLane E-Ticaret A.Ş. Tüm hakları saklıdır.
          </div>
        </div>

        {/* Sağ Kolon: Kayıt Formu */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-center">
          <div className="max-w-md w-full mx-auto">
            <div className="mb-6">
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">Yeni Hesap Oluştur</h2>
              <p className="text-sm text-slate-500 mt-1">
                Zaten hesabınız var mı?{' '}
                <Link to="/login" className="text-blue-600 hover:text-blue-700 font-bold transition">
                  Giriş Yap
                </Link>
              </p>
            </div>

            {/* Google ile Tek Tıkla Kayıt */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-slate-200 rounded-xl hover:bg-slate-50 transition text-sm font-semibold text-slate-700 shadow-xs mb-5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Google ile Devam Et
            </button>

            <div className="relative flex items-center justify-center mb-5">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-3 text-xs text-slate-400 font-medium uppercase tracking-wider">veya e-posta ile</span>
            </div>

            {/* Genel Hata Kutusu */}
            {generalError && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{generalError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Ad Soyad */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Ad Soyad
                </label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Adınız Soyadınız"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition ${
                      errors.name ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-600'
                    }`}
                  />
                </div>
                {errors.name && <p className="text-rose-500 text-xs mt-1">{errors.name}</p>}
              </div>

              {/* E-posta */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  E-Posta Adresi
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="ornek@alanadi.com"
                    className={`w-full pl-10 pr-4 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition ${
                      errors.email ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-600'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-rose-500 text-xs mt-1">{errors.email}</p>}
              </div>

              {/* Telefon (Opsiyonel) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                  <span>Telefon</span>
                  <span className="text-[10px] text-slate-400 font-normal lowercase">(isteğe bağlı)</span>
                </label>
                <div className="relative">
                  <Phone size={18} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="05XX XXX XX XX"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-blue-600 transition"
                  />
                </div>
              </div>

              {/* Şifre & Şifre Gücü */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Şifre
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="En az 6 karakter"
                    className={`w-full pl-10 pr-11 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition ${
                      errors.password ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {formData.password && (
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-1.5 flex-1 bg-slate-100 rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full flex-1 transition-all duration-300 ${strength.score >= 1 ? strength.color : 'bg-slate-200'}`}></div>
                      <div className={`h-full flex-1 transition-all duration-300 ${strength.score >= 2 ? strength.color : 'bg-slate-200'}`}></div>
                      <div className={`h-full flex-1 transition-all duration-300 ${strength.score >= 3 ? strength.color : 'bg-slate-200'}`}></div>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">{strength.label}</span>
                  </div>
                )}
                {errors.password && <p className="text-rose-500 text-xs mt-1">{errors.password}</p>}
              </div>

              {/* Şifre Tekrar */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Şifre Tekrar
                </label>
                <div className="relative">
                  <Lock size={18} className="absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Şifrenizi doğrulayın"
                    className={`w-full pl-10 pr-11 py-2.5 bg-slate-50 border rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white transition ${
                      errors.confirmPassword ? 'border-rose-400 focus:border-rose-500' : 'border-slate-200 focus:border-blue-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-rose-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>

              {/* Koşullar Checkbox */}
              <div>
                <label className="flex items-start gap-2.5 cursor-pointer mt-1">
                  <input
                    type="checkbox"
                    name="termsAccepted"
                    checked={formData.termsAccepted}
                    onChange={handleChange}
                    className="mt-0.5 w-4 h-4 text-blue-600 rounded border-slate-300 focus:ring-blue-500"
                  />
                  <span className="text-xs text-slate-600 leading-snug">
                    <span className="text-blue-600 font-semibold hover:underline">Kullanıcı Sözleşmesi</span> ve{' '}
                    <span className="text-blue-600 font-semibold hover:underline">Gizlilik Politikası</span>'nı okudum ve kabul ediyorum.
                  </span>
                </label>
                {errors.termsAccepted && <p className="text-rose-500 text-xs mt-1">{errors.termsAccepted}</p>}
              </div>

              {/* Kayıt Butonu */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm shadow-md shadow-blue-500/20 hover:shadow-lg hover:shadow-blue-500/30 active:scale-[0.99] transition flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span>Hesap Oluştur</span>
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>
          </div>
        </div>

      </div>
    </div>
  )
}

export default RegisterPage
