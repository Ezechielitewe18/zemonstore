// ZEMON STORE - Page d'accueil

function homeFormatPrice(product) {
  if (product.priceToConfirm || !product.price) {
    return "Prix à confirmer";
  }
  if (product.currency === "usd") {
    return "$ " + Number(product.price).toFixed(2);
  }
  return Number(product.price).toLocaleString("fr-CD") + " FC";
}

function buildProductCard(product, basePath) {
  const card = document.createElement("article");
  card.className = "product-card";

  if (product.best) {
    const badgeEl = document.createElement("span");
    badgeEl.className = "product-badge badge-green";
    badgeEl.textContent = "Best-seller";
    card.appendChild(badgeEl);
  }

  const mediaLink = document.createElement("a");
  mediaLink.className = "product-media";
  mediaLink.href = basePath + "produit.html?id=" + encodeURIComponent(product.id);
  const img = document.createElement("img");
  img.src = basePath + "../" + product.images[0];
  img.alt = product.name;
  img.loading = "lazy";
  mediaLink.appendChild(img);
  card.appendChild(mediaLink);

  const body = document.createElement("div");
  body.className = "product-body";

  const nameLink = document.createElement("a");
  nameLink.href = mediaLink.href;
  const name = document.createElement("h3");
  name.className = "product-name";
  name.textContent = product.name;
  nameLink.appendChild(name);
  body.appendChild(nameLink);

  const meta = document.createElement("p");
  meta.className = "product-meta";
  meta.textContent = product.category === "pochettes" ? "Compatible tous modèles" : "Accessoire iPhone";
  body.appendChild(meta);

  const price = document.createElement("p");
  price.className = "product-price";
  price.textContent = homeFormatPrice(product);
  body.appendChild(price);

  if (product.hasModelVariant) {
    const link = document.createElement("a");
    link.className = "btn";
    link.href = mediaLink.href;
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

function renderFeatured() {
  const grid = document.getElementById("featuredGrid");
  if (!grid || typeof PRODUCTS === "undefined") return;

  const featured = PRODUCTS.filter((p) => p.featured).slice(0, 4);
  grid.innerHTML = "";
  featured.forEach((product) => {
    grid.appendChild(buildProductCard(product, "pages/"));
  });
}

function initModelFinder() {
  const form = document.getElementById("modelFinderForm");
  const select = document.getElementById("modelFinderSelect");
  if (!form || !select || typeof IPHONE_MODELS === "undefined") return;

  IPHONE_MODELS.forEach((model) => {
    const opt = document.createElement("option");
    opt.value = model;
    opt.textContent = model;
    select.appendChild(opt);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const model = select.value;
    if (!model) {
      select.focus();
      return;
    }
    window.location.href = "pages/catalogue.html?model=" + encodeURIComponent(model);
  });
}

document.addEventListener("DOMContentLoaded", () => {
  renderFeatured();
  initModelFinder();
});
