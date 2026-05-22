const WHATSAPP_NUMBER = "5493364566962";
const PRODUCTS_STORAGE_KEY = "nexum-products";
const CATEGORY_STORAGE_KEY = "nexum-categories";
const ADMIN_SESSION_KEY = "nexum-admin";
const ADMIN_PASSWORD = "nexum2026";

const defaultProducts = [
  { id: 1, name: "Smartwatch D 20", category: "smartwatch", price: 9000, stock: 1, colors: [{ name: "Negro", value: "#050505" }], description: "Reloj inteligente con pantalla tactil y funciones para uso diario.", image: "./assets/smartwatch-d20.png" },
  { id: 2, name: "Parlante GTS-1867", category: "parlantes", price: 15000, stock: 1, description: "Parlante portatil con diseno compacto, manija y luces de colores.", image: "./assets/parlante-gts-1867.png" },
  { id: 3, name: "Cable Lightning", category: "cables", price: 2900, stock: 1, description: "Cable USB a Lightning para carga y transferencia de datos.", image: "./assets/cable-lightning.png" },
  { id: 4, name: "Adaptador HUB USB", category: "adaptadores", price: 8200, stock: 3, description: "Hub USB multiple para conectar accesorios desde una sola entrada.", image: "./assets/adaptador-hub-usb.png" },
  { id: 5, name: "Cable V8 (micro usb)", category: "cables", price: 1900, stock: 3, colors: [{ name: "Violeta", value: "#6c37b8" }], description: "Cable micro USB reforzado para carga de celulares y accesorios.", image: "./assets/cable-v8-micro-usb.png" },
];

function loadProducts() {
  const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
  if (!savedProducts) return [...defaultProducts];
  try { return JSON.parse(savedProducts); } catch { return [...defaultProducts]; }
}

function loadCategories() {
  const saved = localStorage.getItem(CATEGORY_STORAGE_KEY);
  const catIds = saved ? JSON.parse(saved) : ["parlantes", "smartwatch", "cables", "adaptadores"];
  return catIds.map(id => ({
    id: id,
    name: id.charAt(0).toUpperCase() + id.slice(1),
    image: products.find(p => p.category === id)?.image || "./assets/favicon.png"
  }));
}

let products = loadProducts();
let categories = loadCategories();
const cart = new Map();

// --- SELECTORES ---
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
const adminOpen = document.querySelector("#adminOpen");
const adminClose = document.querySelector("#adminClose");
const adminPanel = document.querySelector("#adminPanel");
const adminLogin = document.querySelector("#adminLogin");
const adminLoginForm = document.querySelector("#adminLoginForm");
const adminPassword = document.querySelector("#adminPassword");
const adminLoginMessage = document.querySelector("#adminLoginMessage");
const adminForm = document.querySelector("#adminForm");
const adminProductId = document.querySelector("#adminProductId");
const adminName = document.querySelector("#adminName");
const adminCategory = document.querySelector("#adminCategory");
const adminPrice = document.querySelector("#adminPrice");
const adminStock = document.querySelector("#adminStock");
const adminDescription = document.querySelector("#adminDescription");
const adminColors = document.querySelector("#adminColors");
const adminImage = document.querySelector("#adminImage");
const adminClear = document.querySelector("#adminClear");
const adminProducts = document.querySelector("#adminProducts");

let currentSlide = 0;
let carouselTimer;
let selectedCategory = null;

const money = new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 0 });

function getCategoryName(categoryId) { return categories.find((c) => c.id === categoryId)?.name || categoryId; }
function getCategoryFromHash() {
  const params = new URLSearchParams(window.location.hash.replace("#", ""));
  const categoryId = params.get("categoria");
  return categories.some((c) => c.id === categoryId) ? categoryId : null;
}
function setCategoryHash(categoryId) {
  if (categoryId) window.location.hash = `categoria=${categoryId}`;
  else history.pushState("", document.title, window.location.pathname + window.location.search);
}

function refreshCatalog() {
  products = loadProducts();
  categories = loadCategories();
  if (selectedCategory) renderProducts(selectedCategory);
  else renderCategories();
  renderCart();
  renderAdminProducts();
}

function renderCategories() {
  heroCarousel?.classList.remove("is-hidden");
  infoBand?.classList.remove("is-hidden");
  trustSection?.classList.remove("is-hidden");
  catalogTitle.textContent = "Productos";
  catalogDescription.textContent = "Elegi la categoria deseada.";
  productsGrid.className = "categories-grid";
  productsGrid.innerHTML = categories.map((category) => {
    const count = products.filter((p) => p.category === category.id).length;
    return `<button class="category-card" type="button" data-category="${category.id}">
              <img class="category-image" src="${category.image}" alt="${category.name}" />
              <span class="category-name">${category.name}</span>
              <span class="category-count">${count} producto${count === 1 ? "" : "s"}</span>
            </button>`;
  }).join("");
}

