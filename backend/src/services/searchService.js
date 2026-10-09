const MEILI_HOST = process.env.MEILISEARCH_HOST || "http://meilisearch:7700";
const MEILI_KEY = process.env.MEILISEARCH_KEY || "shoplane_meili_secret_2026";

const headers = {
  "Content-Type": "application/json",
  "Authorization": "Bearer " + MEILI_KEY
};

const syncProductsToMeili = async (products) => {
  try {
    const formatted = products.map(p => ({
      id: p._id.toString(),
      name: p.name,
      description: p.description,
      price: p.price,
      category: p.category,
      brand: p.brand,
      rating: p.rating,
      image: (p.images && p.images[0]) || ""
    }));

    // Indeks ayarlari (Filtreleme ve Arama Alanlari)
    await fetch(MEILI_HOST + "/indexes/products/settings", {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        filterableAttributes: ["category", "brand", "price"],
        searchableAttributes: ["name", "brand", "description", "category"]
      })
    });

    // Urunleri Meilisearch e aktar
    const res = await fetch(MEILI_HOST + "/indexes/products/documents", {
      method: "POST",
      headers,
      body: JSON.stringify(formatted)
    });
    const data = await res.json();
    console.log(" Meilisearch senkronizasyon baslatildi, Task UID:", data.taskUid);
    return data;
  } catch (err) {
    console.error(" Meilisearch sync hatasi:", err.message);
  }
};

const searchProducts = async (query, filters = {}) => {
  const res = await fetch(MEILI_HOST + "/indexes/products/search", {
    method: "POST",
    headers,
    body: JSON.stringify({
      q: query,
      limit: 20,
      ...filters
    })
  });
  return await res.json();
};

module.exports = { syncProductsToMeili, searchProducts };
