const express = require("express");
const router = express.Router();
const { 
  createOrder, 
  getMyOrders, 
  cancelOrder, 
  returnOrder,
  getAllOrders,
  updateOrderStatus
} = require("../controllers/orderController");
const { protect } = require("../middleware/auth");

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Sipariş yönetimi ve durum güncelleme işlemleri
 */

/**
 * @swagger
 * /orders:
 *   post:
 *     summary: Yeni bir sipariş oluşturur
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *         schema:
 *           type: object
 *           required:
 *             - items
 *             - shippingAddress
 *           properties:
 *             items:
 *               type: array
 *               items:
 *                 type: object
 *             shippingAddress:
 *               type: object
 *             paymentMethod:
 *               type: string
 *               example: creditCard
 *     responses:
 *       201:
 *         description: Sipariş başarıyla oluşturuldu
 *       400:
 *         description: Doğrulama hatası
 */
router.post("/", protect, createOrder);

/**
 * @swagger
 * /orders/my-orders:
 *   get:
 *     summary: Giriş yapmış kullanıcının siparişlerini getirir
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Kullanıcı sipariş listesi
 */
router.get("/my-orders", protect, getMyOrders);
router.get("/myorders", protect, getMyOrders);

/**
 * @swagger
 * /orders/admin:
 *   get:
 *     summary: Tüm siparişleri listeler (Yalnızca Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Tüm siparişler
 */
router.get("/admin", protect, getAllOrders);
router.get("/all", protect, getAllOrders);

/**
 * @swagger
 * /orders/{id}/status:
 *   put:
 *     summary: Sipariş durumunu günceller (Admin)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 example: Kargoya Verildi
 *     responses:
 *       200:
 *         description: Durum güncellendi
 */
router.put("/:id/status", protect, updateOrderStatus);

/**
 * @swagger
 * /orders/{id}/cancel:
 *   put:
 *     summary: Siparişi iptal eder (Hazırlanıyor aşamasında)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Sipariş iptal edildi
 */
router.put("/:id/cancel", protect, cancelOrder);

/**
 * @swagger
 * /orders/{id}/return:
 *   put:
 *     summary: Sipariş için iade talebi oluşturur (Teslim Edildi aşamasında)
 *     tags: [Orders]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               reason:
 *                 type: string
 *     responses:
 *       200:
 *         description: İade talebi oluşturuldu
 */
router.put("/:id/return", protect, returnOrder);

router.get("/:id", protect, async (req, res) => {
  try {
    const Order = require("../models/Order");
    const order = await Order.findById(req.params.id)
      .populate("subOrders.seller", "storeName rating logo")
      .populate("user", "name email");
    if (!order) return res.status(404).json({ success: false, message: "Sipariş bulunamadı" });
    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
