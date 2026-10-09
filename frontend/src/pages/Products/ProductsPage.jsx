import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useMetaDescription, metaDescriptions } from '../../utils/metaDescriptions';
import { motion } from 'framer-motion';
import { Filter, Grid, List, SlidersHorizontal } from 'lucide-react';
import SEO from '../../components/seo/SEO';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import BottomNav from '../../components/layout/BottomNav';
import ProductCardV2 from '../../components/common/ProductCardV2';
import { productAPI } from '../../api/productAPI';

function ProductsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Set optimized meta description for SEO
  useMetaDescription(metaDescriptions.products.description, metaDescriptions.products.title);

  // Filters
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get("category") || "",
    search: searchParams.get("search") || searchParams.get("q") || "",
    brand: searchParams.get('brand') || '',
    minPrice: '',
    maxPrice: '',
    sort: 'newest',
  });

  const categories = [
    'Tümü',
    'Elektronik',
    'Giyim',
    'Ayakkabı',
    'Aksesuar',
    'Ev & Yaşam',
    'Spor & Outdoor',
    'Kozmetik',
  ];

  const brands = [
    'Apple',
    'Samsung',
    'Nike',
    'Adidas',
    'Zara',
    'H&M',
    "Levi's",
    'The North Face',
    'Sony',
    'Canon',
    'Dyson',
  ];

  const sortOptions = [
    { value: 'newest', label: 'En Yeni' },
    { value: 'price-asc', label: 'Fiyat: Düşükten Yükseğe' },
    { value: 'price-desc', label: 'Fiyat: Yüksekten Düşüğe' },
    { value: 'popular', label: 'En Popüler' },
    { value: 'rating', label: 'En Yüksek Puan' },
  ];

  useEffect(() => {
    // URL'den search parametresini oku
    const search = searchParams.get('search') || '';
    if (search !== filters.search) {
      setFilters(prev => ({ ...prev, search }));
    }
  }, [searchParams]);

  useEffect(() => {
    fetchProducts();
  }, [filters]);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const params = {
        category: filters.category === "Tümü" ? "" : filters.category,
        search: filters.search || undefined,
        brand: filters.brand,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sort: filters.sort,
        limit: 50,
      };

      // Only add keyword if search is not empty
      if (filters.search && filters.search.trim()) {
        params.keyword = filters.search.trim();
      }

      const data = await productAPI.getProducts(params);
      setProducts(data.products);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));

    // URL'i güncelle
    if (value) {
      searchParams.set(key, value);
    } else {
      searchParams.delete(key);
    }
    setSearchParams(searchParams);
  };

  const categoryTitle = filters.category ? `${filters.category} Ürünleri` : 'Tüm Ürünler';
  const categoryDesc = filters.category 
    ? `MyShop'ta ${filters.category} kategorisinde ${products.length}+ ürün. En uygun fiyatlar, ücretsiz kargo ve hızlı teslimat.`
    : `MyShop'ta 570+ ürün. Elektronik, giyim, ayakkabı ve daha fazlası. En uygun fiyatlar ve ücretsiz kargo.`;

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <SEO
        title={`${categoryTitle} | MyShop - Online Alışveriş`}
        description={categoryDesc}
        keywords={`${filters.category || 'online alışveriş, e-commerce, ucuz ürünler'}, online alışveriş, fiyatları, ucuz, kampanya`}
        url={`/products${filters.category ? `?category=${filters.category}` : ''}`}
        breadcrumbList={[
          { name: 'Ana Sayfa', path: '/' },
          { name: 'Ürünler', path: '/products' },
          ...(filters.category ? [{ name: filters.category, path: `/products?category=${filters.category}` }] : [])
        ]}
      />
      <Navbar />

      {/* Hero Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="max-w-7xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            {filters.category || 'Tüm Ürünler'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg opacity-90"
          >
            {products.length} ürün bulundu
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Filters */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="flex items-center gap-2 mb-6">
                <SlidersHorizontal size={20} />
                <h2 className="text-xl font-bold">Filtreler</h2>
              </div>

              {/* Kategori */}
              <div className="mb-6">
                <h3 className="font-bold mb-3">Kategori</h3>
                <div className="space-y-2">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleFilterChange('category', cat === 'Tümü' ? '' : cat)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition ${
                        (cat === 'Tümü' && !filters.category) || filters.category === cat
                          ? 'bg-blue-600 text-white'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Marka */}
              <div className="mb-6">
                <h3 className="font-bold mb-3">Marka</h3>
                <select
                  value={filters.brand}
                  onChange={(e) => handleFilterChange('brand', e.target.value)}
                  className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  <option value="">Tüm Markalar</option>
                  {brands.map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
                </select>
              </div>

              {/* Fiyat Aralığı */}
              <div className="mb-6">
                <h3 className="font-bold mb-3">Fiyat Aralığı</h3>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                  <input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                    className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Temizle */}
              <button
                onClick={() => {
                  setFilters({ category: '', brand: '', minPrice: '', maxPrice: '', sort: 'newest' });
                  setSearchParams({});
                }}
                className="w-full py-2 border-2 border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
              >
                Filtreleri Temizle
              </button>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <select
                  value={filters.sort}
                  onChange={(e) => handleFilterChange('sort', e.target.value)}
                  className="px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500"
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'grid'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <Grid size={20} />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition ${
                    viewMode === 'list'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                >
                  <List size={20} />
                </button>
              </div>
            </div>

            {/* Products */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="h-96 bg-gray-200 animate-pulse rounded-2xl" />
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-2xl font-bold text-gray-600">Ürün bulunamadı</p>
              </div>
            ) : (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6'
                    : 'space-y-6'
                }
              >
                {products.map((product, index) => (
                  <ProductCardV2 key={product._id} product={product} index={index} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
      <BottomNav />
    </div>
  );
}

export default ProductsPage;