function renderProducts(categoryId) {
  const visibleProducts = products.filter((p) => p.category === categoryId);
  heroCarousel?.classList.add("is-hidden");
  infoBand?.classList.add("is-hidden");
  trustSection?.classList.add("is-hidden");
  catalogTitle.textContent = getCategoryName(categoryId);
  catalogDescription.textContent = "Productos disponibles en esta categoria.";
  productsGrid.className = "products-grid";
  productsGrid.innerHTML = `
    <div class="products-toolbar"><button class="back-button" type="button" data-back-categories>Volver a categorias</button></div>
    ${visibleProducts.map((product) => `
        <article class="product-card">
          <img class="product-image" src="${product.image}" alt="${product.name}" />
          <div class="product-body">
            <span class="product-category">${getCategoryName(product.category)}</span>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <span class="stock-label">Stock disponible: ${product.stock}</span>
            ${product.colors ? `<div class="product-colors">
                <span>${product.colors.length === 1 ? "Unico color disponible" : "Elegir color"}</span>
                <div class="swatches">${product.colors.map((c, i) => `<label><input type="radio" name="color-${product.id}" value="${c.name}" ${i===0?'checked':''}> <span class="swatch" style="--swatch-color:${c.value}"></span> ${c.name}</label>`).join("")}</div>
            </div>` : ""}
            <div class="product-bottom">
              <span class="price">${money.format(product.price)}</span>
              <button class="add-button" type="button" data-add="${product.id}">Agregar</button>
            </div>
          </div>
        </article>`).join("")}`;
}

// FUNCIONES DE CARRITO, ADMIN Y CARROUSEL
function showSlide(index) {
  if (!carouselTrack || carouselSlides.length === 0) return;
  currentSlide = (index + carouselSlides.length) % carouselSlides.length;
  carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;
}
function startCarousel() { clearInterval(carouselTimer); carouselTimer = setInterval(() => showSlide(currentSlide + 1), 4500); }
function renderCart() { 
    const lines = [...cart.values()].map(item => ({...products.find(p => p.id === item.id), ...item}));
    cartItems.innerHTML = lines.map(i => `<article class="cart-item">...</article>`).join(""); // (Mantené tu lógica original aquí)
    cartCount.textContent = lines.reduce((s, i) => s + i.quantity, 0);
}
function parseAdminColors(v) { return v.split(",").map(e => ({ name: e.split(":")[0], value: e.split(":")[1] || "#111" })); }
function readImageFile(file) { return new Promise(res => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(file); }); }
function resetAdminForm() { adminForm.reset(); adminProductId.value = ""; }
function saveProducts() { localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products)); }

// LA FUNCIÓN DE GUARDADO CON LA LÓGICA DE CATEGORÍAS NUEVAS
async function saveAdminProduct(event) {
  event.preventDefault();
  const categoryValue = adminCategory.value.trim().toLowerCase();
  const savedCats = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY) || '["parlantes", "smartwatch", "cables", "adaptadores"]');
  if (!savedCats.includes(categoryValue)) {
    savedCats.push(categoryValue);
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(savedCats));
  }

  const productId = Number(adminProductId.value);
  const currentProduct = products.find((entry) => entry.id === productId);
  const imageFile = adminImage.files[0];
  const product = {
    id: productId || Math.max(0, ...products.map((entry) => entry.id), 0) + 1,
    name: adminName.value.trim(),
    category: categoryValue,
    price: Number(adminPrice.value),
    stock: Number(adminStock.value),
    description: adminDescription.value.trim(),
    image: imageFile ? await readImageFile(imageFile) : currentProduct?.image || "./assets/favicon.png",
    colors: parseAdminColors(adminColors.value)
  };

  products = currentProduct ? products.map(e => e.id === productId ? product : e) : [...products, product];
  saveProducts();
  resetAdminForm();
  refreshCatalog();
}

// EVENT LISTENERS AL FINAL
document.addEventListener("click", (e) => {
  const cat = e.target.closest("[data-category]")?.dataset.category;
  if (cat) { selectedCategory = cat; setCategoryHash(cat); renderProducts(cat); }
  if (e.target.closest("[data-back-categories]")) { selectedCategory = null; setCategoryHash(null); renderCategories(); }
});
adminForm.addEventListener("submit", saveAdminProduct);
// ... (resto de tus listeners originales)
refreshCatalog();
