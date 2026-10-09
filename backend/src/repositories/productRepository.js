const Product = require('../models/Product');
require('../models/Seller'); // Mongoose model kaydını garantiye al

class ProductRepository {
  async findAll({ query, sortOptions, skip, limit }) {
    return await Product.find(query)
      .populate('seller', 'storeName rating logo commissionRate')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit);
  }

  async count(query) {
    return await Product.countDocuments(query);
  }

  async findById(id) {
    return await Product.findById(id)
      .populate('seller', 'storeName rating logo commissionRate');
  }

  async findFeatured(limit = 6) {
    return await Product.find({ isFeatured: true, isActive: true })
      .populate('seller', 'storeName rating logo commissionRate')
      .limit(limit)
      .sort({ createdAt: -1 });
  }

  async create(productData) {
    return await Product.create(productData);
  }

  async update(id, updateData) {
    return await Product.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true
    }).populate('seller', 'storeName rating logo commissionRate');
  }

  async deleteById(id) {
    const product = await Product.findById(id);
    if (!product) return null;
    await product.deleteOne();
    return product;
  }

  async getDistinctCategories() {
    return await Product.distinct('category');
  }

  async getDistinctBrands() {
    return await Product.distinct('brand');
  }

  async findFrequentlyBoughtTogether(currentProductId, category, brand, limit = 4) {
    return await Product.find({
      _id: { $ne: currentProductId },
      $or: [{ category }, { brand }],
      isActive: true
    })
      .populate('seller', 'storeName rating logo commissionRate')
      .limit(limit)
      .lean();
  }
}

module.exports = new ProductRepository();
