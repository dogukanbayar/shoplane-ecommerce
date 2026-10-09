const redis = require("../config/redis");

const cache = (durationInSeconds = 60) => {
  return async (req, res, next) => {
    // Sadece GET isteklerini önbelleğe al
    if (req.method !== "GET") return next();

    const key = "__cache__" + (req.originalUrl || req.url);

    try {
      const cachedResponse = await redis.get(key);
      if (cachedResponse) {
        res.setHeader("X-Cache", "HIT");
        return res.json(JSON.parse(cachedResponse));
      }

      // Orijinal res.json fonksiyonunu yakala
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        res.setHeader("X-Cache", "MISS");
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redis.set(key, JSON.stringify(body), "EX", durationInSeconds).catch(err => {
            console.error("Redis set hatasi:", err.message);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error("Cache middleware hatasi:", err.message);
      next();
    }
  };
};

const clearCache = async (pattern = "__cache__*") => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(keys);
      console.log(`🧹 ${keys.length} adet önbellek anahtarı temizlendi`);
    }
  } catch (err) {
    console.error("Cache temizleme hatasi:", err.message);
  }
};

module.exports = { cache, clearCache };
