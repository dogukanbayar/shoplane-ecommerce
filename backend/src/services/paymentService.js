const iyzipay = require("../config/iyzico");

class PaymentService {
  /**
   * Çok satıcılı pazaryeri ödemesi başlatır
   */
  async initializeMarketplacePayment({ order, user, clientIp }) {
    return new Promise((resolve, reject) => {
      // Sepetteki tüm ürünleri İyzico basketItems formatına çevir
      const basketItems = [];

      order.subOrders.forEach((subOrder) => {
        subOrder.items.forEach((item) => {
          // Satıcı bazlı komisyon düşülmüş tutar (subMerchantPrice)
          const itemPrice = item.price * item.quantity;
          const commission = (itemPrice * subOrder.commissionRate) / 100;
          const subMerchantPayout = itemPrice - commission;

          basketItems.push({
            id: item.product.toString(),
            name: item.name.substring(0, 50),
            category1: "Genel",
            itemType: Iyzipay.BASKET_ITEM_TYPE.PHYSICAL,
            price: itemPrice.toFixed(2),
            subMerchantKey: subOrder.seller.subMerchantKey || "dummy_sub_merchant_key",
            subMerchantPrice: subMerchantPayout.toFixed(2)
          });
        });
      });

      const request = {
        locale: Iyzipay.LOCALE.TR,
        conversationId: order._id.toString(),
        price: order.totalAmount.toFixed(2),
        paidPrice: order.totalAmount.toFixed(2),
        currency: Iyzipay.CURRENCY.TRY,
        basketId: order._id.toString(),
        paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
        callbackUrl: `${process.env.APP_URL || "http://localhost:5001"}/api/payments/callback`,
        enabledInstallments: [1, 2, 3, 6, 9],
        buyer: {
          id: user._id.toString(),
          name: user.name.split(" ")[0] || "Müşteri",
          surname: user.name.split(" ")[1] || "Kullanıcı",
          gsmNumber: user.phone || "+905350000000",
          email: user.email,
          identityNumber: "11111111111",
          registrationAddress: order.shippingAddress.address || "Test Mah. No:1",
          ip: clientIp || "127.0.0.1",
          city: order.shippingAddress.city || "Istanbul",
          country: "Turkey"
        },
        shippingAddress: {
          contactName: user.name,
          city: order.shippingAddress.city || "Istanbul",
          country: "Turkey",
          address: order.shippingAddress.address || "Test Mah. No:1"
        },
        billingAddress: {
          contactName: user.name,
          city: order.shippingAddress.city || "Istanbul",
          country: "Turkey",
          address: order.shippingAddress.address || "Test Mah. No:1"
        },
        basketItems
      };

      iyzipay.checkoutFormInitialize.create(request, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });
  }
}

module.exports = new PaymentService();
