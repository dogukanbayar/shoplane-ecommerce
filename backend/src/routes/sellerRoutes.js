const express = require("express");
const router = express.Router();
const Seller = require("../models/Seller");
const Product = require("../models/Product");
const { getSellerOrders, updateSubOrderStatus } = require("../controllers/sellerController");

// Satıcı alt siparişlerini görüntüleme ve güncelleme
router.get("/:sellerId/orders", getSellerOrders);
router.put("/:sellerId/orders/:orderId/status", updateSubOrderStatus);

// Satıcı mağaza profili ve ürünleri
router.get("/:id", async (req, res) => {
  try {
    const seller = await Seller.findById(req.params.id).populate("user", "name email");
    if (!seller) {
      return res.status(404).json({ success: false, message: "Satıcı bulunamadı" });
    }

    const products = await Product.find({ seller: seller._id, isActive: true });

    res.json({
      success: true,
      seller,
      productsCount: products.length,
      products
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Tüm onaylı mağazaları listele
router.get("/", async (req, res) => {
  try {
    const sellers = await Seller.find({ isApproved: true });
    res.json({ success: true, count: sellers.length, sellers });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
