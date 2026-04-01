const LOCAL_CART_KEY = "cart";

function safeParse(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch (error) {
    return fallback;
  }
}

export function getLocalCart() {
  if (typeof window === "undefined") return [];
  const raw = localStorage.getItem(LOCAL_CART_KEY);
  if (!raw) return [];
  const parsed = safeParse(raw, []);
  return Array.isArray(parsed) ? parsed : [];
}

function saveLocalCart(items) {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_CART_KEY, JSON.stringify(items));
}

export function addToLocalCart(product, quantity = 1) {
  const items = getLocalCart();
  const existing = items.find((item) => item.productId === product.id);
  if (existing) {
    existing.quantity += quantity;
  } else {
    items.push({
      productId: product.id,
      quantity,
      product
    });
  }
  saveLocalCart(items);
}

export function removeFromLocalCart(productId) {
  const items = getLocalCart();
  const updated = items.filter((item) => item.productId !== productId);
  saveLocalCart(updated);
}

export function updateLocalCartQuantity(productId, quantity) {
  const items = getLocalCart();
  const existing = items.find((item) => item.productId === productId);
  if (!existing) return;
  existing.quantity = quantity;
  saveLocalCart(items);
}

export function formatLocalCartForPage() {
  const items = getLocalCart().map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    product: item.product,
    lineTotal: Number((item.quantity * Number(item.product.price)).toFixed(2))
  }));
  const total = Number(items.reduce((sum, item) => sum + item.lineTotal, 0).toFixed(2));
  return { items, total };
}
