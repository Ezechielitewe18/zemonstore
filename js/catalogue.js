// ZEMON STORE - Catalogue

const CAT_IN_PAGES = window.location.pathname.replace(/\\/g, "/").includes("/pages/");
const CAT_IMG_BASE = CAT_IN_PAGES ? "../" : "";

function catFormatPrice(product) {
  if (product.priceToConfirm || !product.price) {
    return "Prix à confirmer";
  }
  if (product.currency === "usd") {
    return "$ " + Number(product.price).toFixed(2);
  }
  return Number(product.price).toLocaleString("fr-CD") + " FC";
}

function catProductLink(product, model) {
  let href = "produit.html?id=" + encodeURIComponent(product.id);
  if (model && model !== "all") {
    href += "&model=" + encodeURIComponent(model);
  }
  return href;
}

function buildCatalogueCard(product, model) {
  const card = document.createElement("article");
  card.className = "product-card";

  if (product.best) {
    const badge = document.createElement("span");
    badge.className = "product-badge badge-green";
    badge.textContent = "Best-seller";
    card.appendChild(badge);
  }

  const href = catProductLink(product, model);

  const mediaLink = document.createElement("a");
  mediaLink.className = "product-media";
  mediaLink.href = href;
  const img = document.createElement("img");
  img.src = CAT_IMG_BASE + product.images[0];
  img.alt = product.name;
  img.loading = "lazy";
  mediaLink.appendChild(img);
  card.appendChild(mediaLink);

  const body = document.createElement("div");
  body.className = "product-body";

  const nameLink = document.createElement("a");
  nameLink.href = href;
  const name = document.createElement("h3");
  name.className = "product-name";
  name.textContent = product.name;
  nameLink.appendChild(name);
  body.appendChild(nameLink);

  const meta = document.createElement("p");
  meta.className = "product-meta";
  meta.textContent = model && model !== "all"
    ? "Compatible " + model
    : product.category === "pochettes" ? "En USD" : "En FC";
  body.appendChild(meta);

  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = catFormatPrice(product);
  body.appendChild(price);

  if (product.hasModelVariant) {
    const link = document.createElement("a");
    link.className = "btn";
    link.href = href;
    link.textContent = "Choisir le modèle";
    body.appendChild(link);
  } else {
    const btn = document.createElement("button");
    btn.className = "btn";
    btn.textContent = "Ajouter au panier";
    btn.addEventListener("click", () => {
      addItemToCart({
        id: product.id,
        name: product.name,
        category: product.category,
        currency: product.currency,
        price: product.price,
        model: "",
        variant: product.variants && product.variants[0] ? product.variants[0].label : "",
        qty: 1,
        image: product.images[0]
      });
    });
    body.appendChild(btn);
  }

  card.appendChild(body);
  return card;
}

function fillCategoryFilter() {
  const select = document.getElementById("filterCat");
  if (!select || typeof CATEGORIES === "undefined") return;
  CATEGORIES.forEach((cat) => {
    const opt = document.createElement("option");
    opt.value = cat.id;
    opt.textContent = cat.name;
    select.appendChild(opt);
  });
}

function fillModelFilter() {
  const select = document.getElementById("filterModel");
  if (!select || typeof IPHONE_MODELS === "undefined") return;
  IPHONE_MODELS.forEach((model) => {
    const opt = document.createElement("option");
    opt.value = model;
    opt.textContent = model;
    select.appendChild(opt);
  });
}

function renderProducts() {
  const grid = document.getElementById("productsGrid");
  const empty = document.getElementById("emptyState");
  if (!grid || typeof PRODUCTS === "undefined") return;

  const cat = document.getElementById("filterCat")?.value || "all";
  const model = document.getElementById("filterModel")?.value || "all";
  const search = (document.getElementById("searchInput")?.value || "").toLowerCase().trim();

  const params = new URLSearchParams(window.location.search);
  const special = params.get("filter");

  let list = PRODUCTS.filter((product) => {
    const matchCat = cat === "all" || product.category === cat;
    const matchSearch = !search || product.name.toLowerCase().includes(search) || product.description.toLowerCase().includes(search);
    const matchSpecial = !special || (special === "best" ? product.best : true);
    return matchCat && matchSearch && matchSpecial;
  });

  grid.innerHTML = "";

  if (list.length === 0) {
    if (empty) empty.hidden = false;
    return;
  }
  if (empty) empty.hidden = true;

  list.forEach((product) => grid.appendChild(buildCatalogueCard(product, model)));
}

function readParams() {
  const params = new URLSearchParams(window.location.search);
  const cat = params.get("cat");
  const model = params.get("model");
  const q = params.get("q");
  const filter = params.get("filter");

  const catSelect = document.getElementById("filterCat");
  const modelSelect = document.getElementById("filterModel");
  const searchInput = document.getElementById("searchInput");
  const titleEl = document.getElementById("catalogueTitle");
  const subEl = document.getElementById("catalogueSubtitle");

  if (cat && catSelect) catSelect.value = cat;
  if (model && modelSelect) modelSelect.value = model;
  if (q && searchInput) searchInput.value = q.slice(0, 60);

  if (filter === "best") {
    if (titleEl) titleEl.textContent = "Meilleures ventes";
    if (subEl) subEl.textContent = "Les articles les plus demandés";
  } else if (model) {
    if (subEl) subEl.textContent = "Articles compatibles avec " + model;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fillCategoryFilter();
  fillModelFilter();
  readParams();
  renderProducts();

  const cat = document.getElementById("filterCat");
  const model = document.getElementById("filterModel");
  const search = document.getElementById("searchInput");

  if (cat) cat.addEventListener("change", renderProducts);
  if (model) model.addEventListener("change", renderProducts);
  if (search) search.addEventListener("input", renderProducts);
});
