import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { 
  Plus, MapPin, Edit3, Trash2, Check, ArrowLeft, ArrowRight, 
  Home, Briefcase, Phone, User, AlertCircle, Building 
} from 'lucide-react'
import useAuthStore from '../../store/authStore'
import { addressAPI } from '../../api/addressAPI'

function AddressesPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { user } = useAuthStore()

  const [addresses, setAddresses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingAddress, setEditingAddress] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [formData, setFormData] = useState({
    title: 'Ev',
    fullName: '',
    phone: '',
    city: '',
    district: '',
    neighborhood: '',
    address: '',
    zipCode: '',
    isDefault: false
  })

  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchAddresses()
  }, [])

  const fetchAddresses = async () => {
    try {
      setLoading(true)
      const data = await addressAPI.getAddresses()
      if (data?.success && data?.addresses) {
        setAddresses(data.addresses)
      } else if (Array.isArray(data)) {
        setAddresses(data)
      } else if (data?.addresses) {
        setAddresses(data.addresses)
      } else {
        setAddresses([])
      }
    } catch (err) {
      console.error('Adresler yüklenemedi:', err)
    } finally {
      setLoading(false)
    }
  }

  // Senior Form Validasyonu
  const validateField = (name, value) => {
    let errorMsg = ''
    switch (name) {
      case 'fullName':
        if (!value.trim()) errorMsg = 'Ad Soyad zorunludur'
        else if (value.trim().split(' ').length < 2) errorMsg = 'Lütfen ad ve soyadınızı eksiksiz girin'
        break
      case 'phone':
        if (!value) errorMsg = 'Telefon numarası zorunludur'
        else if (!/^05\d{9}$/.test(value)) errorMsg = 'Geçerli bir telefon girin (05XXXXXXXXX)'
        break
      case 'city':
        if (!value.trim()) errorMsg = 'Şehir zorunludur'
        break
      case 'district':
        if (!value.trim()) errorMsg = 'İlçe zorunludur'
        break
      case 'address':
        if (!value.trim()) errorMsg = 'Açık adres zorunludur'
        else if (value.trim().length < 15) errorMsg = 'Lütfen detaylı adres girin (Cadde, bina no, daire)'
        break
      case 'zipCode':
        if (value && !/^\d{5}$/.test(value)) errorMsg = 'Posta kodu 5 haneli olmalıdır'
        break
      default:
        break
    }
    return errorMsg
  }

  const handleChange = (e) => {
    let { name, value, type, checked } = e.target
    
    // Yalnızca numerik girdiler
    if (name === 'phone' || name === 'zipCode') {
      value = value.replace(/\D/g, '')
    }

    const val = type === 'checkbox' ? checked : value
    setFormData(prev => ({ ...prev, [name]: val }))

    // Anlık hata kontrolü
    if (type !== 'checkbox') {
      const fieldError = validateField(name, val)
      setErrors(prev => ({ ...prev, [name]: fieldError }))
    }
  }

  const handleOpenAdd = () => {
    setEditingAddress(null)
    setErrors({})
    setFormData({
      title: 'Ev',
      fullName: user?.name || '',
      phone: '',
      city: '',
      district: '',
      neighborhood: '',
      address: '',
      zipCode: '',
      isDefault: addresses.length === 0
    })
    setShowModal(true)
  }

  const handleOpenEdit = (addr) => {
    setEditingAddress(addr)
    setErrors({})
    setFormData({
      title: addr.title || 'Ev',
      fullName: addr.fullName || '',
      phone: addr.phone || '',
      city: addr.city || '',
      district: addr.district || '',
      neighborhood: addr.neighborhood || '',
      address: addr.address || addr.addressDetail || '',
      zipCode: addr.zipCode || addr.postalCode || '',
      isDefault: addr.isDefault || false
    })
    setShowModal(true)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Tüm alanları doğrula
    const validationErrors = {}
    Object.keys(formData).forEach(key => {
      const err = validateField(key, formData[key])
      if (err) validationErrors[key] = err
    })

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    try {
      setIsSubmitting(true)
      const payload = {
        ...formData,
        addressDetail: formData.address,
        postalCode: formData.zipCode || '34000',
        zipCode: formData.zipCode || '34000'
      }

      if (editingAddress) {
        await addressAPI.updateAddress(editingAddress._id, payload)
      } else {
        await addressAPI.createAddress(payload)
      }

      setShowModal(false)
      await fetchAddresses()
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Adres kaydedilemedi!')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Bu adresi silmek istediğinize emin misiniz?')) {
      try {
        await addressAPI.deleteAddress(id)
        fetchAddresses()
      } catch (err) {
        alert('Adres silinemedi!')
      }
    }
  }

  const handleSetDefault = async (id) => {
    try {
      await addressAPI.setDefaultAddress(id)
      fetchAddresses()
    } catch (err) {
      alert('Varsayılan adres güncellenemedi!')
    }
  }

  return (
    <div className="min-h-[85vh] bg-slate-50/60 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        
        {/* Üst Navigasyon & Aksiyon Barı */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600 transition flex items-center justify-center"
              title="Geri Dön"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">Adres Yönetimi</h1>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Teslimat ve fatura adreslerinizi yapılandırın</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/checkout')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition"
            >
              Ödemeye Git
              <ArrowRight size={16} />
            </button>
            <button
              onClick={handleOpenAdd}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition"
            >
              <Plus size={16} />
              Yeni Adres Ekle
            </button>
          </div>
        </div>

        {/* Adres Listesi Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
            {[1, 2].map(n => (
              <div key={n} className="h-44 bg-white rounded-2xl border border-slate-200"></div>
            ))}
          </div>
        ) : addresses.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <MapPin size={30} />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">Kayıtlı Adresiniz Yok</h3>
            <p className="text-xs text-slate-500 mb-6 max-w-sm mx-auto">
              Sipariş verebilmek ve kargonuzu hızlıca alabilmek için lütfen geçerli bir teslimat adresi tanımlayın.
            </p>
            <button
              onClick={handleOpenAdd}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold text-sm shadow-sm transition inline-flex items-center gap-2"
            >
              <Plus size={16} /> İlk Adresi Ekle
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {addresses.map((addr) => {
              const isHome = addr.title?.toLowerCase().includes('ev')
              return (
                <div
                  key={addr._id}
                  className={`bg-white rounded-2xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                    addr.isDefault 
                      ? 'border-blue-600 shadow-md ring-2 ring-blue-500/10' 
                      : 'border-slate-200/90 hover:border-slate-300 hover:shadow-xs'
                  }`}
                >
                  <div>
                    {/* Başlık & Etiketler */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${isHome ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {isHome ? <Home size={18} /> : <Briefcase size={18} />}
                        </div>
                        <span className="font-bold text-slate-900 text-sm">{addr.title}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {addr.isDefault && (
                          <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-blue-200/50">
                            Varsayılan
                          </span>
                        )}
                        <button
                          onClick={() => handleOpenEdit(addr)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition"
                          title="Düzenle"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          onClick={() => handleDelete(addr._id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          title="Sil"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    {/* Bilgiler */}
                    <div className="space-y-1.5 text-xs text-slate-600">
                      <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
                        <User size={14} className="text-slate-400" />
                        <span>{addr.fullName}</span>
                      </div>
                      <p className="line-clamp-2 text-slate-700 leading-relaxed pt-1">
                        {addr.address || addr.addressDetail}
                      </p>
                      <p className="text-slate-500 font-medium">
                        {addr.neighborhood ? `${addr.neighborhood} Mah. ` : ''}{addr.district} / {addr.city} {addr.zipCode && `(${addr.zipCode})`}
                      </p>
                      <div className="flex items-center gap-1.5 text-slate-500 pt-1 font-mono">
                        <Phone size={13} className="text-slate-400" />
                        <span>{addr.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Alt İşlem */}
                  <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                    {!addr.isDefault ? (
                      <button
                        onClick={() => handleSetDefault(addr._id)}
                        className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition"
                      >
                        <Check size={14} /> Varsayılan Olarak Ayarla
                      </button>
                    ) : (
                      <span className="text-[11px] font-medium text-emerald-600 flex items-center gap-1">
                        <Check size={13} /> Öncelikli Teslimat Adresi
                      </span>
                    )}

                    <button
                      onClick={() => navigate('/checkout')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 ml-auto"
                    >
                      Kullan →
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Modal: Ekle / Düzenle */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {editingAddress ? 'Adresi Düzenle' : 'Yeni Teslimat Adresi'}
                  </h2>
                  <p className="text-xs text-slate-500">Lütfen tüm bilgileri eksiksiz ve hatasız doldurun</p>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center font-bold text-sm"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                {/* Adres Başlığı Seçimi (Ev / İş / Diğer) */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Adres Başlığı</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['Ev', 'İş', 'Diğer'].map(type => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setFormData(p => ({ ...p, title: type }))}
                        className={`py-2 text-xs font-semibold rounded-xl border transition ${
                          formData.title === type
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ad Soyad & Telefon */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Ad Soyad *</label>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Örn: Ahmet Yılmaz"
                      value={formData.fullName}
                      onChange={handleChange}
                      className={`w-full px-3.5 py-2.5 bg-slate-50/50 border rounded-xl text-xs sm:text-sm outline-none transition ${
                        errors.fullName ? 'border-red-500 bg-red-50/30 ring-1 ring-red-500' : 'border-slate-200 focus:border-blue-600 focus:bg-white'
                      }`}
                    />
                    {errors.fullName && (
                      <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle size={12} /> {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Telefon Numarası *</label>
                    <input
                      type="tel"
                      name="phone"
                      maxLength={11}
                      placeholder="05321234567"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full px-3.5 py-2.5 bg-slate-50/50 border rounded-xl text-xs sm:text-sm font-mono outline-none transition ${
                        errors.phone ? 'border-red-500 bg-red-50/30 ring-1 ring-red-500' : 'border-slate-200 focus:border-blue-600 focus:bg-white'
                      }`}
                    />
                    {errors.phone && (
                      <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle size={12} /> {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* İl & İlçe */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">İl (Şehir) *</label>
                    <input
                      type="text"
                      name="city"
                      placeholder="İstanbul"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-3.5 py-2.5 bg-slate-50/50 border rounded-xl text-xs sm:text-sm outline-none transition ${
                        errors.city ? 'border-red-500 bg-red-50/30 ring-1 ring-red-500' : 'border-slate-200 focus:border-blue-600 focus:bg-white'
                      }`}
                    />
                    {errors.city && (
                      <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle size={12} /> {errors.city}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">İlçe *</label>
                    <input
                      type="text"
                      name="district"
                      placeholder="Kadıköy"
                      value={formData.district}
                      onChange={handleChange}
                      className={`w-full px-3.5 py-2.5 bg-slate-50/50 border rounded-xl text-xs sm:text-sm outline-none transition ${
                        errors.district ? 'border-red-500 bg-red-50/30 ring-1 ring-red-500' : 'border-slate-200 focus:border-blue-600 focus:bg-white'
                      }`}
                    />
                    {errors.district && (
                      <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle size={12} /> {errors.district}
                      </p>
                    )}
                  </div>
                </div>

                {/* Mahalle & Posta Kodu */}
                <div className="grid grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Mahalle</label>
                    <input
                      type="text"
                      name="neighborhood"
                      placeholder="Moda Mah."
                      value={formData.neighborhood}
                      onChange={handleChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm outline-none focus:border-blue-600 focus:bg-white transition"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Posta Kodu</label>
                    <input
                      type="text"
                      name="zipCode"
                      maxLength={5}
                      placeholder="34710"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className={`w-full px-3.5 py-2.5 bg-slate-50/50 border rounded-xl text-xs sm:text-sm font-mono outline-none transition ${
                        errors.zipCode ? 'border-red-500 bg-red-50/30 ring-1 ring-red-500' : 'border-slate-200 focus:border-blue-600 focus:bg-white'
                      }`}
                    />
                    {errors.zipCode && (
                      <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                        <AlertCircle size={12} /> {errors.zipCode}
                      </p>
                    )}
                  </div>
                </div>

                {/* Açık Adres */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Açık Adres (Cadde, Bina No, Daire) *</label>
                  <textarea
                    name="address"
                    rows={3}
                    placeholder="Örn: Caferağa Mah. Şair Nefi Sok. No: 12 Daire: 4"
                    value={formData.address}
                    onChange={handleChange}
                    className={`w-full px-3.5 py-2.5 bg-slate-50/50 border rounded-xl text-xs sm:text-sm outline-none transition ${
                      errors.address ? 'border-red-500 bg-red-50/30 ring-1 ring-red-500' : 'border-slate-200 focus:border-blue-600 focus:bg-white'
                    }`}
                  />
                  {errors.address && (
                    <p className="text-[11px] text-red-500 mt-1 flex items-center gap-1 font-medium">
                      <AlertCircle size={12} /> {errors.address}
                    </p>
                  )}
                </div>

                {/* Varsayılan Checkbox */}
                <div className="flex items-center gap-2.5 pt-1">
                  <input
                    type="checkbox"
                    id="isDefault"
                    name="isDefault"
                    checked={formData.isDefault}
                    onChange={handleChange}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <label htmlFor="isDefault" className="text-xs font-semibold text-slate-700 cursor-pointer">
                    Varsayılan teslimat adresim olarak kullan
                  </label>
                </div>

                {/* Aksiyon Butonları */}
                <div className="flex justify-end gap-3 pt-5 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-5 py-2.5 border border-slate-200 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-sm transition"
                  >
                    {isSubmitting ? 'Kaydediliyor...' : 'Adresi Kaydet'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default AddressesPage
