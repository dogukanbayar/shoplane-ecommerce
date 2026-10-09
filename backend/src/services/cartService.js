const cartRepository = require('../repositories/cartRepository')
const Product = require('../models/Product')

class CartService {
  async getCart(userId) {
    let cart = await cartRepository.findByUserId(userId)
    if (!cart) {
      cart = await cartRepository.create(userId, [])
    }

    const calculatedItems = []
    let subtotal = 0

    for (const item of cart.items) {
      if (item.product && item.product.isActive) {
        const itemTotal = item.product.price * item.quantity
        subtotal += itemTotal
        calculatedItems.push({
          product: item.product,
          quantity: item.quantity,
          itemTotal
        })
      }
    }

    return {
      _id: cart._id,
      user: cart.user,
      items: calculatedItems,
      totalItems: calculatedItems.reduce((acc, curr) => acc + curr.quantity, 0),
      subtotal
    }
  }

  async addToCart(userId, productId, quantity = 1) {
    const product = await Product.findById(productId)
    if (!product || !product.isActive) {
      const error = new Error('Ürün bulunamadı veya satışta değil')
      error.statusCode = 404
      throw error
    }

    let cart = await cartRepository.findByUserId(userId)
    if (!cart) {
      cart = await cartRepository.create(userId, [])
    }

    const itemIndex = cart.items.findIndex(
      (item) => item.product?._id?.toString() === productId || item.product?.toString() === productId
    )

    const targetQuantity = itemIndex > -1 ? cart.items[itemIndex].quantity + Number(quantity) : Number(quantity)

    if (product.stock < targetQuantity) {
      const error = new Error(`Yetersiz stok! Mevcut stok: ${product.stock}`)
      error.statusCode = 400
      throw error
    }

    if (itemIndex > -1) {
      cart.items[itemIndex].quantity = targetQuantity
    } else {
      cart.items.push({ product: productId, quantity: Number(quantity) })
    }

    await cartRepository.save(cart)
    return await this.getCart(userId)
  }

  async updateItemQuantity(userId, productId, quantity) {
    const qty = Number(quantity)
    if (qty <= 0) {
      return await this.removeFromCart(userId, productId)
    }

    const product = await Product.findById(productId)
    if (!product) {
      const error = new Error('Ürün bulunamadı')
      error.statusCode = 404
      throw error
    }

    if (product.stock < qty) {
      const error = new Error(`Yetersiz stok! Mevcut stok: ${product.stock}`)
      error.statusCode = 400
      throw error
    }

    const cart = await cartRepository.findByUserId(userId)
    if (!cart) {
      const error = new Error('Sepet bulunamadı')
      error.statusCode = 404
      throw error
    }

    const item = cart.items.find(
      (i) => i.product?._id?.toString() === productId || i.product?.toString() === productId
    )

    if (!item) {
      const error = new Error('Ürün sepette bulunamadı')
      error.statusCode = 404
      throw error
    }

    item.quantity = qty
    await cartRepository.save(cart)
    return await this.getCart(userId)
  }

  async removeFromCart(userId, productId) {
    const cart = await cartRepository.findByUserId(userId)
    if (!cart) {
      const error = new Error('Sepet bulunamadı')
      error.statusCode = 404
      throw error
    }

    cart.items = cart.items.filter(
      (item) => (item.product?._id?.toString() || item.product?.toString()) !== productId
    )

    await cartRepository.save(cart)
    return await this.getCart(userId)
  }

  async clearCart(userId) {
    await cartRepository.clearCart(userId)
    return { items: [], totalItems: 0, subtotal: 0 }
  }
}

module.exports = new CartService()
