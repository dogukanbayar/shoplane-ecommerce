const express = require('express')
const router = express.Router()

const { searchProducts } = require("../services/searchService");

// Trendyol tarzı anlık hızlı arama endpointi (Meilisearch)
router.get("/search", async (req, res) => {
  try {
    const { q = "", category, brand, minPrice, maxPrice } = req.query;
    if (!q || !q.trim()) {
      return res.json({ success: true, hits: [], totalHits: 0 });
    }

    const filterConditions = [];
    if (category) filterConditions.push(`category = "${category}"`);
    if (brand) filterConditions.push(`brand = "${brand}"`);
    if (minPrice) filterConditions.push(`price >= ${minPrice}`);
    if (maxPrice) filterConditions.push(`price <= ${maxPrice}`);

    const searchParams = {
      limit: 20
    };

    if (filterConditions.length > 0) {
      searchParams.filter = filterConditions.join(" AND ");
    }

    const results = await searchProducts(q.trim(), searchParams);
    res.json({
      success: true,
      query: q,
      hits: results.hits || [],
      totalHits: results.estimatedTotalHits || (results.hits ? results.hits.length : 0),
      processingTimeMs: results.processingTimeMs || 0
    });
  } catch (error) {
    console.error("Arama hatası:", error);
    res.status(500).json({ success: false, message: "Arama sırasında bir hata oluştu" });
  }
});

const {
  getProducts,
  getProduct,
  getFeaturedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories,
  getBrands,
  getFrequentlyBoughtTogether
} = require('../controllers/productController')
const { protect, admin } = require('../middleware/auth')
const { cache } = require("../middleware/cache");

// Public routes
router.get('/', cache(60), getProducts)
router.get('/featured', cache(120), getFeaturedProducts)
router.get('/categories', cache(300), getCategories)
router.get('/brands', getBrands)

// More specific routes before less specific routes
router.get('/:id/frequently-bought-together', getFrequentlyBoughtTogether)
router.get('/:id', getProduct)

// Admin routes
router.post('/', protect, admin, createProduct)
router.put('/:id', protect, admin, updateProduct)
router.delete('/:id', protect, admin, deleteProduct)

module.exports = router