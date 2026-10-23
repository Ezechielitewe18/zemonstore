// ZEMON STORE - Panier

const DELIVERY_FEE = 5000;
const CART_KEY = "zemon_cart";
const MAX_CART_ITEMS = 50;
const MAX_ITEM_QTY = 99;
const DEFAULT_CART_IMAGE = "assets/images/placeholder-pochette.svg";

function cleanCartText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanCartImage(value) {
  if (typeof value !== "string") return DEFAULT_CART_IMAGE;
  const path = value.replace(/\\/g, "/");
  return /^assets\/images\/[a-z0-9._-]+\.(?:svg|png|jpe?g|webp|avif)$/i.test(path) ? path : DEFAULT_CART_IMAGE;
}

function sanitizeCartItem(item) {
  if (!item || typeof item !== "object") return null;
  const name = cleanCartText(item.name, 80);
  if (!name) return null;
  const price = Number(item.price);
  const qty = Number(item.qty);
  return {
    id: cleanCartText(item.id, 60),
    name,
    category: cleanCartText(item.category, 30),
    currency: item.currency === "usd" ? "usd" : "fc",
    price: Number.isFinite(price) && price > 0 ? Math.min(price, 100000000) : 0,
    model: cleanCartText(item.model, 40),
    variant: cleanCartText(item.variant, 40),
    qty: Number.isFinite(qty) ? Math.min(MAX_ITEM_QTY, Math.max(1, Math.floor(qty))) : 1,
    image: cleanCartImage(item.image)
  };
}

function sanitizeCart(cart) {
  if (!Array.isArray(cart)) return [];
  return cart.map(sanitizeCartItem).filter(Boolean).slice(0, MAX_CART_ITEMS);
}

function getCart() {
  try {
    return sanitizeCart(JSON.parse(localStorage.getItem(CART_KEY) || "[]"));
  } catch (e) {
    return [];
  }
}

function saveCart(cart) {
  const clean = sanitizeCart(cart);
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(clean));
  } catch (e) {
    void e;
  }
  updateCartCount();
  renderCart();
  return clean;
}

function updateCartCount() {
  const cart = getCart();
  const count = cart.reduce((sum, item) => sum + (item.qty || 0), 0);
  document.querySelectorAll(".cart-count").forEach((el) => {
    el.textContent = count.toString();
    el.classList.add("bump");
    setTimeout(() => el.classList.remove("bump"), 400);
  });
}

function showCartToast(text) {
  const toast = document.getElementById("cartToast");
  if (!toast) return;
  if (text) toast.textContent = text;
  toast.classList.add("show");
  clearTimeout(showCartToast._t);
  showCartToast._t = setTimeout(() => toast.classList.remove("show"), 1600);
}

function openCart() {
  document.getElementById("cartDrawer")?.classList.add("open");
  document.getElementById("cartOverlay")?.classList.add("open");
  document.body.style.overflow = "hidden";
}

function closeCart() {
  document.getElementById("cartDrawer")?.classList.remove("open");
  document.getElementById("cartOverlay")?.classList.remove("open");
  document.body.style.overflow = "";
}

function formatUsd(val) {
  return "$ " + Number(val).toFixed(2);
}

function formatFc(val) {
  return Math.round(Number(val)).toLocaleString("fr-CD") + " FC";
}

function addItemToCart(item) {
  const safeItem = sanitizeCartItem(item);
  if (!safeItem) return;
  const cart = getCart();
  const existing = cart.find(
    (c) => c.id === safeItem.id && (c.model || "") === (safeItem.model || "") && (c.variant || "") === (safeItem.variant || "")
  );
  if (existing) {
    existing.qty = Math.min(MAX_ITEM_QTY, (existing.qty || 1) + 1);
  } else {
    cart.push(safeItem);
  }
  saveCart(cart);
  showCartToast("Ajouté au panier");
}

