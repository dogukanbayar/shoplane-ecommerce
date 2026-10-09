const Cart = require('../models/Cart')

class CartRepository {
  async findByUserId(userId) {
    return await Cart.findOne({ user: userId }).populate('items.product', 'name price images stock isActive')
  }

  async create(userId, items = []) {
    return await Cart.create({ user: userId, items })
  }

  async save(cart) {
    return await cart.save()
  }

  async clearCart(userId) {
    return await Cart.findOneAndUpdate(
      { user: userId },
      { $set: { items: [] } },
      { new: true }
    )
  }
}

module.exports = new CartRepository()
