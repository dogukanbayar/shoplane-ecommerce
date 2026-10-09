const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("../models/User");
const Product = require("../models/Product");

dotenv.config();

const categoryMapping = {
  smartphones: "Elektronik",
  laptops: "Elektronik",
  tablets: "Elektronik",
  "mobile-accessories": "Aksesuar",
  "mens-watches": "Aksesuar",
  "womens-watches": "Aksesuar",
  "womens-bags": "Aksesuar",
  "womens-jewellery": "Aksesuar",
  sunglasses: "Aksesuar",
  "mens-shoes": "Ayakkabı",
  "womens-shoes": "Ayakkabı",
  "mens-shirts": "Giyim",
  "womens-dresses": "Giyim",
  tops: "Giyim",
  "home-decoration": "Ev & Yaşam",
  furniture: "Ev & Yaşam",
  "kitchen-accessories": "Ev & Yaşam",
  groceries: "Ev & Yaşam",
  "sports-accessories": "Spor & Outdoor",
  beauty: "Kozmetik",
  "skin-care": "Kozmetik",
  fragrances: "Kozmetik"
};

const mapCategory = (raw) => categoryMapping[raw] || "Ev & Yaşam";

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB Bağlandı");

    await User.deleteMany();
    await Product.deleteMany();
    console.log("Eski veriler temizlendi");

    await User.create([
      { name: "Admin User", email: "admin@example.com", password: "123456", role: "admin", phone: "5551234567" },
      { name: "Test User", email: "test@example.com", password: "123456", role: "user", phone: "5559876543" }
    ]);

    console.log("DummyJSON ürünleri indiriliyor...");
    const res = await fetch("https://dummyjson.com/products?limit=150");
    const data = await res.json();

    const items = data.products.map(p => {
      const priceTRY = Math.round(p.price * 34);
      const discount = p.discountPercentage || 0;
      const oldPriceTRY = discount > 0 ? Math.round(priceTRY * (1 + discount / 100)) : null;
      return {
        name: p.title,
        description: p.description,
        price: priceTRY,
        oldPrice: oldPriceTRY,
        images: p.images && p.images.length > 0 ? p.images : [p.thumbnail],
        category: mapCategory(p.category),
        brand: p.brand || "ShopLane",
        stock: p.stock || 30,
        colors: ["Siyah", "Beyaz"],
        sizes: ["S", "M", "L"],
        rating: Math.min(5, Math.max(1, p.rating || 4.2)),
        numReviews: (p.reviews && p.reviews.length) || 15,
        isActive: true,
        isFeatured: p.rating > 4.5,
        isPreOrder: false
      };
    });

    await Product.insertMany(items);
    console.log("TAMAMLANDI: " + items.length + " ürün kaydedildi.");
    process.exit(0);
  } catch (err) {
    console.error("Hata:", err);
    process.exit(1);
  }
};

seed();
