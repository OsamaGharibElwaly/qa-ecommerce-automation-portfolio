const express = require("express");
const authMiddleware = require("../middleware/auth");
const { readJson, writeJson } = require("../utils/fileDb");

const router = express.Router();

router.use(authMiddleware);

router.post("/checkout", async (req, res) => {
  try {
    if (String(process.env.MOCK_ORDER_FAILURE || "").toLowerCase() === "true") {
      return res.status(500).json({
        message: "Mock order submission failure.",
        code: "ORDER_SUBMISSION_FAILED"
      });
    }

    const carts = await readJson("carts.json", {});
    const orders = await readJson("orders.json", []);
    const products = await readJson("products.json", []);
    const userKey = String(req.user.id);
    const userCart = carts[userKey] || [];

    if (!userCart.length) {
      return res.status(400).json({ message: "Cart is empty.", code: "CART_EMPTY" });
    }

    const orderItems = [];
    for (const item of userCart) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return res.status(400).json({
          message: `Invalid product in cart: ${item.productId}.`,
          code: "CART_INVALID_PRODUCT"
        });
      }
      if (item.quantity > Number(product.stock ?? 0)) {
        return res.status(409).json({
          message: `Insufficient stock for product ${product.id}.`,
          code: "PRODUCT_OUT_OF_STOCK"
        });
      }

      orderItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        lineTotal: Number((item.quantity * product.price).toFixed(2))
      });
    }

    const total = Number(orderItems.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
    const order = {
      id: orders.length ? Math.max(...orders.map((item) => item.id)) + 1 : 1,
      userId: req.user.id,
      createdAt: new Date().toISOString(),
      status: "confirmed",
      items: orderItems,
      total
    };

    for (const item of userCart) {
      const product = products.find((p) => p.id === item.productId);
      product.stock = Number(product.stock ?? 0) - item.quantity;
    }

    orders.push(order);
    carts[userKey] = [];
    await writeJson("orders.json", orders);
    await writeJson("carts.json", carts);
    await writeJson("products.json", products);

    return res.status(201).json({
      message: "Order confirmed.",
      order
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to checkout.", code: "CHECKOUT_ERROR" });
  }
});

router.get("/", async (req, res) => {
  const orders = await readJson("orders.json", []);
  const userOrders = orders.filter((order) => order.userId === req.user.id);
  return res.status(200).json({ orders: userOrders });
});

module.exports = router;
