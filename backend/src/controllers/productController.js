const productService = require('../services/productService')

// @desc    Tüm ürünleri getir
// @route   GET /api/products
// @access  Public
exports.getProducts = async (req, res, next) => {
  try {
    const result = await productService.getProducts(req.query)
    res.status(200).json({
      success: true,
      ...result
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Tek ürün getir
// @route   GET /api/products/:id
// @access  Public
exports.getProduct = async (req, res, next) => {
  try {
    const product = await productService.getProductById(req.params.id)
    res.status(200).json({
      success: true,
      product
    })
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: error.message })
    }
    next(error)
  }
}

// @desc    Öne çıkan ürünleri getir
// @route   GET /api/products/featured
// @access  Public
exports.getFeaturedProducts = async (req, res, next) => {
  try {
    const products = await productService.getFeaturedProducts(req.query.limit || 6)
    res.status(200).json({
      success: true,
      count: products.length,
      products
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Ürün oluştur (Admin)
// @route   POST /api/products
// @access  Private/Admin
exports.createProduct = async (req, res, next) => {
  try {
    const product = await productService.createProduct(req.body)
    res.status(201).json({
      success: true,
      product
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Ürün güncelle (Admin)
// @route   PUT /api/products/:id
// @access  Private/Admin
exports.updateProduct = async (req, res, next) => {
  try {
    const product = await productService.updateProduct(req.params.id, req.body)
    res.status(200).json({
      success: true,
      product
    })
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: error.message })
    }
    next(error)
  }
}

// @desc    Ürün sil (Admin)
// @route   DELETE /api/products/:id
// @access  Private/Admin
exports.deleteProduct = async (req, res, next) => {
  try {
    await productService.deleteProduct(req.params.id)
    res.status(200).json({
      success: true,
      message: 'Ürün silindi'
    })
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: error.message })
    }
    next(error)
  }
}

// @desc    Kategorileri getir
// @route   GET /api/products/categories
// @access  Public
exports.getCategories = async (req, res, next) => {
  try {
    const categories = await productService.getCategories()
    res.status(200).json({
      success: true,
      categories
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Markaları getir
// @route   GET /api/products/brands
// @access  Public
exports.getBrands = async (req, res, next) => {
  try {
    const brands = await productService.getBrands()
    res.status(200).json({
      success: true,
      brands
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Sık satılan ürünleri getir
// @route   GET /api/products/:id/frequently-bought-together
// @access  Public
exports.getFrequentlyBoughtTogether = async (req, res, next) => {
  try {
    const products = await productService.getFrequentlyBoughtTogether(
      req.params.id,
      req.query.limit
    )
    res.status(200).json({
      success: true,
      count: products.length,
      products
    })
  } catch (error) {
    if (error.statusCode === 404) {
      return res.status(404).json({ success: false, message: error.message })
    }
    next(error)
  }
}
