const cartService = require('../services/cartService')

exports.getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.id)
    res.status(200).json({ success: true, cart })
  } catch (error) {
    next(error)
  }
}

exports.addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body
    const cart = await cartService.addToCart(req.user.id, productId, quantity)
    res.status(200).json({ success: true, cart })
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message })
    }
    next(error)
  }
}

exports.updateCartItem = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body
    const cart = await cartService.updateItemQuantity(req.user.id, productId, quantity)
    res.status(200).json({ success: true, cart })
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message })
    }
    next(error)
  }
}

exports.removeFromCart = async (req, res, next) => {
  try {
    const { productId } = req.params
    const cart = await cartService.removeFromCart(req.user.id, productId)
    res.status(200).json({ success: true, cart })
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({ success: false, message: error.message })
    }
    next(error)
  }
}

exports.clearCart = async (req, res, next) => {
  try {
    const cart = await cartService.clearCart(req.user.id)
    res.status(200).json({ success: true, cart })
  } catch (error) {
    next(error)
  }
}
