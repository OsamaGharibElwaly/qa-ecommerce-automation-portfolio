const express = require("express");
const { readJson } = require("../utils/fileDb");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const { q, category, minPrice, maxPrice } = req.query;
    if ((minPrice && Number.isNaN(Number(minPrice))) || (maxPrice && Number.isNaN(Number(maxPrice)))) {
      return res.status(400).json({
        message: "minPrice and maxPrice must be numeric values.",
        code: "VALIDATION_INVALID_QUERY"
      });
    }

    const products = await readJson("products.json", []);
    const filtered = products.filter((product) => {
      const searchMatch = q
        ? product.name.toLowerCase().includes(String(q).toLowerCase()) ||
          product.description.toLowerCase().includes(String(q).toLowerCase())
        : true;
      const categoryMatch = category
        ? product.category.toLowerCase() === String(category).toLowerCase()
        : true;
      const minPriceMatch = minPrice ? Number(product.price) >= Number(minPrice) : true;
      const maxPriceMatch = maxPrice ? Number(product.price) <= Number(maxPrice) : true;
      return searchMatch && categoryMatch && minPriceMatch && maxPriceMatch;
    });

    return res.status(200).json({ products: filtered, total: filtered.length });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch products.", code: "PRODUCT_LIST_ERROR" });
  }
});

router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (Number.isNaN(id)) {
    return res.status(400).json({ message: "Invalid product id." });
  }

  const products = await readJson("products.json", []);
  const product = products.find((item) => item.id === id);
  if (!product) {
    return res.status(404).json({ message: "Product not found." });
  }

  return res.status(200).json({ product });
});

module.exports = router;
