const mongoose = require("mongoose");

const sellerSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  storeName: {
    type: String,
    required: [true, "Mağaza adı zorunludur"],
    trim: true,
    unique: true
  },
  taxNumber: {
    type: String,
    required: [true, "Vergi numarası zorunludur"]
  },
  commissionRate: {
    type: Number,
    default: 15 // Yüzde 15 pazar yeri komisyonu
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  rating: {
    type: Number,
    default: 5.0,
    min: 1,
    max: 5
  },
  logo: {
    type: String,
    default: "https://images.unsplash.com/photo-1472851294608-062f824d29cc"
  }
}, { timestamps: true });

module.exports = mongoose.model("Seller", sellerSchema);
