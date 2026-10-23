// ZEMON STORE - Page produit

function getParam(name) {
  return new URL(window.location.href).searchParams.get(name);
}

function productPriceLabel(product, price) {
  if (product.priceToConfirm || !price) {
    return "Prix à confirmer";
  }
  if (product.currency === "usd") {
    return "$ " + Number(price).toFixed(2);
  }
  return Number(price).toLocaleString("fr-CD") + " FC";
}

document.addEventListener("DOMContentLoaded", () => {
  const id = getParam("id");
  if (typeof PRODUCTS === "undefined") return;

  const product = PRODUCTS.find((p) => p.id === id);
  const titleEl = document.querySelector(".product-info-title");
  const addBtn = document.getElementById("addToCartBtn");

  if (!product) {
    if (titleEl) titleEl.textContent = "Produit introuvable";
    document.getElementById("productDesc").textContent = "Ce produit n'existe pas ou plus dans le catalogue.";
    addBtn.disabled = true;
    addBtn.textContent = "Indisponible";
    return;
  }

  document.title = product.name + " | ZEMON STORE";
  document.getElementById("productName").textContent = product.name;
  document.getElementById("productDesc").textContent = product.description || "";
  document.getElementById("productImage").src = "../" + product.images[0];
  document.getElementById("productImage").alt = product.name;
  document.getElementById("productCrumb").textContent = product.name;

  const category = (typeof CATEGORIES !== "undefined" ? CATEGORIES : []).find((c) => c.id === product.category);
  if (category) {
    document.getElementById("productCrumb").textContent = category.name;
  }

  const stockText = document.getElementById("stockText");
  if (product.stock === "limited") {
    stockText.textContent = "Stock limité";
  } else if (product.stock === "out") {
    stockText.textContent = "Rupture de stock";
    addBtn.disabled = true;
    addBtn.textContent = "Rupture de stock";
  } else {
    stockText.textContent = "Stock disponible";
  }

  const modelBlock = document.getElementById("modelBlock");
  const modelSelect = document.getElementById("modelSelect");
  const otherVariantBlock = document.getElementById("otherVariantBlock");
  const otherVariantSelect = document.getElementById("otherVariantSelect");
  const hint = document.getElementById("variantHint");
  const priceEl = document.getElementById("productPrice");

  let currentPrice = product.price;
  priceEl.textContent = productPriceLabel(product, currentPrice);

  if (product.hasModelVariant) {
    modelBlock.hidden = false;
    if (typeof IPHONE_MODELS !== "undefined") {
      IPHONE_MODELS.forEach((model) => {
        const opt = document.createElement("option");
        opt.value = model;
        opt.textContent = model;
        modelSelect.appendChild(opt);
      });
    }
    const preset = getParam("model");
    if (preset && IPHONE_MODELS.includes(preset)) {
      modelSelect.value = preset;
    }
  }

  if (Array.isArray(product.variants) && product.variants.length > 0) {
    otherVariantBlock.hidden = false;
    product.variants.forEach((variant) => {
      const opt = document.createElement("option");
      opt.value = variant.id;
      opt.textContent = variant.label;
      otherVariantSelect.appendChild(opt);
    });
    const first = product.variants[0];
    if (first && typeof first.price === "number" && first.price > 0) {
      currentPrice = first.price;
    }
  }

  function checkReady() {
    if (product.stock === "out") {
      addBtn.disabled = true;
      return;
    }
    if (product.hasModelVariant && !modelSelect.value) {
      addBtn.disabled = true;
      hint.hidden = false;
      return;
    }
    addBtn.disabled = false;
    hint.hidden = true;
  }

  modelSelect.addEventListener("change", checkReady);

  otherVariantSelect.addEventListener("change", () => {
    const variant = product.variants.find((v) => v.id === otherVariantSelect.value);
    currentPrice = variant && typeof variant.price === "number" && variant.price > 0 ? variant.price : product.price;
    priceEl.textContent = productPriceLabel(product, currentPrice);
    checkReady();
  });

  checkReady();

  addBtn.addEventListener("click", () => {
    const variantLabel = otherVariantBlock.hidden === false && otherVariantSelect.value
      ? otherVariantSelect.options[otherVariantSelect.selectedIndex].textContent
      : "";
    addItemToCart({
      id: product.id,
      name: product.name,
      category: product.category,
      currency: product.currency,
      price: currentPrice,
      model: product.hasModelVariant ? modelSelect.value : "",
      variant: variantLabel,
      qty: 1,
      image: product.images[0]
    });
    openCart();
  });
});
