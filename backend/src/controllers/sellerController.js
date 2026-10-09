const Order = require("../models/Order");
const Seller = require("../models/Seller");

// @desc    Satıcının kendi alt siparişlerini getir
// @route   GET /api/sellers/:sellerId/orders
exports.getSellerOrders = async (req, res) => {
  try {
    const { sellerId } = req.params;

    const orders = await Order.find({ "subOrders.seller": sellerId })
      .populate("user", "name email")
      .populate("subOrders.items.product", "name images")
      .sort({ createdAt: -1 });

    // Yalnızca bu satıcıya ait alt sipariş kalemlerini ayıkla
    const sellerOrders = orders.map((order) => {
      const mySubOrder = order.subOrders.find(
        (sub) => sub.seller.toString() === sellerId.toString()
      );

      return {
        orderId: order._id,
        createdAt: order.createdAt,
        customer: order.user,
        shippingAddress: order.shippingAddress,
        subOrder: mySubOrder
      };
    });

    res.json({ success: true, count: sellerOrders.length, orders: sellerOrders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// @desc    Satıcı alt sipariş kargo durumunu güncelle
// @route   PUT /api/sellers/:sellerId/orders/:orderId/status
exports.updateSubOrderStatus = async (req, res) => {
  try {
    const { sellerId, orderId } = req.params;
    const { status, trackingNumber, cargoCompany } = req.body;

    const validStatuses = ["Hazırlanıyor", "Kargoya Verildi", "Teslim Edildi", "İptal Edildi"];
    if (status && !validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: "Geçersiz sipariş durumu" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Sipariş bulunamadı" });
    }

    const subOrder = order.subOrders.find(
      (sub) => sub.seller.toString() === sellerId.toString()
    );

    if (!subOrder) {
      return res.status(403).json({ success: false, message: "Bu siparişte size ait alt sipariş yok" });
    }

    if (status) subOrder.status = status;
    if (trackingNumber) subOrder.trackingNumber = trackingNumber;
    if (cargoCompany) subOrder.cargoCompany = cargoCompany;

    await order.save();

    res.json({
      success: true,
      message: "Alt sipariş durumu güncellendi",
      subOrder
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
