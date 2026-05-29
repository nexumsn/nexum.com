const WHATSAPP_NUMBER = "5493364566962";
const CATEGORY_STORAGE_KEY = "nexum-categories";
const ADMIN_SESSION_KEY = "nexum-admin";
const ADMIN_PASSWORD = "nexum2026";

const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRtK_HnvsQnAbP1z_QNZiJ_6YHP403Kb7sUJDXN0SX-zei441nSCBHeV3niy8t6FZWoPCWSipQlZuUh/pub?output=csv";

let products = [];
let categories = [];
const cart = new Map();
let selectedCategory = null;
let currentSort = 'default';

const productsGrid = document.querySelector("#productsGrid");
const cartPanel = document.querySelector("#cartPanel");
const cartItems = document.querySelector("#cartItems");
const cartEmpty = document.querySelector("#cartEmpty");
const cartCount = document.querySelector("#cartCount");
const cartTotal = document.querySelector("#cartTotal");
const checkoutButton = document.querySelector("#checkoutButton");
const overlay = document.querySelector("#overlay");
const catalogTitle = document.querySelector("#catalogTitle");
const catalogDescription = document.querySelector("#catalogDescription");
const catalogSection = document.querySelector("#productos");
const heroCarousel = document.querySelector(".hero-carousel");
const infoBand = document.querySelector(".info-band");
const trustSection = document.querySelector(".trust-section");
const carouselTrack = document.querySelector("#carouselTrack");
const carouselDots = document.querySelectorAll(".carousel-dot");
const carouselSlides = document.querySelectorAll(".carousel-slide");

let currentSlide = 0;
let carouselTimer;

const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

function parseCSV(text) {
  const lines = text.split(/\r?\n/);
  return lines.filter(line => line.trim() !== "").map(line => {
    const result = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"') { inQuotes = !inQuotes; }
      else if (char === ',' && !inQuotes) { result.push(current.trim()); current = ''; }
      else { current += char; }
    }
    result.push(current.trim());
    return result;
  });
}

async function fetchProductsFromSheets() {
  try {
    const response = await fetch(GOOGLE_SHEET_CSV_URL);
    if (!response.ok) throw new Error("No se pudo conectar con Google Sheets");
    const csvText = await response.text();
    return parseCSV(csvText).slice(1).map(row => ({
      id: String(row[0]).trim(),
      name: row[1] || "Producto sin nombre",
      category: (row[2] || "general").toLowerCase().trim(),
      price: Number(row[3]) || 0,
      stock: Number(row[4]) || 0,
      description: row[5] || "",
      image: row[6] || "./assets/favicon.png",
      colors: row[7] ? parseAdminColors(row[7]) : null
    }));
  } catch (error) { console.error("Error cargando base de datos:", error); return []; }
}

function parseAdminColors(value) {
  if (!value) return null;
  return value.split(",").map((entry) => {
    const parts = entry.split(":");
    return { name: parts[0]?.trim(), value: parts[1]?.trim() || "#111111" };
  }).filter(Boolean);
}

function loadCategories() {
  const order = ["auriculares", "smartwatch", "parlantes", "cables", "adaptadores"];
  const uniqueCategories = [...new Set(products.map(p => p.category))];
  return uniqueCategories.sort((a, b) => {
    const indexA = order.indexOf(a) === -1 ? 99 : order.indexOf(a);
    const indexB = order.indexOf(b) === -1 ? 99 : order.indexOf(b);
    return indexA - indexB;
  }).map((catId) => ({
    id: catId,
    name: catId.charAt(0).toUpperCase() + catId.slice(1),
    image: products.find((p) => p.category === catId)?.image || "./assets/favicon.png",
  }));
}

function getCategoryName(categoryId) { return categories.find((c) => c.id === categoryId)?.name || categoryId; }
function getCategoryFromHash() {
  const params = new URLSearchParams(window.location.hash.replace("#", ""));
  const cat = params.get("categoria");
  return categories.some((c) => c.id === cat) ? cat : null;
}
function setCategoryHash(cat) { window.location.hash = cat ? `categoria=${cat}` : ""; }

function scrollCatalogToTop() {
  if (!catalogSection) return;
  const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
  window.scrollTo({ top: catalogSection.offsetTop - headerHeight - 20, behavior: "smooth" });
}

