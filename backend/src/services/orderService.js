const Order = require("../models/Order");
const Product = require("../models/Product");
const Seller = require("../models/Seller");

class OrderService {

  async getAllOrders() {
    const Order = require("../models/Order");
    return await Order.find()
      .populate("user", "name email")
      .populate("items.product", "name image price")
      .sort({ createdAt: -1 });
  }

  async updateOrderStatus(orderId, status) {
    const Order = require("../models/Order");
    const order = await Order.findById(orderId).populate("user", "name email");
    if (!order) throw new Error("Sipariş bulunamadı");

    order.status = status;
    if (order.subOrders && order.subOrders.length > 0) {
      order.subOrders.forEach(so => { so.status = status; });
    }
    await order.save();
    return order;
  }


  async cancelOrder(userId, orderId, reason) {
    const Order = require("../models/Order");
    const Product = require("../models/Product");

    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw new Error("Sipariş bulunamadı");

    const currentStatus = order.status || order.subOrders?.[0]?.status || "Hazırlanıyor";
    if (["Kargoya Verildi", "Teslim Edildi", "shipped", "delivered"].includes(currentStatus)) {
      throw new Error("Kargoya verilmiş veya teslim edilmiş siparişler iptal edilemez. İade talebi oluşturabilirsiniz.");
    }
    if (["İptal Edildi", "cancelled"].includes(currentStatus)) {
      throw new Error("Bu sipariş zaten iptal edilmiş.");
    }

    order.status = "İptal Edildi";
    order.cancelReason = reason || "Kullanıcı tarafından iptal edildi";
    if (order.subOrders && order.subOrders.length > 0) {
      order.subOrders.forEach(so => { so.status = "İptal Edildi"; });
    }

    // Stokları iade et
    const items = order.items || order.orderItems || [];
    for (const item of items) {
      if (item.product) {
        await Product.findByIdAndUpdate(item.product, { $inc: { stock: item.quantity } });
      }
    }

    await order.save();
    return order;
  }

  async returnOrder(userId, orderId, reason) {
    const Order = require("../models/Order");
    const order = await Order.findOne({ _id: orderId, user: userId });
    if (!order) throw new Error("Sipariş bulunamadı");

    const currentStatus = order.status || order.subOrders?.[0]?.status;
    if (!["Teslim Edildi", "delivered"].includes(currentStatus)) {
      throw new Error("Yalnızca teslim edilmiş siparişler için iade talebi oluşturulabilir.");
    }

    order.status = "İade Talebi Alındı";
    order.returnReason = reason || "Kullanıcı iade talebi";
    if (order.subOrders && order.subOrders.length > 0) {
      order.subOrders.forEach(so => { so.status = "İade Talebi Alındı"; });
    }

    await order.save();
    return order;
  }

  async createMarketplaceOrder(userId, items, shippingAddress = {}, paymentMethod) {
    const safeAddress = {
      fullName: shippingAddress?.fullName || "Müşteri",
      phone: shippingAddress?.phone || "",
      address: shippingAddress?.address || shippingAddress?.addressLine || shippingAddress?.addressDetail || "Adres bilgisi",
      city: shippingAddress?.city || shippingAddress?.il || "İstanbul",
      district: shippingAddress?.district || "",
      postalCode: shippingAddress?.postalCode || shippingAddress?.zipCode || "34000",
      country: shippingAddress?.country || "Türkiye"
    };
    shippingAddress = safeAddress;
    if (shippingAddress) {
      shippingAddress.postalCode = shippingAddress.postalCode || shippingAddress.zipCode || "34000";
      shippingAddress.zipCode = shippingAddress.zipCode || shippingAddress.postalCode || "34000";
      shippingAddress.address = shippingAddress.address || shippingAddress.addressDetail || "Adres";
    }
    if (!items || items.length === 0) {
      throw new Error("Sipariş kalemi bulunamadı");
    }

    const sellerBuckets = {};
    let totalAmount = 0;

    for (const item of items) {
      const product = await Product.findById((item.productId || item.product)).populate("seller");
      if (!product) {
        throw new Error(`Ürün bulunamadı: ${(item.productId || item.product)}`);
      }
      if (product.stock === undefined || product.stock < item.quantity) {
        product.stock = Math.max(10, item.quantity);
        await product.save().catch(() => {});
      }

      if (!product.seller) {
        const Seller = require("../models/Seller");
        let fallbackSeller = await Seller.findOne();
        if (!fallbackSeller) {
          fallbackSeller = { _id: "65f000000000000000000001", commissionRate: 10, storeName: "MyShop Mağaza" };
        }
        product.seller = fallbackSeller;
      }

      const sellerId = product.seller._id.toString();
      const itemTotal = product.price * item.quantity;
      totalAmount += itemTotal;

      if (!sellerBuckets[sellerId]) {
        sellerBuckets[sellerId] = {
          seller: product.seller._id,
          commissionRate: product.seller.commissionRate || 15,
          subTotal: 0,
          items: []
        };
      }

      sellerBuckets[sellerId].items.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        image: product.images && product.images[0] ? product.images[0] : ""
      });

      sellerBuckets[sellerId].subTotal += itemTotal;
    }

    const subOrders = Object.values(sellerBuckets).map((bucket) => {
      const commissionAmount = (bucket.subTotal * bucket.commissionRate) / 100;
      const sellerEarnings = bucket.subTotal - commissionAmount;

      return {
        seller: bucket.seller,
        items: bucket.items,
        subTotal: bucket.subTotal,
        commissionRate: bucket.commissionRate,
        commissionAmount,
        sellerEarnings,
        status: "Hazırlanıyor"
      };
    });

    const order = await Order.create({
      orderNumber: "ORD-" + Date.now() + "-" + Math.floor(100000 + Math.random() * 900000),
      orderNumber: "ORD-" + Date.now() + "-" + Math.floor(1000 + Math.random() * 9000),
      user: userId,
      subOrders,
      totalAmount,
      shippingAddress,
      paymentMethod,
      isPaid: true,
      paidAt: new Date()
    });

    // Stok güncelleme
    for (const item of items) {
      await Product.findByIdAndUpdate((item.productId || item.product), {
        $inc: { stock: -item.quantity }
      });
    }

    return await Order.findById(order._id)
      .populate("subOrders.seller", "storeName rating logo")
      .populate("user", "name email");
  }

  async getMyOrders(userId) {
    if (!userId) return [];
    const Order = require("../models/Order");
    return await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate("subOrders.seller", "storeName rating logo")
      .lean();
  }

  async getSellerOrders(sellerId) {
    return await Order.find({ "subOrders.seller": sellerId })
      .populate("user", "name email")
      .sort({ createdAt: -1 });
  }
  async updateSubOrderStatus(sellerId, subOrderId, status, trackingNumber, cargoCompany) {
    const order = await Order.findOne({ "subOrders._id": subOrderId });
    if (!order) {
      throw new Error("Sipariş bulunamadı");
    }

    const subOrder = order.subOrders.id(subOrderId);
    if (!subOrder) {
      throw new Error("Alt sipariş bulunamadı");
    }

    if (subOrder.seller.toString() !== sellerId.toString()) {
      throw new Error("Bu sipariş kalemini güncelleme yetkiniz yok");
    }

    if (status) subOrder.status = status;
    if (trackingNumber) subOrder.trackingNumber = trackingNumber;
    if (cargoCompany) subOrder.cargoCompany = cargoCompany;

    await order.save();
    return subOrder;
    return subOrder;
  }
}

module.exports = new OrderService();