function renderCart() {
  const itemsEl = document.getElementById("cartItems");
  const subtotalUsdEl = document.getElementById("subtotalUsd");
  const subtotalFcEl = document.getElementById("subtotalFc");
  const totalUsdEl = document.getElementById("totalUsd");
  const totalFcEl = document.getElementById("totalFc");
  if (!itemsEl) return;

  const cart = getCart();
  itemsEl.innerHTML = "";

  if (cart.length === 0) {
    const empty = document.createElement("p");
    empty.className = "cart-empty";
    empty.textContent = "Votre panier est vide.";
    itemsEl.appendChild(empty);
  }

  let subtotalUsd = 0;
  let subtotalFc = 0;

  cart.forEach((item, index) => {
    const price = typeof item.price === "number" ? item.price : 0;
    const qty = item.qty || 1;
    if (item.currency === "usd") subtotalUsd += price * qty;
    else subtotalFc += price * qty;

    const row = document.createElement("div");
    row.className = "cart-item";

    const img = document.createElement("img");
    const base = window.location.pathname.replace(/\\/g, "/").includes("/pages/") ? "../" : "";
    img.src = base + item.image;
    img.alt = item.name;
    row.appendChild(img);

    const main = document.createElement("div");
    main.className = "cart-item-main";

    const name = document.createElement("p");
    name.className = "cart-item-name";
    name.textContent = item.name;
    main.appendChild(name);

    const parts = [];
    if (item.model) parts.push(item.model);
    if (item.variant) parts.push(item.variant);
    if (parts.length) {
      const meta = document.createElement("p");
      meta.className = "cart-item-meta";
      meta.textContent = parts.join(" · ");
      main.appendChild(meta);
    }

    const priceLine = document.createElement("p");
    priceLine.className = "cart-item-price";
    priceLine.textContent = price === 0
      ? "Prix à confirmer"
      : item.currency === "usd" ? formatUsd(price * qty) : formatFc(price * qty);
    main.appendChild(priceLine);

    const actions = document.createElement("div");
    actions.className = "cart-item-actions";

    const qtyWrap = document.createElement("div");
    qtyWrap.className = "cart-qty";

    const minus = document.createElement("button");
    minus.type = "button";
    minus.textContent = "−";
    minus.setAttribute("aria-label", "Diminuer");
    minus.addEventListener("click", () => {
      const cartNow = getCart();
      if (cartNow[index].qty > 1) cartNow[index].qty -= 1;
      else cartNow.splice(index, 1);
      saveCart(cartNow);
    });

    const qtyEl = document.createElement("span");
    qtyEl.textContent = qty.toString();

    const plus = document.createElement("button");
    plus.type = "button";
    plus.textContent = "+";
    plus.setAttribute("aria-label", "Augmenter");
    plus.addEventListener("click", () => {
      const cartNow = getCart();
      cartNow[index].qty = Math.min(MAX_ITEM_QTY, (cartNow[index].qty || 1) + 1);
      saveCart(cartNow);
    });

    qtyWrap.appendChild(minus);
    qtyWrap.appendChild(qtyEl);
    qtyWrap.appendChild(plus);

    const remove = document.createElement("button");
    remove.type = "button";
    remove.className = "cart-remove";
    remove.textContent = "Supprimer";
    remove.addEventListener("click", () => {
      const cartNow = getCart();
      cartNow.splice(index, 1);
      saveCart(cartNow);
    });

    actions.appendChild(qtyWrap);
    actions.appendChild(remove);
    main.appendChild(actions);

    row.appendChild(main);
    itemsEl.appendChild(row);
  });

  if (subtotalUsdEl) subtotalUsdEl.textContent = formatUsd(subtotalUsd);
  if (subtotalFcEl) subtotalFcEl.textContent = formatFc(subtotalFc);
  if (totalUsdEl) totalUsdEl.textContent = formatUsd(subtotalUsd);
  if (totalFcEl) totalFcEl.textContent = formatFc(subtotalFc + DELIVERY_FEE);
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartCount();
  renderCart();

  document.querySelectorAll(".cart-btn").forEach((btn) => {
    btn.addEventListener("click", openCart);
  });
  document.getElementById("cartClose")?.addEventListener("click", closeCart);
  document.getElementById("cartOverlay")?.addEventListener("click", closeCart);
  document.getElementById("cartClear")?.addEventListener("click", () => {
    localStorage.removeItem(CART_KEY);
    saveCart([]);
    closeCart();
  });
});
