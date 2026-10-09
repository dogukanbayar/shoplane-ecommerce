require('./Seller');
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true
  },
  name: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  image: { type: String }
});

const subOrderSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Seller",
    required: true
  },
  items: [orderItemSchema],
  subTotal: { type: Number, required: true },
  commissionRate: { type: Number, default: 15 },
  commissionAmount: { type: Number, required: true },
  sellerEarnings: { type: Number, required: true },
  status: {
    type: String,
    enum: ["Hazırlanıyor", "Kargoya Verildi", "Teslim Edildi", "İptal Edildi", "İade Talebi Alındı", "İade Edildi", "processing", "shipped", "delivered", "cancelled", "returned"],
    default: "Hazırlanıyor"
  },
  trackingNumber: { type: String, default: null },
  cargoCompany: { type: String, default: "Yurtiçi Kargo" }
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    subOrders: [subOrderSchema],
    totalAmount: {
      type: Number,
      required: true
    },
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, default: "34000" },
      country: { type: String, default: "Türkiye" }
    },
    paymentMethod: {
    type: String,
    default: "creditCard"
  },
    paymentResult: {
      id: String,
      status: String,
      updateTime: String
    },
    isPaid: {
      type: Boolean,
      default: false
    },
    paidAt: {
      type: Date
    }
  },
  { timestamps: true }
);


orderSchema.pre("validate", function(next) {
  if (!this.orderNumber) {
    this.orderNumber = "ORD-" + Date.now() + "-" + Math.floor(1000 + Math.random() * 9000);
  }
  if (typeof next === "function") next();
});


orderSchema.pre("validate", function(next) {
  if (!this.orderNumber) {
    this.orderNumber = "ORD-" + Date.now() + "-" + Math.floor(100000 + Math.random() * 900000);
  }
  if (typeof next === "function") next();
});

module.exports = mongoose.model("Order", orderSchema);
