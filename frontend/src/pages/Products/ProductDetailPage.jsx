import { useState, useEffect } from 'react';
import { useABTest } from '../../hooks/useABTest';
import { useJourneyTracking } from '../../hooks/useJourneyTracking';
import { useMetaDescription } from '../../utils/metaDescriptions';
import { useParams, Link } from 'react-router-dom';
import { useCartStore } from '../../store/cartStore';
import { Star, Heart, Share2, Truck, Shield, ArrowLeft, Plus, Minus, ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import BottomNav from '../../components/layout/BottomNav';
import Breadcrumb from '../../components/layout/Breadcrumb';
import BrowseCategories from '../../components/seo/BrowseCategories';
import RelatedProducts from '../../components/seo/RelatedProducts';
import ProductCardV2 from '../../components/common/ProductCardV2';
import FrequentlyBoughtTogether from '../../components/product/FrequentlyBoughtTogether';
import PreOrderBadge from '../../components/product/PreOrderBadge';
import PreOrderModal from '../../components/product/PreOrderModal';
import API from '../../api/axiosConfig';

function ProductDetailPage() {
  const { id } = useParams();
  const { experiments, getVariant, getChanges, trackClick } = useABTest('product');
  const { trackTouchpoint } = useJourneyTracking();
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [favorite, setFavorite] = useState(false);
  const [showPreOrderModal, setShowPreOrderModal] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch product details
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const response = await API.get(`/products/${id}`);
        if (response.data.product) {
          setProduct(response.data.product);
          
          // Fetch related products
          if (response.data.product.category) {
            const relatedRes = await API.get(`/products?category=${response.data.product.category}&limit=4`);
            setRelatedProducts(relatedRes.data.products.filter(p => p._id !== id));
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  // Track product view when product loads
  useEffect(() => {
    if (product) {
      trackTouchpoint('product_view', {
        product: product._id,
        metadata: {
          productName: product.name,
          price: product.price,
          category: product.category
        }
      });
    }
  }, [product, trackTouchpoint]);

  // Set optimized meta description for SEO
  const metaDescription = product ? 
    `${product.name} - ${(product.price * (1 - (product.discount || 0) / 100)).toFixed(0)}₺ - ⭐${product.rating || '4.5'} (${product.numReviews || '0'} değerlendirme) | MyShop`
    : 'Ürün yükleniyor...';
  const pageTitle = product ? `${product.name} | MyShop` : 'Ürün | MyShop';
  useMetaDescription(metaDescription, pageTitle);

  const { addItem } = useCartStore();
  const handleAddToCart = () => {
    if (!product) return;
    const selectedSize = (typeof selectedVariant !== "undefined" && selectedVariant?.size) || product.sizes?.[0] || "Standart";
    const selectedColor = (typeof selectedVariant !== "undefined" && selectedVariant?.color) || product.colors?.[0] || "Standart";
    addItem(product, selectedSize, selectedColor, quantity || 1);
    alert("Ürün sepete eklendi!");
  };
  const handleToggleFavorite = () => setFavorite(f => !f);

  // Dummy price config for A/B test
  const priceConfig = {
    emphasizeDiscount: true,
    showStrikethrough: true,
    showSavingsPercent: true,
    showSavingsAmount: true,
  };
  const finalPrice = product?.price ? product.price * (1 - (product.discount || 0) / 100) : 0;
  const savingsAmount = product?.price ? product.price - finalPrice : 0;

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Navbar />
        <div className="flex flex-col items-center gap-4 mt-20">
          <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
          <p className="text-gray-600">Ürün yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Navbar />
        <div className="text-center mt-20">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Ürün bulunamadı</h1>
          <Link to="/products" className="text-blue-600 hover:underline">Ürünlere geri dön</Link>
        </div>
      </div>
    );
  }

  // Product JSON-LD Schema for Google Rich Results
  const productSchema = {
    '@context': 'https://schema.org/',
    '@type': 'Product',
    'name': product?.name,
    'image': product?.images?.[0] || '',
    'description': product?.description || '',
    'brand': {
      '@type': 'Brand',
      'name': product?.brand || 'MyShop'
    },
    'offers': {
      '@type': 'Offer',
      'url': `http://localhost:5178/product/${product?._id}`,
      'priceCurrency': 'USD',
      'price': (product?.price * (1 - (product?.discount || 0) / 100)).toFixed(2),
      'priceValidUntil': new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      'availability': product?.stock > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      'seller': {
        '@type': 'Organization',
        'name': 'MyShop'
      }
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': product?.rating || '4.5',
      'ratingCount': product?.numReviews || '0'
    }
  };

  return (
    <div>
      {/* Product Schema */}
      <script type="application/ld+json">
        {JSON.stringify(productSchema)}
      </script>
      
      <Navbar />
      <Breadcrumb />
      <div className="container mx-auto px-4 py-8">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6">
          <ArrowLeft size={20} />
          <span>Geri Dön</span>
        </Link>
        {/* Main Content Example */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Left - Images */}
          <div>
            {/* Main Image */}
            <motion.div
              key={selectedImage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-square bg-white rounded-2xl overflow-hidden mb-4 shadow-lg"
            >
              <img
                src={product?.images?.[selectedImage] || ''}
                alt={product?.name || ''}
                className="w-full h-full object-cover"
              />
            </motion.div>
            {/* Thumbnail Gallery */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {product?.images?.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${selectedImage === index ? 'border-blue-500' : 'border-gray-200'}`}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>
          {/* Right - Product Info */}
          <div>
            <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
              {product?.brand}
            </p>
            <div className="mb-2">
              <PreOrderBadge product={product} />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {product?.name}
            </h1>
            <div className="flex items-center gap-3 mb-6">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    fill={i < Math.floor(product?.rating || 0) ? '#FCD34D' : 'none'}
                    className="text-yellow-400"
                  />
                ))}
              </div>
              <span className="text-gray-600">
                {product?.rating} ({product?.numReviews} değerlendirme)
              </span>
            </div>
            {/* Price A/B Test Example */}
            <div className="flex items-baseline gap-4 mb-6 pb-6 border-b">
              {product?.discount ? (
                <div className="space-y-2">
                  {priceConfig.emphasizeDiscount && (
                    <div className="inline-block px-4 py-2 bg-red-600 text-white rounded-lg font-bold text-lg mb-2">
                      🔥 %{product.discount} İNDİRİM
                    </div>
                  )}
                  <div className="flex items-baseline gap-4">
                    <span className="text-5xl font-bold text-red-600">
                      {finalPrice.toFixed(2)}₺
                    </span>
                    {priceConfig.showStrikethrough && (
                      <span className="text-2xl text-gray-500 line-through">
                        {product.price.toFixed(2)}₺
                      </span>
                    )}
                    {priceConfig.showSavingsPercent && !priceConfig.emphasizeDiscount && (
                      <span className="px-3 py-1 bg-red-100 text-red-600 rounded-full font-bold">
                        -%{product.discount}
                      </span>
                    )}
                  </div>
                  {priceConfig.showSavingsAmount && (
                    <p className="text-green-600 font-bold text-lg">
                      🎉 {savingsAmount.toFixed(2)}₺ tasarruf ediyorsunuz!
                    </p>
                  )}
                </div>
              ) : (
                <span className="text-5xl font-bold text-blue-600">
                  {product?.price?.toFixed(2)}₺
                </span>
              )}
            </div>
            {/* Action Buttons */}
            <div className="flex gap-4 mb-6">
              {product?.isPreOrder ? (
                <button
                  onClick={() => setShowPreOrderModal(true)}
                  className="flex-1 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-xl transition"
                >
                  <Plus size={24} className="rotate-45" />
                  Ön Sipariş Ver
                </button>
              ) : (
                <button
                  onClick={handleAddToCart}
                  disabled={product?.stock === 0}
                  className="flex-1 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-bold text-lg flex items-center justify-center gap-2 hover:shadow-xl transition disabled:opacity-50"
                >
                  <ShoppingCart size={24} />
                  {product?.stock === 0 ? 'Stokta Yok' : 'Sepete Ekle'}
                </button>
              )}
              <button
                onClick={handleToggleFavorite}
                className={`p-4 rounded-xl border-2 transition ${favorite ? 'bg-red-500 border-red-500 text-white' : 'border-gray-300 hover:border-red-500 hover:text-red-500'}`}
              >
                <Heart size={24} fill={favorite ? 'currentColor' : 'none'} />
              </button>
              <button className="p-4 rounded-xl border-2 border-gray-300 hover:border-blue-500 hover:text-blue-500 transition">
                <Share2 size={24} />
              </button>
            </div>
            {/* Features */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl">
              <div className="flex items-center gap-2">
                <Truck className="text-green-600" size={20} />
                <span className="text-sm">Ücretsiz Kargo</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="text-blue-600" size={20} />
                <span className="text-sm">Güvenli Ödeme</span>
              </div>
            </div>
          </div>
        </div>
        {/* FREQUENTLY BOUGHT TOGETHER */}
        {product && (
          <div className="my-12">
            <FrequentlyBoughtTogether currentProduct={product} />
          </div>
        )}
        {/* Related Products with Internal Links (SEO) */}
        <RelatedProducts 
          currentProductId={product?._id}
          category={product?.category}
          productName={product?.name}
          limit={4}
        />

        {/* SEO: Browse Related Categories */}
        <BrowseCategories title="Diğer Kategorileri Keşfet" limit={6} />
      </div>
      <Footer />
      <BottomNav />
      {product && (
        <PreOrderModal
          product={product}
          isOpen={showPreOrderModal}
          onClose={() => setShowPreOrderModal(false)}
        />
      )}
    </div>
  );
}

export default ProductDetailPage;