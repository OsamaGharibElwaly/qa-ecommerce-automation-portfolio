const fs = require("fs/promises");
const path = require("path");
const request = require("supertest");

const baseDataDir = path.join(__dirname, "..", "data");
const testDataDir = path.join(__dirname, "__tmpdata");

let app;

async function resetData() {
  await fs.rm(testDataDir, { recursive: true, force: true });
  await fs.mkdir(testDataDir, { recursive: true });
  const products = JSON.parse(await fs.readFile(path.join(baseDataDir, "products.json"), "utf8")).map((p) => {
    const defaultStockById = { 1: 12, 2: 7, 3: 0, 4: 20, 5: 4, 6: 9 };
    return { ...p, stock: defaultStockById[p.id] ?? p.stock ?? 1 };
  });
  const users = [
    {
      id: 1,
      name: "Demo User",
      email: "demo@example.com",
      password: "password123"
    }
  ];

  await fs.writeFile(path.join(testDataDir, "products.json"), JSON.stringify(products, null, 2), "utf8");
  await fs.writeFile(path.join(testDataDir, "users.json"), JSON.stringify(users, null, 2), "utf8");
  await fs.writeFile(path.join(testDataDir, "carts.json"), "{}", "utf8");
  await fs.writeFile(path.join(testDataDir, "orders.json"), "[]", "utf8");
}

beforeAll(async () => {
  process.env.DATA_DIR = testDataDir;
  process.env.TOKEN_TTL_SECONDS = "3600";
  process.env.MOCK_ORDER_FAILURE = "false";
  await resetData();
  app = require("../src/app");
});

beforeEach(async () => {
  await resetData();
});

afterAll(async () => {
  await fs.rm(testDataDir, { recursive: true, force: true });
});

async function loginAndGetToken() {
  const res = await request(app).post("/api/auth/login").send({
    email: "demo@example.com",
    password: "password123"
  });
  return res.body.token;
}

describe("auth validation", () => {
  test("rejects invalid email", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Bad User",
      email: "invalid-email",
      password: "Strong123"
    });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_INVALID_EMAIL");
  });

  test("rejects weak password", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Weak User",
      email: "weak@example.com",
      password: "12345678"
    });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_WEAK_PASSWORD");
  });

  test("rejects duplicate registration", async () => {
    const res = await request(app).post("/api/auth/register").send({
      name: "Demo User",
      email: "demo@example.com",
      password: "Strong123"
    });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe("AUTH_DUPLICATE_EMAIL");
  });
});

describe("auth middleware", () => {
  test("rejects missing token", async () => {
    const res = await request(app).get("/api/cart");
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("AUTH_HEADER_INVALID");
  });

  test("rejects expired token", async () => {
    process.env.TOKEN_TTL_SECONDS = "-10";
    const login = await request(app).post("/api/auth/login").send({
      email: "demo@example.com",
      password: "password123"
    });
    process.env.TOKEN_TTL_SECONDS = "3600";
    const res = await request(app)
      .get("/api/cart")
      .set("Authorization", `Bearer ${login.body.token}`);
    expect(res.status).toBe(401);
    expect(res.body.code).toBe("TOKEN_EXPIRED");
  });
});

describe("cart and checkout edge cases", () => {
  test("rejects invalid product id type", async () => {
    const token = await loginAndGetToken();
    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: "abc", quantity: 1 });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("VALIDATION_INVALID_TYPES");
  });

  test("rejects out of stock add", async () => {
    const token = await loginAndGetToken();
    const res = await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: 3, quantity: 1 });
    expect(res.status).toBe(409);
    expect(res.body.code).toBe("PRODUCT_OUT_OF_STOCK");
  });

  test("prevents empty cart checkout", async () => {
    const token = await loginAndGetToken();
    const res = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.code).toBe("CART_EMPTY");
  });

  test("returns mock order submission failure", async () => {
    const token = await loginAndGetToken();
    await request(app)
      .post("/api/cart")
      .set("Authorization", `Bearer ${token}`)
      .send({ productId: 1, quantity: 1 });

    process.env.MOCK_ORDER_FAILURE = "true";
    const checkout = await request(app)
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({});
    process.env.MOCK_ORDER_FAILURE = "false";

    expect(checkout.status).toBe(500);
    expect(checkout.body.code).toBe("ORDER_SUBMISSION_FAILED");
  });
});
