import { useMetaDescription, metaDescriptions } from '../../utils/metaDescriptions'
import Navbar from '../../components/layout/Navbar'
import Footer from '../../components/layout/Footer'
import BottomNav from '../../components/layout/BottomNav'
import CartItem from '../../components/Cart/CartItem'
import CartSummary from '../../components/Cart/CartSummary'
import EmptyCart from '../../components/Cart/EmptyCart'
import { Package, Trash2, ArrowLeft, Store } from 'lucide-react'
import { useCartStore } from '../../store/cartStore'
import { Link } from 'react-router-dom'

function CartPage() {
  const { items = [], bundles = [], removeBundleFromCart, updateBundleQuantity, clearCart } = useCartStore()
  
  const totalCount = (items?.length || 0) + (bundles?.length || 0)
  useMetaDescription(
    metaDescriptions?.cart?.description?.replace('{itemCount}', totalCount) || 'Sepetim', 
    metaDescriptions?.cart?.title || 'Sepetim | ShopLane'
  )

  const handleClearCart = () => {
    if (confirm('Sepetinizdeki tüm ürünleri silmek istediğinizden emin misiniz?')) {
      clearCart()
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-16 md:pb-0">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center justify-between mb-8">
          <div className="text-sm text-gray-600">
            <Link to="/" className="hover:text-gray-900">Ana Sayfa</Link>
            {' / '}
            <span className="text-gray-900 font-semibold">Sepetim</span>
          </div>

          <Link
            to="/products"
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold"
          >
            <ArrowLeft size={20} />
            Alışverişe Devam Et
          </Link>
        </div>

        {items.length === 0 && bundles.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl font-bold">
                Sepetim ({totalCount} ürün)
              </h1>
              <button
                onClick={handleClearCart}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
              >
                <Trash2 size={20} />
                Sepeti Temizle
              </button>
            </div>

            <div className="grid lg:grid-cols-3 gap-8">
              {/* Sol: Ürün Listesi */}
              <div className="lg:col-span-2 space-y-4">
                {(() => {
                  const groupedItems = (items || []).reduce((acc, item) => {
                    const sellerKey = item.product?.seller?._id || item.seller?._id || "default"
                    const sellerName = item.product?.seller?.storeName || item.seller?.storeName || "ShopLane Resmi Satıcı"
                    const sellerRating = item.product?.seller?.rating || item.seller?.rating || "4.8"

                    if (!acc[sellerKey]) {
                      acc[sellerKey] = {
                        name: sellerName,
                        rating: sellerRating,
                        items: []
                      }
                    }
                    acc[sellerKey].items.push(item)
                    return acc
                  }, {})

                  return Object.entries(groupedItems).map(([sId, group]) => (
                    <div key={sId} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
                      <div className="bg-gray-50/80 px-5 py-3.5 border-b border-gray-200 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Store className="w-4 h-4 text-orange-500" />
                          <span className="font-bold text-gray-800 text-sm">
                            Satıcı: <Link className="text-orange-600 hover:underline" to={`/sellers/${sId}`}>{group.name}</Link>
                          </span>
                          <span className="bg-orange-100 text-orange-700 font-bold px-1.5 py-0.5 rounded text-[11px]">
                            ⭐ {group.rating}
                          </span>
                        </div>
                        <span className="text-xs text-green-600 font-semibold bg-green-50 px-2 py-1 rounded">
                          ✓ Hızlı Gönderi
                        </span>
                      </div>

                      <div className="p-4 space-y-4 divide-y divide-gray-100">
                        {group.items.map((item, idx) => (
                          <div key={item.cartId || item._id || item.id || `item-${idx}`} className="pt-3 first:pt-0">
                            <CartItem item={item} />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                })()}
              </div>

              {/* Sağ: Sepet Özeti */}
              <div className="lg:col-span-1">
                <CartSummary />
              </div>
            </div>

            {/* Bundles Section */}
            {bundles.length > 0 && (
              <div className="mb-8 mt-6">
                <div className="flex items-center gap-3 mb-4">
                  <Package size={28} className="text-purple-600" />
                  <h2 className="text-2xl font-bold dark:text-dark-text">
                    Paketler ({bundles.length})
                  </h2>
                </div>
                <div className="space-y-4">
                  {bundles.map((bundleItem, index) => (
                    <div
                      key={`bundle-${bundleItem.bundle?._id || index}`}
                      className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white">
                          {bundleItem.bundle?.images?.[0] ? (
                            <img
                              src={bundleItem.bundle.images[0]}
                              alt={bundleItem.bundle.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package size={40} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-lg font-bold mb-2">
                            {bundleItem.bundle?.name || "Özel Paket"}
                          </h3>
                          <div className="mb-3">
                            <p className="text-xs font-semibold text-gray-600 mb-1">
                              İçerik:
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {bundleItem.bundle?.products?.map((item, idx) => (
                                <span
                                  key={`prod-${idx}`}
                                  className="px-2 py-1 bg-white rounded text-xs border border-purple-100"
                                >
                                  {item.product?.name || "Ürün"} x{item.quantity}
                                </span>
                              ))}
                            </div>
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-bold text-purple-600">
                              {Number(bundleItem.price || 0).toFixed(2)}₺
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => updateBundleQuantity(
                              bundleItem.bundle?._id,
                              bundleItem.selectedProducts,
                              (bundleItem.quantity || 1) - 1
                            )}
                            className="w-8 h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                          >
                            -
                          </button>
                          <span className="w-8 text-center font-bold">
                            {bundleItem.quantity || 1}
                          </span>
                          <button
                            onClick={() => updateBundleQuantity(
                              bundleItem.bundle?._id,
                              bundleItem.selectedProducts,
                              (bundleItem.quantity || 1) + 1
                            )}
                            className="w-8 h-8 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
                          >
                            +
                          </button>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold mb-2">
                            {(Number(bundleItem.price || 0) * Number(bundleItem.quantity || 1)).toFixed(2)}₺
                          </p>
                          <button
                            onClick={() => removeBundleFromCart(
                              bundleItem.bundle?._id,
                              bundleItem.selectedProducts
                            )}
                            className="text-red-600 hover:text-red-700 transition"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
      <BottomNav />
    </div>
  )
}

export default CartPage
