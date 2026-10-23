// ZEMON STORE - Commande + facture

const SHOP_WHATSAPP = "243818395949";
const SHOP_NAME = "ZEMON STORE";
const PAYMENT_OPTIONS = ["M-Pesa (Mobile Money)", "Espèces à la livraison"];
let currentInvoice = null;

function cleanFormText(value, maxLength) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, maxLength);
}

function cleanFormPhone(value) {
  if (typeof value !== "string") return "";
  return value
    .replace(/[^\d+\s().-]/g, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 20);
}

function cleanFormEmail(value) {
  const email = cleanFormText(value, 120).toLowerCase();
  return /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/.test(email) ? email : "";
}

function checkoutTotals(cart) {
  let subUsd = 0;
  let subFc = 0;
  let hasZero = false;
  cart.forEach((item) => {
    const price = typeof item.price === "number" ? item.price : 0;
    const qty = item.qty || 1;
    if (!price) hasZero = true;
    if (item.currency === "usd") subUsd += price * qty;
    else subFc += price * qty;
  });
  return {
    subUsd,
    subFc,
    totalUsd: subUsd,
    totalFc: subFc + DELIVERY_FEE,
    hasZero
  };
}

function linePrice(item) {
  const price = typeof item.price === "number" ? item.price : 0;
  const qty = item.qty || 1;
  if (!price) return "Prix à confirmer";
  return item.currency === "usd" ? formatUsd(price * qty) : formatFc(price * qty);
}

function itemMeta(item) {
  const parts = [];
  if (item.model) parts.push(item.model);
  if (item.variant) parts.push(item.variant);
  parts.push("x" + (item.qty || 1));
  return parts.join(" · ");
}

function renderCheckout() {
  const itemsEl = document.getElementById("checkoutItems");
  if (!itemsEl) return;

  const subUsdEl = document.getElementById("checkoutSubtotalUsd");
  const subFcEl = document.getElementById("checkoutSubtotalFc");
  const totUsdEl = document.getElementById("checkoutTotalUsd");
  const totFcEl = document.getElementById("checkoutTotalFc");

  const cart = getCart();
  itemsEl.innerHTML = "";

  if (cart.length === 0) {
    const empty = document.createElement("p");
    empty.className = "checkout-empty";
    empty.textContent = "Votre panier est vide.";
    itemsEl.appendChild(empty);
  }

  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "summary-item";

    const img = document.createElement("img");
    img.src = "../" + item.image;
    img.alt = item.name;
    row.appendChild(img);

    const info = document.createElement("div");
    info.className = "summary-item-info";

    const name = document.createElement("p");
    name.className = "summary-item-name";
    name.textContent = item.name;
    info.appendChild(name);

    const meta = document.createElement("p");
    meta.className = "summary-item-meta";
    meta.textContent = itemMeta(item);
    info.appendChild(meta);

    row.appendChild(info);

    const price = document.createElement("p");
    price.className = "summary-item-price";
    price.textContent = linePrice(item);
    row.appendChild(price);

    itemsEl.appendChild(row);
  });

  const totals = checkoutTotals(cart);
  if (subUsdEl) subUsdEl.textContent = formatUsd(totals.subUsd);
  if (subFcEl) subFcEl.textContent = formatFc(totals.subFc);
  if (totUsdEl) totUsdEl.textContent = formatUsd(totals.totalUsd);
  if (totFcEl) totFcEl.textContent = formatFc(totals.totalFc);
}

function buildOrderMessage(cart, info) {
  const totals = checkoutTotals(cart);
  let msg = `*COMMANDE ${SHOP_NAME}*\n\n`;
  msg += `*Client*\n`;
  msg += `Nom : ${info.name}\n`;
  msg += `WhatsApp : ${info.phone}\n`;
  msg += `Quartier / Adresse : ${info.address}\n`;
  if (info.payment) msg += `Paiement : ${info.payment}\n`;
  msg += `\n*Articles*\n`;

  cart.forEach((item, idx) => {
    msg += `${idx + 1}. ${item.name}\n`;
    if (item.model) msg += `   Modèle : ${item.model}\n`;
    if (item.variant) msg += `   Variante : ${item.variant}\n`;
    msg += `   Quantité : ${item.qty || 1}\n`;
    msg += `   Prix : ${linePrice(item)}\n\n`;
  });

  msg += `*Récapitulatif*\n`;
  msg += `Sous-total USD : ${formatUsd(totals.subUsd)}\n`;
  msg += `Sous-total FC : ${formatFc(totals.subFc)}\n`;
  msg += `Livraison Kinshasa : ${formatFc(DELIVERY_FEE)}\n`;
  msg += `TOTAL USD : ${formatUsd(totals.totalUsd)}\n`;
  msg += `TOTAL FC : ${formatFc(totals.totalFc)}\n`;
  if (totals.hasZero) msg += `\n*Prix à confirmer* pour certains articles.\n`;
  msg += `\n_Commande envoyée depuis ${SHOP_NAME}_`;

  return encodeURIComponent(msg);
}

