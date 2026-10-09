const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User = require("../models/User");
const Seller = require("../models/Seller");
const Product = require("../models/Product");

const seedSellers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB Bağlandı");

    await Seller.deleteMany();

    // 3 Farklı Satıcı Kullanıcısı ve Mağazası Oluştur
    const storeDefs = [
      { name: "Tekno Trend", email: "tekno@shoplane.com", tax: "1234567890", commission: 10 },
      { name: "Moda Butik", email: "moda@shoplane.com", tax: "2345678901", commission: 15 },
      { name: "Ev & Konfor", email: "ev@shoplane.com", tax: "3456789012", commission: 12 }
    ];

    const createdSellers = [];

    for (const s of storeDefs) {
      let user = await User.findOne({ email: s.email });
      if (!user) {
        user = await User.create({
          name: s.name + " Yetkilisi",
          email: s.email,
          password: "password123",
          role: "seller",
          phone: "555000000" + createdSellers.length
        });
      }

      const seller = await Seller.create({
        user: user._id,
        storeName: s.name,
        taxNumber: s.tax,
        commissionRate: s.commission,
        isApproved: true,
        rating: 4.8
      });

      createdSellers.push(seller);
    }

    console.log(`🏪 ${createdSellers.length} adet onaylı satıcı mağazası oluşturuldu.`);

    // Mevcut 150 ürünü bu satıcılara eşit olarak ata
    const products = await Product.find();
    for (let i = 0; i < products.length; i++) {
      const assignedSeller = createdSellers[i % createdSellers.length];
      products[i].seller = assignedSeller._id;
      await products[i].save();
    }

    console.log(`📦 ${products.length} ürün satıcılara paylaştırıldı.`);
    process.exit(0);
  } catch (err) {
    console.error("❌ Hata:", err);
    process.exit(1);
  }
};

seedSellers();
