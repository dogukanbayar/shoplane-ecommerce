import { Trash2, Plus, Minus } from 'lucide-react'
import { Link } from 'react-router-dom'
import { useCartStore } from '../../store/cartStore'

function CartItem({ item }) {
  const { updateQuantity, removeItem } = useCartStore()

  // Veri fallback alanları
  const prod = item.product || item
  const productId = prod._id || prod.id || item._id || item.id
  const name = prod.name || item.name || 'Ürün'
  const image = prod.images?.[0] || prod.image || item.image || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80'
  const price = Number(item.price ?? prod.price ?? 0)
  const stock = prod.stock ?? item.stock ?? 99

  const handleIncrease = () => {
    if (item.quantity < stock) {
      updateQuantity(item.cartId, item.quantity + 1)
    } else {
      alert('Maksimum stok miktarına ulaştınız!')
    }
  }

  const handleDecrease = () => {
    if (item.quantity > 1) {
      updateQuantity(item.cartId, item.quantity - 1)
    }
  }

  const handleRemove = () => {
    if (confirm(`${name} sepetten kaldırılsın mı?`)) {
      removeItem(item.cartId)
    }
  }

  return (
    <div className="bg-white rounded-xl p-4 flex gap-4 hover:shadow-sm transition items-center">
      {/* Ürün Resmi */}
      <Link to={`/products/${productId}`} className="flex-shrink-0">
        <img
          src={image}
          alt={name}
          className="w-24 h-24 object-cover rounded-lg border border-gray-100 hover:scale-105 transition"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&q=80';
          }}
        />
      </Link>

      {/* Ürün Bilgileri */}
      <div className="flex-1 min-w-0">
        <Link to={`/products/${productId}`}>
          <h3 className="text-base font-semibold text-gray-900 truncate hover:text-blue-600 transition">
            {name}
          </h3>
        </Link>
        
        <div className="flex flex-wrap gap-3 text-xs text-gray-500 my-1.5">
          {item.size && (
            <span><strong className="text-gray-700">Beden:</strong> {item.size}</span>
          )}
          {item.color && (
            <span><strong className="text-gray-700">Renk:</strong> {item.color}</span>
          )}
        </div>

        {/* Miktar ve Fiyat */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleDecrease}
              className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition"
              disabled={item.quantity <= 1}
            >
              <Minus size={14} />
            </button>
            
            <span className="w-10 text-center font-semibold text-sm">
              {item.quantity}
            </span>
            
            <button
              onClick={handleIncrease}
              className="w-8 h-8 rounded-lg border border-gray-200 hover:bg-gray-50 flex items-center justify-center transition"
              disabled={item.quantity >= stock}
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="text-right">
            <div className="text-lg font-bold text-blue-600">
              ₺{(price * item.quantity).toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Sil Butonu */}
      <button
        onClick={handleRemove}
        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition ml-2"
        title="Sepetten Kaldır"
      >
        <Trash2 size={18} />
      </button>
    </div>
  )
}

export default CartItem
