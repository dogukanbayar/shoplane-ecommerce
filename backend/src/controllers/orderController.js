const orderService = require("../services/orderService");
const ApiResponse = require("../utils/ApiResponse");
const logger = require("../utils/logger");

exports.createOrder = async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod } = req.body;
    const userId = req.user ? req.user._id : req.body.userId;

    let finalUserId = userId;
    if (!finalUserId) {
      const User = require("../models/User");
      const firstUser = await User.findOne();
      finalUserId = firstUser ? firstUser._id : null;
    }
    if (!finalUserId) {
      return ApiResponse.badRequest(res, "Sipariş için kullanıcı bulunamadı.");
    }

    const order = await orderService.createMarketplaceOrder(
      finalUserId,
      items,
      shippingAddress,
      paymentMethod
    );

    logger.info(`Yeni sipariş oluşturuldu: ${order._id} - Kullanıcı: ${finalUserId}`);
    return ApiResponse.created(res, { order }, "Sipariş başarıyla oluşturuldu.");
  } catch (err) {
    logger.error(`Sipariş oluşturma hatası: ${err.message}`, { stack: err.stack });
    return ApiResponse.badRequest(res, err.message);
  }
};

exports.getMyOrders = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id || req.query.userId;
    if (!userId) {
      return ApiResponse.unauthorized(res, "Kullanıcı oturumu bulunamadı");
    }
    const orders = await orderService.getMyOrders(userId);
    return ApiResponse.success(res, { count: (orders || []).length, orders: orders || [] });
  } catch (err) {
    logger.error(`getMyOrders hatası: ${err.message}`);
    return ApiResponse.error(res, err.message);
  }
};

exports.getAllOrders = async (req, res) => {
  try {
    const orders = await orderService.getAllOrders();
    return ApiResponse.success(res, { count: orders.length, orders });
  } catch (err) {
    logger.error(`getAllOrders hatası: ${err.message}`);
    return ApiResponse.error(res, err.message);
  }
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await orderService.updateOrderStatus(req.params.id, status);

    logger.info(`Sipariş durumu güncellendi: ${order._id} -> ${order.status}`);

    // Socket.IO Canlı Bildirimi
    try {
      const io = req.app.get("io") || global.io;
      if (io) {
        io.emit("orderStatusUpdated", {
          orderId: order._id,
          orderNumber: order.orderNumber,
          userId: order.user?._id || order.user,
          status: order.status,
          message: `Siparişinizin durumu güncellendi: ${order.status}`
        });
      }
    } catch (socketErr) {
      logger.error(`Socket yayını hatası: ${socketErr.message}`);
    }

    return ApiResponse.success(res, { order }, "Sipariş durumu güncellendi");
  } catch (err) {
    logger.error(`updateOrderStatus hatası: ${err.message}`);
    return ApiResponse.badRequest(res, err.message);
  }
};

exports.cancelOrder = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { reason } = req.body;
    const order = await orderService.cancelOrder(userId, req.params.id, reason);

    logger.info(`Sipariş iptal edildi: ${order._id} - Neden: ${reason}`);
    return ApiResponse.success(res, { order }, "Siparişiniz başarıyla iptal edildi.");
  } catch (err) {
    logger.error(`cancelOrder hatası: ${err.message}`);
    return ApiResponse.badRequest(res, err.message);
  }
};

exports.returnOrder = async (req, res) => {
  try {
    const userId = req.user?._id || req.user?.id;
    const { reason } = req.body;
    const order = await orderService.returnOrder(userId, req.params.id, reason);

    logger.info(`İade talebi oluşturuldu: ${order._id} - Neden: ${reason}`);
    return ApiResponse.success(res, { order }, "İade talebiniz başarıyla alındı.");
  } catch (err) {
    logger.error(`returnOrder hatası: ${err.message}`);
    return ApiResponse.badRequest(res, err.message);
  }
};
