// ZEMON STORE - Interactions communes

const yearEl = document.getElementById("year");
if (yearEl) {
  yearEl.textContent = new Date().getFullYear().toString();
}

/* Menu mobile */
const burger = document.getElementById("burger");
const mobileMenu = document.getElementById("mobileMenu");
if (burger && mobileMenu) {
  burger.addEventListener("click", () => mobileMenu.classList.toggle("open"));
}

/* Barre de recherche */
const searchToggle = document.getElementById("searchToggle");
const searchBar = document.getElementById("searchBar");
if (searchToggle && searchBar) {
  searchToggle.addEventListener("click", () => {
    searchBar.classList.toggle("open");
    if (searchBar.classList.contains("open")) {
      document.getElementById("headerSearchInput")?.focus();
    }
  });
}

const searchForm = document.getElementById("headerSearchForm");
if (searchForm) {
  searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const q = (document.getElementById("headerSearchInput")?.value || "").trim();
    const inPages = window.location.pathname.replace(/\\/g, "/").includes("/pages/");
    const target = (inPages ? "catalogue.html" : "pages/catalogue.html") + (q ? "?q=" + encodeURIComponent(q) : "");
    window.location.href = target;
  });
}

/* Révélation du titre mot par mot */
function wrapWords(node, counter) {
  if (node.nodeType === 3) {
    const frag = document.createDocumentFragment();
    const words = node.textContent.split(/\s+/).filter(Boolean);
    words.forEach((word, idx) => {
      const span = document.createElement("span");
      span.className = "word";
      span.textContent = word;
      span.style.animationDelay = (counter.value * 0.07).toFixed(2) + "s";
      counter.value += 1;
      frag.appendChild(span);
      if (idx < words.length - 1) frag.appendChild(document.createTextNode(" "));
    });
    return frag;
  }
  if (node.nodeType === 1) {
    const clone = node.cloneNode(false);
    Array.from(node.childNodes).forEach((child) => clone.appendChild(wrapWords(child, counter)));
    return clone;
  }
  return node.cloneNode(true);
}

const revealTitle = document.querySelector("[data-word-reveal]");
if (revealTitle) {
  const counter = { value: 0 };
  const frag = document.createDocumentFragment();
  Array.from(revealTitle.childNodes).forEach((child) => frag.appendChild(wrapWords(child, counter)));
  revealTitle.innerHTML = "";
  revealTitle.appendChild(frag);
}

/* Apparition au défilement */
if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
} else {
  document.querySelectorAll(".reveal").forEach((el) => el.classList.add("visible"));
}