function renderCategories() {
  heroCarousel?.classList.remove("is-hidden");
  infoBand?.classList.remove("is-hidden");
  trustSection?.classList.remove("is-hidden");
  catalogTitle.textContent = "Productos";
  catalogDescription.textContent = "Elegi la categoria deseada.";
  productsGrid.className = "categories-grid";
  productsGrid.innerHTML = categories.map(cat => `
    <button class="category-card" type="button" data-category="${cat.id}">
      <img class="category-image" src="${cat.image}" alt="${cat.name}" />
      <span class="category-name">${cat.name}</span>
      <span class="category-count">${products.filter(p => p.category === cat.id).length} productos</span>
    </button>
  `).join("");
}

function renderProducts(categoryId) {
  const sortedProducts = [...products.filter(p => p.category === categoryId)].sort((a, b) => {
    if (currentSort === 'price-low') return a.price - b.price;
    if (currentSort === 'price-high') return b.price - a.price;
    return 0;
  });

  heroCarousel?.classList.add("is-hidden");
  infoBand?.classList.add("is-hidden");
  trustSection?.classList.add("is-hidden");
  catalogTitle.textContent = getCategoryName(categoryId);
  productsGrid.className = "products-grid";

  productsGrid.innerHTML = `
    <div class="products-toolbar">
      <button class="back-button" type="button" data-back-categories>Volver a categorias</button>
      <select id="sortSelect" class="sort-dropdown">
        <option value="default" ${currentSort === 'default' ? 'selected' : ''}>Ordenar por: Destacados</option>
        <option value="price-low" ${currentSort === 'price-low' ? 'selected' : ''}>Precio: Menor a Mayor</option>
        <option value="price-high" ${currentSort === 'price-high' ? 'selected' : ''}>Precio: Mayor a Menor</option>
      </select>
    </div>
    ${sortedProducts.map(p => `
      <article class="product-card">
        <img class="product-image" src="${p.image}" alt="${p.name}" />
        <div class="product-body">
          <h3>${p.name}</h3>
          <span class="price">${money.format(p.price)}</span>
          <button class="add-button" type="button" data-add="${p.id}" ${p.stock <= 0 ? 'disabled' : ''}>${p.stock <= 0 ? 'Agotado' : 'Agregar'}</button>
        </div>
      </article>
    `).join("")}
  `;
}

// Delegación de eventos para botones y cambios
document.addEventListener("click", (e) => {
  const catBtn = e.target.closest("[data-category]");
  if (catBtn) {
    selectedCategory = catBtn.dataset.category;
    setCategoryHash(selectedCategory);
    renderProducts(selectedCategory);
  }
  if (e.target.closest("[data-back-categories]")) {
    selectedCategory = null;
    currentSort = 'default';
    setCategoryHash(null);
    renderCategories();
  }
  if (e.target.dataset.add) addToCart(e.target.dataset.add);
});

document.addEventListener("change", (e) => {
  if (e.target.id === "sortSelect") {
    currentSort = e.target.value;
    renderProducts(selectedCategory);
  }
});

function addToCart(id) {
  const p = products.find(prod => prod.id === id);
  const key = String(id);
  const current = cart.get(key) || { id, quantity: 0 };
  if (current.quantity < p.stock) {
    cart.set(key, { ...current, quantity: current.quantity + 1 });
    renderCart();
    openCart();
  }
}

function renderCart() {
  const lines = [...cart.values()].map(item => ({ ...products.find(p => p.id === item.id), quantity: item.quantity }));
  cartCount.textContent = lines.reduce((s, i) => s + i.quantity, 0);
  cartTotal.textContent = money.format(lines.reduce((s, i) => s + (i.price * i.quantity), 0));
  cartEmpty.hidden = lines.length > 0;
  cartItems.innerHTML = lines.map(item => `
    <article class="cart-item">
      <h3>${item.name}</h3>
      <p>Cantidad: ${item.quantity}</p>
    </article>`).join("");
}

function openCart() { cartPanel.classList.add("is-open"); overlay.hidden = false; }
function closeCart() { cartPanel.classList.remove("is-open"); overlay.hidden = true; }

document.querySelector("#openCart")?.addEventListener("click", openCart);
document.querySelector("#closeCart")?.addEventListener("click", closeCart);
overlay?.addEventListener("click", closeCart);

async function initApp() {
  products = await fetchProductsFromSheets();
  categories = loadCategories();
  selectedCategory = getCategoryFromHash();
  selectedCategory ? renderProducts(selectedCategory) : renderCategories();
}

initApp();
