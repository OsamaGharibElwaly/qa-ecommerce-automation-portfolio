const express = require("express");
const authMiddleware = require("../middleware/auth");
const { readJson, writeJson } = require("../utils/fileDb");
const { isPositiveInteger } = require("../utils/validation");

const router = express.Router();

router.use(authMiddleware);

router.get("/", async (req, res) => {
  const carts = await readJson("carts.json", {});
  const products = await readJson("products.json", []);
  const cartItems = carts[String(req.user.id)] || [];

  const detailedItems = cartItems
    .map((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (!product) return null;
      return {
        productId: item.productId,
        quantity: item.quantity,
        product,
        lineTotal: Number((item.quantity * product.price).toFixed(2))
      };
    })
    .filter(Boolean);

  const total = Number(detailedItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));

  return res.status(200).json({
    userId: req.user.id,
    items: detailedItems,
    total
  });
});

router.post("/", async (req, res) => {
  try {
    const { productId, quantity } = req.body || {};
    if (productId === undefined) {
      return res.status(400).json({ message: "productId is required.", code: "VALIDATION_MISSING_FIELDS" });
    }

    const parsedProductId = Number(productId);
    if (!isPositiveInteger(parsedProductId)) {
      return res.status(400).json({ message: "productId must be a positive integer.", code: "VALIDATION_INVALID_TYPES" });
    }

    const products = await readJson("products.json", []);
    const product = products.find((item) => item.id === parsedProductId);
    if (!product) {
      return res.status(404).json({ message: "Product not found.", code: "PRODUCT_NOT_FOUND" });
    }

    const qty = quantity === undefined ? 1 : Number(quantity);
    if (!isPositiveInteger(qty)) {
      return res.status(400).json({ message: "quantity must be a positive integer.", code: "VALIDATION_INVALID_TYPES" });
    }

    const currentStock = Number(product.stock ?? 0);
    if (currentStock <= 0 || qty > currentStock) {
      return res.status(409).json({
        message: "Product is out of stock or requested quantity exceeds stock.",
        code: "PRODUCT_OUT_OF_STOCK"
      });
    }

    const carts = await readJson("carts.json", {});
    const userKey = String(req.user.id);
    const userCart = carts[userKey] || [];

    const existing = userCart.find((item) => item.productId === parsedProductId);
    if (existing) {
      existing.quantity += qty;
    } else {
      userCart.push({ productId: parsedProductId, quantity: qty });
    }

    carts[userKey] = userCart;
    await writeJson("carts.json", carts);

    return res.status(200).json({ message: "Item added to cart." });
  } catch (error) {
    return res.status(500).json({ message: "Failed to add item to cart.", code: "CART_ADD_ERROR" });
  }
});

router.delete("/:productId", async (req, res) => {
  const productId = Number(req.params.productId);
  if (Number.isNaN(productId)) {
    return res.status(400).json({ message: "Invalid product id." });
  }

  const carts = await readJson("carts.json", {});
  const userKey = String(req.user.id);
  const userCart = carts[userKey] || [];
  const updated = userCart.filter((item) => item.productId !== productId);

  if (updated.length === userCart.length) {
    return res.status(404).json({ message: "Item not found in cart." });
  }

  carts[userKey] = updated;
  await writeJson("carts.json", carts);

  return res.status(200).json({ message: "Item removed from cart." });
});

router.patch("/:productId", async (req, res) => {
  const productId = Number(req.params.productId);
  const quantity = Number(req.body?.quantity);

  if (!isPositiveInteger(productId) || !isPositiveInteger(quantity)) {
    return res.status(400).json({
      message: "productId and quantity must be positive integers.",
      code: "VALIDATION_INVALID_TYPES"
    });
  }

  const products = await readJson("products.json", []);
  const product = products.find((item) => item.id === productId);
  if (!product) {
    return res.status(404).json({ message: "Product not found.", code: "PRODUCT_NOT_FOUND" });
  }

  if (quantity > Number(product.stock ?? 0)) {
    return res.status(409).json({
      message: "Requested quantity exceeds available stock.",
      code: "PRODUCT_OUT_OF_STOCK"
    });
  }

  const carts = await readJson("carts.json", {});
  const userKey = String(req.user.id);
  const userCart = carts[userKey] || [];
  const existing = userCart.find((item) => item.productId === productId);

  if (!existing) {
    return res.status(404).json({ message: "Item not found in cart.", code: "CART_ITEM_NOT_FOUND" });
  }

  existing.quantity = quantity;
  carts[userKey] = userCart;
  await writeJson("carts.json", carts);

  return res.status(200).json({ message: "Cart item quantity updated." });
});

module.exports = router;
