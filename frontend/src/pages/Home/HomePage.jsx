import { useEffect, useState } from 'react'
import { useABTest } from '../../hooks/useABTest'
import { useMetaDescription, metaDescriptions } from '../../utils/metaDescriptions'
import { motion } from 'framer-motion'
import { ArrowRight, Zap, TrendingUp, Shield, Truck, CreditCard, Sparkles, Flame, Clock, Eye, ShoppingBag, Users, Heart, Star, Gift, Package, Award } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useInView } from 'react-intersection-observer'
import SEO from '../../components/seo/SEO'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import BottomNav from '../../components/layout/BottomNav'
import BrowseCategories from '../../components/seo/BrowseCategories'
import HeroSectionV2 from '../../components/Home/HeroSectionV2'
import ProductCardV2 from '../../components/common/ProductCardV2'
import BundleCard from '../../components/bundles/BundleCard'
import { productAPI } from '../../api/productAPI'
import API from '../../api/axiosConfig'
import RecentlyViewed from '../../components/Home/RecentlyViewed' // YENİ

function HomePage() {
  const { experiments, getVariant, getChanges, trackConversion } = useABTest('home')

  // Set optimized meta description for SEO
  useMetaDescription(metaDescriptions.home.description, metaDescriptions.home.title)

  // CTA Button experiment
  const ctaVariant = getVariant('Homepage CTA Button')
  const ctaChanges = getChanges('Homepage CTA Button')

  // Default values
  const ctaConfig = {
    text: ctaChanges.buttonText || 'Alışverişe Başla',
    color: ctaChanges.buttonColor || 'from-blue-600 to-purple-600',
    size: ctaChanges.buttonSize || 'large'
  }

  const handleCTAClick = () => {
    // Track conversion
    const experiment = experiments.find(e => e.experimentName === 'Homepage CTA Button')
    if (experiment) {
      trackConversion(experiment.experimentId)
    }

    // Navigate to products
    window.location.href = '/products'
  }
  const [featuredProducts, setFeaturedProducts] = useState([])
  const [newProducts, setNewProducts] = useState([])
  const [flashSaleProducts, setFlashSaleProducts] = useState([])
  const [bestSellerProducts, setBestSellerProducts] = useState([])
  const [bundles, setBundles] = useState([])
  const [loading, setLoading] = useState(true)
  const [flashSaleTimeLeft, setFlashSaleTimeLeft] = useState({
    hours: 23,
    minutes: 45,
    seconds: 30
  })

  // Intersection Observer hooks
  const [featuredRef, featuredInView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [categoriesRef, categoriesInView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [flashSaleRef, flashSaleInView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [bestSellerRef, bestSellerInView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [newProductsRef, newProductsInView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const [featuresRef, featuresInView] = useInView({ triggerOnce: true, threshold: 0.1 })

  // Flash Sale Countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashSaleTimeLeft(prev => {
        let { hours, minutes, seconds } = prev

        if (seconds > 0) {
          seconds--
        } else {
          seconds = 59
          if (minutes > 0) {
            minutes--
          } else {
            minutes = 59
            if (hours > 0) {
              hours--
            } else {
              hours = 23
            }
          }
        }

        return { hours, minutes, seconds }
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const [featured, newest, flashSale, bestSeller, bundlesData] = await Promise.all([
          productAPI.getProducts({ limit: 8, sort: 'popular' }),
          productAPI.getProducts({ limit: 8, sort: 'newest' }),
          productAPI.getProducts({ limit: 6, sort: 'price-asc' }), // Flash sale (ucuz olanlar)
          productAPI.getProducts({ limit: 8, sort: 'rating' }), // Best sellers
          API.get('/bundles?active=true')
        ])
        setFeaturedProducts(featured.products)
        setNewProducts(newest.products)
        setFlashSaleProducts(flashSale.products)
        setBestSellerProducts(bestSeller.products)
        setBundles(bundlesData.data.bundles)
      } catch (error) {
        console.error('Error:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchProducts()
  }, [])

  const categories = [
    { name: 'Elektronik', image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=500', count: '500+', color: 'from-blue-500 to-cyan-500' },
    { name: 'Giyim', image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=500', count: '1000+', color: 'from-purple-500 to-pink-500' },
    { name: 'Ayakkabı', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500', count: '300+', color: 'from-orange-500 to-red-500' },
    { name: 'Aksesuar', image: 'https://images.unsplash.com/photo-1611652022419-a9419f74343d?w=500', count: '200+', color: 'from-green-500 to-emerald-500' },
    { name: 'Ev & Yaşam', image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500', count: '400+', color: 'from-indigo-500 to-purple-500' },
    { name: 'Spor', image: 'https://images.unsplash.com/photo-1517344884509-a0c97ec11bcc?w=500', count: '250+', color: 'from-red-500 to-pink-500' },
    { name: 'Kozmetik', image: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=500', count: '350+', color: 'from-pink-500 to-rose-500' },
    { name: 'Kitap', image: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=500', count: '150+', color: 'from-yellow-500 to-orange-500' }
  ]

  const features = [
    {
      icon: Truck,
      title: 'Ücretsiz Kargo',
      desc: '500₺ üzeri alışverişlerde',
      color: 'from-blue-500 to-cyan-500'
    },
    {
      icon: Shield,
      title: 'Güvenli Ödeme',
      desc: '256-bit SSL güvenlik',
      color: 'from-green-500 to-emerald-500'
    },
    {
      icon: CreditCard,
      title: 'Kolay İade',
      desc: '14 gün içinde iade hakkı',
      color: 'from-purple-500 to-pink-500'
    },
    {
      icon: Zap,
      title: 'Hızlı Teslimat',
      desc: '2-4 iş günü içinde',
      color: 'from-orange-500 to-red-500'
    }
  ]

  const campaigns = [
    {
      title: 'Elektronik Ürünlerde',
      subtitle: '%50\'ye Varan İndirim',
      image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800',
      color: 'from-blue-600 to-purple-600',
      link: '/products?category=Elektronik'
    },
    {
      title: 'Spor Giyimde',
      subtitle: 'Yeni Sezon %40 İndirim',
      image: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=800',
      color: 'from-green-600 to-emerald-600',
      link: '/products?category=Spor'
    }
  ]

  // Live Activity Data (simulated)
  const [liveActivity] = useState([
    { user: 'Ali K.', action: 'iPhone 15 Pro', location: 'İstanbul', time: '2 dk önce' },
    { user: 'Ayşe M.', action: 'Nike Air Max', location: 'Ankara', time: '5 dk önce' },
    { user: 'Mehmet Y.', action: 'MacBook Air', location: 'İzmir', time: '8 dk önce' }
  ])

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-bg transition-colors">
      {/* SEO */}
      <SEO
        title="MyShop - En İyi Ürünler, En Uygun Fiyatlar | Online Alışveriş"
        description="MyShop'ta 570+ ürün, ücretsiz kargo, hızlı teslimat ve güvenli ödeme. Elektronik, giyim, ayakkabı ve daha fazlası. Trendyol'dan daha iyi fiyatlar!"
        keywords="online alışveriş, e-ticaret, ucuz ürünler, indirimli ürünler, ücretsiz kargo, elektronik, giyim, ayakkabı, aksesuar, kampanya, flash sale"
        url="/"
        type="website"
        breadcrumbList={[
          { name: 'Ana Sayfa', path: '/' }
        ]}
      />

      <Navbar />

      {/* Hero Section with HeroSectionV2 */}
      <HeroSectionV2 />

      {/* Bundles Section */}
      <section className="py-16 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <Package size={48} className="mx-auto mb-4 text-purple-600" />
            <h2 className="text-4xl font-bold mb-4 dark:text-dark-text">
              Product Bundles
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-400">
              Save more when you buy together!
            </p>
          </div>
          <div className="text-center">
            <button
              onClick={() => window.location.href = '/bundles'}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg hover:shadow-2xl transition"
            >
              Browse Bundles
            </button>
          </div>
        </div>
      </section>

      {/* Loyalty Program Section */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="bg-gradient-to-r from-yellow-600 to-orange-600 rounded-3xl p-12 text-white text-center">
            <Award size={64} className="mx-auto mb-6" />
            <h2 className="text-5xl font-bold mb-4">
              Join Our Loyalty Program
            </h2>
            <p className="text-2xl mb-8 opacity-90">
              Earn points with every purchase and unlock exclusive rewards!
            </p>
            <div className="grid grid-cols-4 gap-8 mb-8">
              <div>
                <p className="text-4xl font-bold mb-2">1x - 3x</p>
                <p className="text-sm">Points Multiplier</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-2">5</p>
                <p className="text-sm">Tier Levels</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-2">500+</p>
                <p className="text-sm">Points Per Referral</p>
              </div>
              <div>
                <p className="text-4xl font-bold mb-2">∞</p>
                <p className="text-sm">Exclusive Rewards</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = '/loyalty'}
              className="px-8 py-4 bg-white text-orange-600 rounded-xl font-bold text-lg hover:shadow-2xl transition"
            >
              Start Earning Points
            </button>
          </div>
        </div>
      </section>

      {/* Live Activity Banner */}
      <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white py-2 overflow-hidden">
        <motion.div
          animate={{ x: [0, -1000] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="flex gap-8 whitespace-nowrap"
        >
          {[...liveActivity, ...liveActivity].map((activity, index) => (
            <div key={index} className="flex items-center gap-2 text-sm">
              <Users size={16} />
              <span className="font-semibold">{activity.user}</span>
              <span>•</span>
              <span>{activity.action} satın aldı</span>
              <span>•</span>
              <span className="opacity-75">{activity.location}</span>
            </div>
          ))}
        </motion.div>
      </div>

      {/* Features Section */}
      <section ref={featuresRef} className="py-12 bg-white dark:bg-dark-card transition-colors">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="text-center group cursor-pointer"
              >
                <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon size={32} className="text-white" />
                </div>
                <h3 className="font-bold mb-1 group-hover:text-blue-600 dark:text-dark-text dark:group-hover:text-blue-400 transition-colors">{feature.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Campaign Banners */}
      <section className="py-12 px-4 dark:bg-dark-bg">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-6">
            {campaigns.map((campaign, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <Link
                  to={campaign.link}
                  className="group relative block h-64 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  <img
                    src={campaign.image}
                    alt={campaign.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-r ${campaign.color} opacity-80`} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-8">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      whileInView={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.2 }}
                      className="text-center"
                    >
                      <h3 className="text-3xl md:text-4xl font-bold mb-2">{campaign.title}</h3>
                      <p className="text-xl md:text-2xl mb-6">{campaign.subtitle}</p>
                      <span className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 rounded-full font-bold group-hover:scale-110 transition-transform">
                        Keşfet
                        <ArrowRight size={20} />
                      </span>
                    </motion.div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* SON BAKTIKLARIN - YENİ */}
      <RecentlyViewed />

      {/* Flash Sale Section */}
      <section ref={flashSaleRef} className="py-20 px-4 bg-gradient-to-br from-red-500 via-orange-500 to-yellow-500">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={flashSaleInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full mb-6 shadow-xl">
              <Flame className="text-red-600" size={32} />
              <span className="text-2xl font-bold text-red-600">FLASH SALE</span>
              <Flame className="text-red-600" size={32} />
            </div>

            <h2 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg">
              Sınırlı Süre!
            </h2>
            <p className="text-xl text-white/90 mb-8">
              Bu fırsatlar kaçmaz! Hemen al, çok geç olmasın!
            </p>

            {/* Countdown Timer */}
            <div className="flex justify-center gap-4 mb-8">
              {[
                { label: 'Saat', value: flashSaleTimeLeft.hours },
                { label: 'Dakika', value: flashSaleTimeLeft.minutes },
                { label: 'Saniye', value: flashSaleTimeLeft.seconds }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={flashSaleInView ? { scale: 1 } : {}}
                  transition={{ delay: index * 0.1, type: 'spring' }}
                  className="bg-white rounded-2xl p-4 md:p-6 shadow-2xl min-w-[80px] md:min-w-[100px]"
                >
                  <div className="text-3xl md:text-5xl font-bold text-red-600">
                    {String(item.value).padStart(2, '0')}
                  </div>
                  <div className="text-sm text-gray-600 font-semibold mt-1">
                    {item.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-72 bg-white/20 animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {flashSaleProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 50, rotate: -5 }}
                  animate={flashSaleInView ? { opacity: 1, y: 0, rotate: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="transform hover:scale-105 transition-transform"
                >
                  <ProductCardV2 product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Categories Section */}
      <section ref={categoriesRef} className="py-20 px-4 bg-white dark:bg-dark-card transition-colors">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={categoriesInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-12"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4 dark:text-dark-text">Kategoriler</h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">İhtiyacın olan her şey burada</p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {categories.map((category, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9, y: 30 }}
                animate={categoriesInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.05 }}
              >
                <Link
                  to={`/products?category=${category.name}`}
                  className="group relative block aspect-square rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-60 group-hover:opacity-70 transition-opacity`} />
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
                    <h3 className="text-xl md:text-2xl font-bold mb-1">{category.name}</h3>
                    <p className="text-sm opacity-90">{category.count} ürün</p>
                  </div>
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="text-white" size={20} />
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Best Sellers */}
      <section ref={bestSellerRef} className="py-20 px-4 bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-dark-bg dark:to-dark-card">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={bestSellerInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-full mb-4">
              <TrendingUp className="text-orange-600" size={20} />
              <span className="text-orange-600 font-semibold">Çok Satanlar</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 dark:text-dark-text">
              En Çok Tercih Edilenler
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              Herkesin favorisi ürünler
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 bg-white dark:bg-dark-card animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {bestSellerProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, x: -50 }}
                  animate={bestSellerInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCardV2 product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Bundle Deals Section */}
      {bundles.length > 0 && (
        <section className="py-20 px-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20">
          <div className="max-w-7xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900 dark:to-pink-900 rounded-full mb-4">
                <Package className="text-purple-600 dark:text-purple-400" size={20} />
                <span className="text-purple-600 dark:text-purple-400 font-semibold">Paket Fırsatları</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 dark:text-dark-text">
                Birlikte Al, Daha Çok Kazan
              </h2>
              <p className="text-gray-600 dark:text-gray-400 text-lg">
                Özel paket fırsatlarında %50'ye varan indirimler
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {bundles.slice(0, 3).map((bundle, index) => (
                <BundleCard key={bundle._id} bundle={bundle} index={index} />
              ))}
            </div>

            <div className="text-center">
              <Link
                to="/bundles"
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-bold hover:shadow-xl transition-all hover:scale-105"
              >
                Tüm Paketleri Gör
                <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section ref={featuredRef} className="py-20 px-4 bg-white dark:bg-dark-card transition-colors">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={featuredInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 rounded-full mb-4">
              <Sparkles className="text-purple-600 dark:text-purple-400" size={20} />
              <span className="text-purple-600 dark:text-purple-300 font-semibold">Size Özel</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 dark:text-dark-text">
              Sizin İçin Seçtiklerimiz
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              İlginizi çekebilecek ürünler
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 bg-gray-200 dark:bg-dark-hover animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={featuredInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCardV2 product={product} />
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={featuredInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.8 }}
            className="text-center mt-12"
          >
            <Link
              to="/products"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-full font-bold hover:shadow-xl transition-all hover:scale-105"
            >
              Tüm Ürünleri Gör
              <ArrowRight size={20} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* New Products */}
      <section ref={newProductsRef} className="py-20 px-4 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-dark-bg dark:to-dark-card">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={newProductsInView ? { opacity: 1, y: 0 } : {}}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 rounded-full mb-4">
              <Sparkles className="text-green-600 dark:text-green-400" size={20} />
              <span className="text-green-600 dark:text-green-300 font-semibold">Yeni Gelenler</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold mb-4 dark:text-dark-text">
              Taze Ürünler
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-lg">
              En yeni ürünleri ilk sen keşfet
            </p>
          </motion.div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-96 bg-white dark:bg-dark-card animate-pulse rounded-2xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newProducts.map((product, index) => (
                <motion.div
                  key={product._id}
                  initial={{ opacity: 0, scale: 0.9, y: 30 }}
                  animate={newProductsInView ? { opacity: 1, scale: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <ProductCardV2 product={product} />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 px-4 bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <Gift className="text-yellow-400 mx-auto mb-4" size={64} />
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              İlk Alışverişine Özel %20 İndirim!
            </h2>
            <p className="text-xl text-white/90 mb-8">
              E-bültenimize abone ol, indirimler ve kampanyalardan ilk sen haberdar ol
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-xl mx-auto">
              <input
                type="email"
                placeholder="E-posta adresin"
                className="flex-1 px-6 py-4 rounded-full focus:outline-none focus:ring-4 focus:ring-white/50 text-lg"
              />
              <button className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold hover:bg-gray-100 transition-all hover:scale-105 shadow-xl">
                %20 İndirim Kazan
              </button>
            </div>
            <p className="text-sm text-white/70 mt-4">
              ✓ Spam göndermiyoruz  ✓ İstediğin zaman çık  ✓ Güvenli
            </p>
          </motion.div>
        </div>
      </section>

      {/* SEO: Browse Categories Internal Linking */}
      <BrowseCategories title="Kategorileri Keşfet" limit={6} />

      <Footer />
      <BottomNav />
    </div>
  )
}

export default HomePage