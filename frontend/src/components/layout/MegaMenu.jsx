import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
  Smartphone, Laptop, Watch, Camera,
  ShirtIcon, Briefcase, Gem,
  ShoppingBag, Dumbbell, Sparkles, Home,
  ChevronRight, TrendingUp, ChevronDown, Sparkle
} from 'lucide-react'

function MegaMenu() {
  const [activeCategory, setActiveCategory] = useState(null)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setActiveCategory(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleCategoryClick = (category) => {
    setActiveCategory(prev => prev === category.id ? null : category.id)
  }

  const handleItemClick = (categoryName, itemName) => {
    setActiveCategory(null)
    // Hem category hem de search query ile git ki backend tam eşleşme bulamazsa arama ile getirsin
    navigate(`/products?category=${encodeURIComponent(categoryName)}&search=${encodeURIComponent(itemName)}`)
  }

  const categories = [
    {
      id: 'elektronik',
      name: 'Elektronik',
      icon: Smartphone,
      color: 'from-blue-600 to-indigo-600',
      subcategories: [
        {
          title: 'Telefon & Tablet',
          items: ['iPhone', 'Samsung Galaxy', 'iPad', 'Android Tablet', 'Aksesuarlar']
        },
        {
          title: 'Bilgisayar',
          items: ['Laptop', 'Masaüstü', 'MacBook', 'Gaming PC', 'Monitör']
        },
        {
          title: 'Giyilebilir Teknoloji',
          items: ['Apple Watch', 'Samsung Watch', 'Akıllı Bileklik', 'Kulaklık']
        },
        {
          title: 'Fotoğraf & Video',
          items: ['DSLR Kamera', 'Mirrorless', 'Drone', 'GoPro', 'Lens']
        }
      ],
      featured: [
        { name: 'iPhone 15 Pro Max', price: '54.999 ₺', img: 'https://images.unsplash.com/photo-1592286927505-1def25e64eae?w=200' },
        { name: 'MacBook Pro 16"', price: '48.999 ₺', img: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=200' }
      ]
    },
    {
      id: 'giyim',
      name: 'Giyim',
      icon: ShirtIcon,
      color: 'from-purple-600 to-pink-600',
      subcategories: [
        {
          title: 'Kadın Giyim',
          items: ['Elbise', 'Bluz', 'Pantolon', 'Etek', 'Ceket']
        },
        {
          title: 'Erkek Giyim',
          items: ['Gömlek', 'Tişört', 'Pantolon', 'Ceket', 'Takım Elbise']
        },
        {
          title: 'Spor Giyim',
          items: ['Koşu', 'Yoga', 'Fitness', 'Basketbol', 'Eşofman']
        },
        {
          title: 'İç Giyim & Ev',
          items: ['Pijama', 'Gecelik', 'Tayt', 'Atlet', 'Çorap']
        }
      ],
      featured: [
        { name: 'Premium Blazer', price: '1.799 ₺', img: 'https://images.unsplash.com/photo-1552062407-20eeb29dd533?w=200' },
        { name: 'Comfort Jeans', price: '899 ₺', img: 'https://images.unsplash.com/photo-1542272604-787c62d465d1?w=200' }
      ]
    },
    {
      id: 'ayakkabi',
      name: 'Ayakkabı',
      icon: ShoppingBag,
      color: 'from-orange-600 to-red-600',
      subcategories: [
        {
          title: 'Spor Ayakkabı',
          items: ['Koşu', 'Basketbol', 'Antrenman', 'Yürüyüş', 'Sneaker']
        },
        {
          title: 'Günlük Ayakkabı',
          items: ['Casual', 'Loafer', 'Espadrille', 'Mokasen']
        },
        {
          title: 'Kadın Ayakkabı',
          items: ['Topuklu', 'Bot', 'Babet', 'Sandalet', 'Çizme']
        },
        {
          title: 'Erkek Ayakkabı',
          items: ['Klasik', 'Bot', 'Terlik', 'Sandalet']
        }
      ],
      featured: [
        { name: 'Nike Air Max 90', price: '4.999 ₺', img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200' },
        { name: 'Adidas Ultraboost', price: '5.999 ₺', img: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=200' }
      ]
    },
    {
      id: 'aksesuar',
      name: 'Aksesuar',
      icon: Gem,
      color: 'from-emerald-600 to-teal-600',
      subcategories: [
        {
          title: 'Çanta',
          items: ['El Çantası', 'Sırt Çantası', 'Laptop Çantası', 'Cüzdan']
        },
        {
          title: 'Saat',
          items: ['Kadın Saat', 'Erkek Saat', 'Akıllı Saat', 'Klasik Saat']
        },
        {
          title: 'Takı & Mücevher',
          items: ['Kolye', 'Küpe', 'Bileklik', 'Yüzük']
        },
        {
          title: 'Güneş Gözlüğü',
          items: ['Polarize', 'Klasik', 'Spor Gözlük', 'Optik Çerçeve']
        }
      ],
      featured: [
        { name: 'Designer Güneş Gözlüğü', price: '3.999 ₺', img: 'https://images.unsplash.com/photo-1527014176246-b3954984cf27?w=200' }
      ]
    },
    {
      id: 'ev',
      name: 'Ev & Yaşam',
      icon: Home,
      color: 'from-indigo-600 to-violet-600',
      subcategories: [
        {
          title: 'Ev Aletleri',
          items: ['Süpürge', 'Ütü', 'Blender', 'Mikser', 'Kahve Makinesi']
        },
        {
          title: 'Mutfak Gereçleri',
          items: ['Tencere Set', 'Tava', 'Bıçak Set', 'Sofra Takımı', 'Kupa']
        },
        {
          title: 'Ev Tekstili',
          items: ['Nevresim', 'Havlu', 'Perde', 'Halı', 'Yastık']
        },
        {
          title: 'Dekorasyon & Aydınlatma',
          items: ['Vazo', 'Tablo', 'Ayna', 'Saat', 'Aydınlatma']
        }
      ],
      featured: [
        { name: 'Dyson Dikey Süpürge', price: '24.999 ₺', img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=200' },
        { name: 'Otomatik Espresso Makinesi', price: '5.499 ₺', img: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=200' }
      ]
    },
    {
      id: 'spor',
      name: 'Spor & Outdoor',
      icon: Dumbbell,
      color: 'from-rose-600 to-red-600',
      subcategories: [
        {
          title: 'Fitness & Kondisyon',
          items: ['Dambıl', 'Yoga Matı', 'Pilates', 'Direnç Bandı', 'Ağırlık Seti']
        },
        {
          title: 'Outdoor & Kamp',
          items: ['Çadır', 'Uyku Tulumu', 'Kamp Sandalyesi', 'Termos', 'Trekking']
        },
        {
          title: 'Top Sporları',
          items: ['Futbol Topu', 'Basketbol Topu', 'Voleybol Topu', 'Tenis Raketi']
        },
        {
          title: 'Su Sporları & Bisiklet',
          items: ['Yüzücü Gözlüğü', 'Bone', 'Bisiklet Kaskı', 'Aksesuar']
        }
      ],
      featured: [
        { name: 'Pro Yoga Matı 6mm', price: '499 ₺', img: 'https://images.unsplash.com/photo-1592476885657-236aa2c3e009?w=200' }
      ]
    },
    {
      id: 'kozmetik',
      name: 'Kozmetik',
      icon: Sparkles,
      color: 'from-pink-600 to-rose-600',
      subcategories: [
        {
          title: 'Cilt Bakımı',
          items: ['Temizleyici', 'Tonik', 'Serum', 'Nemlendirici', 'Güneş Kremi']
        },
        {
          title: 'Makyaj',
          items: ['Fondöten', 'Ruj', 'Maskara', 'Far Paleti', 'Allık']
        },
        {
          title: 'Saç Bakımı',
          items: ['Şampuan', 'Saç Kremi', 'Saç Maskesi', 'Saç Serumu']
        },
        {
          title: 'Kişisel Bakım & Parfüm',
          items: ['Parfüm', 'Deodorant', 'Duş Jeli', 'Vücut Losyonu']
        }
      ],
      featured: [
        { name: 'Hyaluronik Asit Serum', price: '649 ₺', img: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=200' }
      ]
    }
  ]

  const currentCat = categories.find(c => c.id === activeCategory)

  return (
    <div className="relative w-full border-b border-gray-100 bg-white" ref={menuRef}>
      <div className="max-w-7xl mx-auto px-4">
        {/* Kategori Barı */}
        <div className="flex items-center justify-between overflow-x-auto py-2 no-scrollbar gap-1">
          {categories.map((category) => {
            const isActive = activeCategory === category.id
            return (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm ring-2 ring-blue-600/20'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                }`}
              >
                <category.icon size={16} className={isActive ? 'text-white' : 'text-gray-500'} />
                <span>{category.name}</span>
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 ${isActive ? 'rotate-180 text-white' : 'text-gray-400'}`}
                />
              </button>
            )
          })}
        </div>
      </div>

      {/* Açılan Modern Mega Dropdown */}
      <AnimatePresence>
        {currentCat && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 top-full w-full bg-white border-b border-gray-200 shadow-xl z-50 py-7"
          >
            <div className="max-w-7xl mx-auto px-6">
              {/* Üst Başlık & Tümünü Gör */}
              <div className="flex items-center justify-between pb-4 mb-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-r ${currentCat.color} flex items-center justify-center text-white shadow-sm`}>
                    <currentCat.icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base">
                      {currentCat.name}
                    </h3>
                    <p className="text-xs text-gray-400">Aradığın tüm ürünler tek bir yerde</p>
                  </div>
                </div>

                <Link
                  to={`/products?category=${encodeURIComponent(currentCat.name)}`}
                  onClick={() => setActiveCategory(null)}
                  className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-blue-600 hover:text-white hover:bg-blue-600 rounded-lg border border-blue-200 hover:border-transparent transition-all"
                >
                  {currentCat.name} Tüm Ürünleri Gör
                  <ChevronRight size={14} />
                </Link>
              </div>

              {/* Grid: 4 Kolon Alt Kategori + 1 Kolon Öne Çıkanlar */}
              <div className="grid grid-cols-12 gap-8">
                {/* Alt Kategoriler (9 Kolon) */}
                <div className="col-span-12 lg:col-span-9 grid grid-cols-2 sm:grid-cols-4 gap-6">
                  {currentCat.subcategories.map((sub, idx) => (
                    <div key={idx} className="space-y-3">
                      <h4 className="font-bold text-gray-900 text-sm pb-1 border-b border-gray-100 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                        {sub.title}
                      </h4>
                      <ul className="space-y-2">
                        {sub.items.map((item, i) => (
                          <li key={i}>
                            <button
                              onClick={() => handleItemClick(currentCat.name, item)}
                              className="text-xs text-gray-600 hover:text-blue-600 hover:font-medium transition-colors text-left w-full py-0.5 block hover:translate-x-1 duration-150"
                            >
                              {item}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>

                {/* Öne Çıkan Popüler Ürünler (3 Kolon) */}
                <div className="col-span-12 lg:col-span-3 bg-gray-50/80 rounded-2xl p-4 border border-gray-100 flex flex-col justify-between">
                  <div>
                    <span className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-3 flex items-center gap-1">
                      <TrendingUp size={13} className="text-orange-500" /> Popüler Seçimler
                    </span>
                    <div className="space-y-3">
                      {currentCat.featured?.map((feat, fIdx) => (
                        <div
                          key={fIdx}
                          onClick={() => handleItemClick(currentCat.name, feat.name)}
                          className="flex items-center gap-3 p-2 bg-white rounded-xl shadow-xs border border-gray-100 hover:border-blue-200 cursor-pointer transition group"
                        >
                          <img
                            src={feat.img}
                            alt={feat.name}
                            className="w-12 h-12 object-cover rounded-lg bg-gray-100 flex-shrink-0"
                            onError={(e) => {
                              e.target.onerror = null
                              e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100'
                            }}
                          />
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-800 group-hover:text-blue-600 truncate">
                              {feat.name}
                            </p>
                            <p className="text-xs font-bold text-blue-600 mt-0.5">
                              {feat.price}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-gray-200/60 text-center">
                    <button
                      onClick={() => {
                        setActiveCategory(null)
                        navigate(`/products?category=${encodeURIComponent(currentCat.name)}`)
                      }}
                      className="text-xs text-gray-500 hover:text-blue-600 font-medium"
                    >
                      Kategorideki 50+ Ürünü Keşfet →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default MegaMenu