function makeInvoiceNumber() {
  const now = new Date();
  const stamp = now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, "0") +
    String(now.getDate()).padStart(2, "0");
  let randomPart;
  if (window.crypto && window.crypto.getRandomValues) {
    const values = new Uint32Array(1);
    window.crypto.getRandomValues(values);
    randomPart = 100 + (values[0] % 900);
  } else {
    randomPart = 100 + Math.floor(Math.random() * 900);
  }
  return "ZM-" + stamp + "-" + String(randomPart);
}

function normalizePhone(raw) {
  let digits = (raw || "").replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("00")) digits = digits.slice(2);
  if (digits.startsWith("0")) digits = "243" + digits.slice(1);
  if (digits.length === 9) digits = "243" + digits;
  return digits;
}

function buildInvoiceText(inv) {
  let msg = `*FACTURE ${SHOP_NAME}*\n`;
  msg += `N° ${inv.number}\n`;
  msg += `Date : ${inv.date}\n\n`;
  msg += `*Client*\n${inv.name}\n`;
  msg += `WhatsApp : ${inv.phone}\n`;
  msg += `Adresse : ${inv.address}\n`;
  if (inv.payment) msg += `Paiement : ${inv.payment}\n`;
  msg += `\n*Articles*\n`;
  inv.items.forEach((item, idx) => {
    msg += `${idx + 1}. ${item.name}\n`;
    if (item.model) msg += `   Modèle : ${item.model}\n`;
    if (item.variant) msg += `   Variante : ${item.variant}\n`;
    msg += `   ${item.qty} x ${item.unit} = ${item.line}\n\n`;
  });
  msg += `*Totaux*\n`;
  msg += `Sous-total USD : ${inv.totals.subUsdText}\n`;
  msg += `Sous-total FC : ${inv.totals.subFcText}\n`;
  msg += `Livraison Kinshasa : ${formatFc(DELIVERY_FEE)}\n`;
  msg += `TOTAL USD : ${inv.totals.totalUsdText}\n`;
  msg += `TOTAL FC : ${inv.totals.totalFcText}\n`;
  if (inv.hasZero) msg += `\n*Prix à confirmer* pour certains articles.\n`;
  msg += `\nPaiement M-Pesa (Mobile Money) : +243 818 395 949\n`;
  msg += `Assistance 24h/24, 7j/7\n\nMerci pour votre confiance.\n${SHOP_NAME}`;
  return msg;
}

function renderInvoice(cart, info) {
  const totals = checkoutTotals(cart);
  const now = new Date();
  const dateText = now.toLocaleDateString("fr-FR") + " à " + now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

  const invoice = {
    number: makeInvoiceNumber(),
    date: dateText,
    name: info.name,
    phone: info.phone,
    address: info.address,
    email: info.email,
    payment: info.payment,
    items: cart.map((item) => {
      const price = typeof item.price === "number" ? item.price : 0;
      return {
        name: item.name,
        model: item.model,
        variant: item.variant,
        qty: item.qty || 1,
        unit: price ? (item.currency === "usd" ? formatUsd(price) : formatFc(price)) : "À confirmer",
        line: linePrice(item)
      };
    }),
    totals: {
      subUsdText: formatUsd(totals.subUsd),
      subFcText: formatFc(totals.subFc),
      totalUsdText: formatUsd(totals.totalUsd),
      totalFcText: formatFc(totals.totalFc)
    },
    hasZero: totals.hasZero
  };

  currentInvoice = invoice;

  document.getElementById("invoiceNum").textContent = "N° " + invoice.number + " · " + invoice.date;

  const client = document.getElementById("invoiceClient");
  client.replaceChildren();
  const clientLines = [invoice.name, invoice.phone, invoice.address, invoice.email, invoice.payment ? "Paiement : " + invoice.payment : ""];
  clientLines.filter(Boolean).forEach((line) => {
    const p = document.createElement("p");
    p.textContent = line;
    client.appendChild(p);
  });

  const itemsEl = document.getElementById("invoiceItems");
  itemsEl.replaceChildren();
  cart.forEach((item) => {
    const row = document.createElement("div");
    row.className = "summary-item";

    const info2 = document.createElement("div");
    info2.className = "summary-item-info";

    const name = document.createElement("p");
    name.className = "summary-item-name";
    name.textContent = item.name;
    info2.appendChild(name);

    const meta = document.createElement("p");
    meta.className = "summary-item-meta";
    meta.textContent = itemMeta(item);
    info2.appendChild(meta);

    row.appendChild(info2);

    const price = document.createElement("p");
    price.className = "summary-item-price";
    price.textContent = linePrice(item);
    row.appendChild(price);

    itemsEl.appendChild(row);
  });

  const totalsEl = document.getElementById("invoiceTotals");

  const subtotalLine = document.createElement("div");
  subtotalLine.className = "total-line";
  const subtotalLabel = document.createElement("span");
  subtotalLabel.textContent = "Sous-total";
  const subtotalSplit = document.createElement("div");
  subtotalSplit.className = "total-split";
  const subtotalUsd = document.createElement("span");
  subtotalUsd.textContent = invoice.totals.subUsdText;
  const subtotalFc = document.createElement("span");
  subtotalFc.textContent = invoice.totals.subFcText;
  subtotalSplit.append(subtotalUsd, subtotalFc);
  subtotalLine.append(subtotalLabel, subtotalSplit);

  const deliveryLine = document.createElement("div");
  deliveryLine.className = "total-line";
  const deliveryLabel = document.createElement("span");
  deliveryLabel.textContent = "Livraison (Kinshasa)";
  const deliveryValue = document.createElement("span");
  deliveryValue.textContent = formatFc(DELIVERY_FEE);
  deliveryLine.append(deliveryLabel, deliveryValue);

  const grandLine = document.createElement("div");
  grandLine.className = "total-line total-line--grand";
  const grandLabel = document.createElement("span");
  grandLabel.textContent = "Total";
  const grandSplit = document.createElement("div");
  grandSplit.className = "total-split";
  const grandUsd = document.createElement("span");
  grandUsd.textContent = invoice.totals.totalUsdText;
  const grandFc = document.createElement("span");
  grandFc.textContent = invoice.totals.totalFcText;
  grandSplit.append(grandUsd, grandFc);
  grandLine.append(grandLabel, grandSplit);

  totalsEl.replaceChildren(subtotalLine, deliveryLine, grandLine);

  const waBtn = document.getElementById("invoiceWa");
  const clientPhone = normalizePhone(invoice.phone);
  waBtn.href = clientPhone
    ? "https://wa.me/" + clientPhone + "?text=" + encodeURIComponent(buildInvoiceText(invoice))
    : "https://wa.me/?text=" + encodeURIComponent(buildInvoiceText(invoice));

  const panel = document.getElementById("invoicePanel");
  panel.classList.add("show");
  panel.scrollIntoView({ behavior: "smooth", block: "start" });
}

