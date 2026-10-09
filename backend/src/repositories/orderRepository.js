const Order = require('../models/Order')

class OrderRepository {
  async create(orderData) {
    return await Order.create(orderData)
  }

  async findByUserId(userId) {
    return await Order.find({ user: userId })
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
  }

  async findById(orderId) {
    return await Order.findById(orderId)
      .populate('user', 'name email')
      .populate('items.product', 'name images price')
  }

  async findAll() {
    return await Order.find()
      .populate('user', 'name email')
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
  }

  async save(order) {
    return await order.save()
  }
}

module.exports = new OrderRepository()
