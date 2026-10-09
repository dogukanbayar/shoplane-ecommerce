const productRepository = require('../repositories/productRepository')

class ProductService {
  async getProducts(queryParams) {
    const {
      keyword,
      category,
      brand,
      minPrice,
      maxPrice,
      color,
      size,
      rating,
      sort,
      page = 1,
      limit = 12
    } = queryParams

    const parsedPage = Number(page) || 1
    const parsedLimit = Number(limit) || 12

    const query = { isActive: true }

    if (keyword) {
      query.$text = { $search: keyword }
    }
    if (category) {
      query.category = category
    }
    if (brand) {
      query.brand = brand
    }
    if (minPrice || maxPrice) {
      query.price = {}
      if (minPrice) query.price.$gte = Number(minPrice)
      if (maxPrice) query.price.$lte = Number(maxPrice)
    }
    if (color) {
      query.colors = { $in: [color] }
    }
    if (size) {
      query.sizes = { $in: [size] }
    }
    if (rating) {
      query.rating = { $gte: Number(rating) }
    }

    let sortOptions = { createdAt: -1 }
    if (sort === 'price-asc') sortOptions = { price: 1 }
    else if (sort === 'price-desc') sortOptions = { price: -1 }
    else if (sort === 'rating') sortOptions = { rating: -1 }
    else if (sort === 'newest') sortOptions = { createdAt: -1 }

    const skip = (parsedPage - 1) * parsedLimit

    const [total, products] = await Promise.all([
      productRepository.count(query),
      productRepository.findAll({ query, sortOptions, skip, limit: parsedLimit })
    ])

    return {
      products,
      total,
      count: products.length,
      pages: Math.ceil(total / parsedLimit),
      currentPage: parsedPage
    }
  }

  async getProductById(id) {
    const product = await productRepository.findById(id)
    if (!product) {
      const error = new Error('Ürün bulunamadı')
      error.statusCode = 404
      throw error
    }
    return product
  }

  async getFeaturedProducts(limit = 6) {
    return await productRepository.findFeatured(Number(limit))
  }

  async createProduct(data) {
    return await productRepository.create(data)
  }

  async updateProduct(id, data) {
    const product = await productRepository.update(id, data)
    if (!product) {
      const error = new Error('Ürün bulunamadı')
      error.statusCode = 404
      throw error
    }
    return product
  }

  async deleteProduct(id) {
    const product = await productRepository.deleteById(id)
    if (!product) {
      const error = new Error('Ürün bulunamadı')
      error.statusCode = 404
      throw error
    }
    return true
  }

  async getCategories() {
    return await productRepository.getDistinctCategories()
  }

  async getBrands() {
    return await productRepository.getDistinctBrands()
  }

  async getFrequentlyBoughtTogether(id, limit = 4) {
    const currentProduct = await productRepository.findById(id)
    if (!currentProduct) {
      const error = new Error('Product not found')
      error.statusCode = 404
      throw error
    }

    return await productRepository.findFrequentlyBoughtTogether(
      id,
      currentProduct.category,
      currentProduct.brand,
      Number(limit)
    )
  }
}

module.exports = new ProductService()