document.addEventListener("DOMContentLoaded", () => {
  renderCheckout();
  updateCartCount();

  const form = document.getElementById("checkoutForm");
  form?.addEventListener("submit", (e) => {
    e.preventDefault();

    const cart = getCart();
    if (cart.length === 0) {
      alert("Votre panier est vide.");
      return;
    }

    const rawEmail = document.getElementById("clientEmail").value;
    const phone = cleanFormPhone(document.getElementById("clientPhone").value);
    const email = cleanFormEmail(rawEmail);
    const paymentValue = document.getElementById("clientPayment")?.value;
    const info = {
      name: cleanFormText(document.getElementById("clientName").value, 80),
      phone,
      address: cleanFormText(document.getElementById("clientAddress").value, 160),
      email,
      payment: PAYMENT_OPTIONS.includes(paymentValue) ? paymentValue : PAYMENT_OPTIONS[0]
    };

    if (!info.name || !info.phone || !info.address) {
      alert("Veuillez remplir votre nom, votre WhatsApp et votre adresse.");
      return;
    }

    const phoneDigits = normalizePhone(info.phone);
    if (phoneDigits.length < 9 || phoneDigits.length > 15) {
      alert("Numéro WhatsApp invalide. Exemple : 081 234 5678.");
      return;
    }

    if (rawEmail.trim() && !email) {
      alert("Adresse email invalide.");
      return;
    }

    const orderUrl = "https://wa.me/" + SHOP_WHATSAPP + "?text=" + buildOrderMessage(cart, info);
    window.open(orderUrl, "_blank", "noopener,noreferrer");

    renderInvoice(cart, info);

    localStorage.removeItem(CART_KEY);
    updateCartCount();
    renderCart();
    renderCheckout();
  });

  document.getElementById("invoicePdf")?.addEventListener("click", () => {
    if (!currentInvoice) return;
    if (typeof downloadInvoicePdf === "function") {
      downloadInvoicePdf(currentInvoice);
    } else {
      window.print();
    }
  });

  document.getElementById("invoicePrint")?.addEventListener("click", () => {
    window.print();
  });

  document.getElementById("invoiceMail")?.addEventListener("click", () => {
    if (!currentInvoice) return;
    const email = cleanFormEmail(currentInvoice.email);
    if (!email) {
      alert("Ajoutez un email valide dans le formulaire, puis recliquez sur ce bouton.");
      return;
    }
    const subject = encodeURIComponent("Facture " + currentInvoice.number + " - " + SHOP_NAME);
    const body = encodeURIComponent(buildInvoiceText(currentInvoice).replace(/\*/g, ""));
    window.location.href = "mailto:" + email + "?subject=" + subject + "&body=" + body;
  });
});
