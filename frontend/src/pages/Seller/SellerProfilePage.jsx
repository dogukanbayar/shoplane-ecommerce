import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import ProductCard from '../../components/common/ProductCard';
import { Store, Star, Package, ShieldCheck, ArrowLeft } from 'lucide-react';

function SellerProfilePage() {
  const { id } = useParams();
  const [sellerData, setSellerData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSeller = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/sellers/${id}`);
        const data = await res.json();
        if (data.success) {
          setSellerData(data);
        } else {
          setError(data.message || 'Backend tarafında çok satıcılı pazar yeri mimarisinin ödeme ve hakediş dağıtımı akışı başarıyla doğrulandı:

* Tek bir 1700 TL'lik işlemde iki alt satıcı için net kazançlar hesaplandı: **Tekno Trend (306 TL)** ve **Moda Butik (1156 TL)**.
* Kargo takipleri birbirinden izole kaldı.
* `MOCK_PAY_...` dekontu ile sipariş `isPaid: true` durumuna geçirildi.

Sırada kullanıcının bir satıcının ismine tıkladığında onun mağaza vitrinine gideceği **Satıcı Mağaza Profili Sayfası (SellerProfile.jsx)** ve React Router bağlantısı var.

---

### 1. `SellerProfile.jsx` Sayfasını Oluştur

Satıcının logosunu, puanını, onay rozetini ve sadece o mağazaya ait ürünleri listeleyen vitrin sayfasını oluşturalım:

```bash
cat << 'EOF' > frontend/src/pages/SellerProfile.jsx
import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Store, Star, Package, ShieldCheck, ArrowLeft } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import ProductCard from '../components/common/ProductCard';

export default function SellerProfile() {
  const { id } = useParams();
  const [seller, setSeller] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSellerData() {
      try {
        const res = await fetch(`http://localhost:5001/api/sellers/${id}`);
        const data = await res.json();
        if (data.success) {
          setSeller(data.seller);
          setProducts(data.products || []);
        }
      } catch (err) {
        console.error("Satıcı mağazası yüklenemedi:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchSellerData();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <Navbar/>
        <div className="text-center py-24 text-gray-500 font-medium">Mağaza bilgileri yükleniyor...</div>
        <Footer/>
      </div>
    );
  }

  if (!seller) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
        <Navbar/>
        <div className="text-center py-24">
          <p className="text-gray-600 mb-4">Mağaza bulunamadı.</p>
          <Link className="text-orange-600 font-semibold hover:underline" to="/products">Ürünlere Dön</Link>
        </div>
        <Footer/>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <Navbar/>

      <main className="max-w-7xl mx-auto px-4 py-8 w-full flex-grow">
        {/* Breadcrumb */}
        <div className="mb-6">
          <Link className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors" to="/products">
            <ArrowLeft className="w-4 h-4"/> Tüm Ürünlere Dön
          </Link>
        </div>

        {/* Satıcı Mağaza Banner & Bilgi Kartı */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 md:p-8 mb-10 flex flex-col md:flex-row items-center gap-6 justify-between">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center overflow-hidden shrink-0">
              {seller.logo ? (
                <img src={seller.logo} alt={seller.storeName} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-10 h-10 text-orange-500"/>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{seller.storeName}</h1>
                <span title="Onaylı Pazaryeri Satıcısı">
                  <ShieldCheck className="w-5 h-5 text-green-600"/>
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-1">Yetkili: {seller.user?.name || "ShopLane Onaylı Satıcı"}</p>
            </div>
          </div>

          <div className="flex items-center gap-6 divide-x divide-gray-100 border-t md:border-t-0 pt-4 md:pt-0 w-full md:w-auto justify-around md:justify-end">
            <div className="text-center px-4">
              <div className="flex items-center justify-center gap-1 text-orange-600 font-bold text-xl">
                <Star className="w-5 h-5 fill-orange-500 text-orange-500"/>
                <span>{seller.rating || "5.0"}</span>
              </div>
              <span className="text-xs text-gray-500">Mağaza Puanı</span>
            </div>
            <div className="text-center px-4">
              <div className="flex items-center justify-center gap-1 text-gray-800 font-bold text-xl">
                <Package className="w-5 h-5 text-gray-500"/>
                <span>{products.length}</span>
              </div>
              <span className="text-xs text-gray-500">Listelenen Ürün</span>
            </div>
          </div>
        </div>

        {/* Mağazaya Ait Ürünler Vitrini */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">Mağazanın Ürünleri ({products.length})</h2>
          </div>

          {products.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center text-gray-500 border border-gray-200">
              Bu mağazaya ait henüz aktif ürün bulunmuyor.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {products.map((p) => (
                <ProductCard key="{p._id" p.id} product="{p}" ||/>
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer/>
    </div>
  );
}
