const mongoose = require('mongoose')

const productSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller"
  },
  name: {
    type: String,
    required: [true, 'Ürün adı gereklidir'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Ürün açıklaması gereklidir']
  },
  price: {
    type: Number,
    required: [true, 'Ürün fiyatı gereklidir'],
    min: 0
  },
  oldPrice: {
    type: Number,
    default: null
  },
  images: [{
    type: String,
    required: true
  }],
  category: {
    type: String,
    required: [true, 'Kategori gereklidir'],
    enum: ['Elektronik', 'Aksesuar', 'Ayakkabı', 'Giyim', 'Ev & Yaşam', 'Spor & Outdoor', 'Kozmetik']
  },
  brand: {
    type: String,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  colors: [{
    type: String
  }],
  sizes: [{
    type: String
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  features: {
    type: Map,
    of: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  // Pre-order fields - YENİ
  isPreOrder: {
    type: Boolean,
    default: false
  },
  preOrderInfo: {
    releaseDate: {
      type: Date
    },
    estimatedShipDate: {
      type: Date
    },
    depositAmount: {
      type: Number,
      default: 0 // 0 = tam ödeme, >0 = depozito miktarı
    },
    depositPercentage: {
      type: Number,
      default: 100 // 100 = tam ödeme, <100 = yüzde depozito
    },
    maxPreOrders: {
      type: Number // Maksimum ön sipariş sayısı
    },
    currentPreOrders: {
      type: Number,
      default: 0
    },
    preOrderBenefits: [String], // Ön siparişe özel avantajlar
    description: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtual: Pre-order mevcut mu?
productSchema.virtual('preOrderAvailable').get(function () {
  if (!this.isPreOrder) return false
  // Check if maxPreOrders is set and if we reached the limit
  if (this.preOrderInfo && this.preOrderInfo.maxPreOrders && this.preOrderInfo.currentPreOrders >= this.preOrderInfo.maxPreOrders) {
    return false
  }
  return true
})

// Text search için index
productSchema.index({ name: 'text', description: 'text', brand: 'text' })

module.exports = mongoose.model('Product', productSchema)