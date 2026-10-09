const paymentService = require("../services/paymentService");
const Order = require("../models/Order");

// @desc    İyzico Checkout Form Başlat
// @route   POST /api/payments/initialize/:orderId
exports.initializePayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId)
      .populate("subOrders.seller")
      .populate("user");

    if (!order) {
      return res.status(404).json({ success: false, message: "Sipariş bulunamadı" });
    }

    if (order.isPaid) {
      return res.status(400).json({ success: false, message: "Sipariş zaten ödenmiş" });
    }

    const clientIp = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "127.0.0.1";
    const paymentResult = await paymentService.initializeMarketplacePayment({
      order,
      user: order.user,
      clientIp
    });

    res.json({
      success: true,
      checkoutFormContent: paymentResult.checkoutFormContent,
      paymentPageUrl: paymentResult.paymentPageUrl,
      token: paymentResult.token
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    İyzico Callback
// @route   POST /api/payments/callback
exports.paymentCallback = async (req, res) => {
  try {
    const { token } = req.body;
    // Callback geldiğinde sipariş durumunu güncelle
    const order = await Order.findOne({ "paymentResult.id": token });
    if (order) {
      order.isPaid = true;
      order.paidAt = new Date();
      await order.save();
    }

    // Frontend sipariş başarı sayfasına yönlendir
    res.redirect(`${process.env.CLIENT_URL || "http://localhost:5173"}/checkout/success?token=${token}`);
  } catch (err) {
    res.status(500).send("Ödeme doğrulama hatası: " + err.message);
  }
};

// @desc    Geliştirme / Test Amaçlı Mock Ödeme Onayı
// @route   POST /api/payments/mock-pay/:orderId
exports.mockPaymentSuccess = async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findById(orderId);

    if (!order) {
      return res.status(404).json({ success: false, message: "Sipariş bulunamadı" });
    }

    order.isPaid = true;
    order.paidAt = new Date();
    order.paymentResult = {
      id: "MOCK_PAY_" + Date.now(),
      status: "SUCCESS",
      updateTime: new Date().toISOString()
    };

    await order.save();

    res.json({
      success: true,
      message: "Ödeme başarıyla simüle edildi ve sipariş onaylandı!",
      order
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
