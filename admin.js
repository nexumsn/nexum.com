const PRODUCTS_STORAGE_KEY = "nexum-products";
const ADMIN_PASSWORD = "nexum2026";
const CATEGORY_STORAGE_KEY = "nexum-categories";

const defaultProducts = [
  {
    id: 1,
    name: "Smartwatch D 20",
    category: "smartwatch",
    price: 9000,
    stock: 1,
    colors: [{ name: "Negro", value: "#050505" }],
    description: "Reloj inteligente con pantalla tactil y funciones para uso diario.",
    image: "./assets/smartwatch-d20.png",
  },
  {
    id: 2,
    name: "Parlante GTS-1867",
    category: "parlantes",
    price: 15000,
    stock: 1,
    description: "Parlante portatil con diseno compacto, manija y luces de colores.",
    image: "./assets/parlante-gts-1867.png",
  },
  {
    id: 3,
    name: "Cable Lightning",
    category: "cables",
    price: 2900,
    stock: 1,
    description: "Cable USB a Lightning para carga y transferencia de datos.",
    image: "./assets/cable-lightning.png",
  },
  {
    id: 4,
    name: "Adaptador HUB USB",
    category: "adaptadores",
    price: 8200,
    stock: 3,
    description: "Hub USB multiple para conectar accesorios desde una sola entrada.",
    image: "./assets/adaptador-hub-usb.png",
  },
  {
    id: 5,
    name: "Cable V8 (micro usb)",
    category: "cables",
    price: 1900,
    stock: 3,
    colors: [{ name: "Violeta", value: "#6c37b8" }],
    description: "Cable micro USB reforzado para carga de celulares y accesorios.",
    image: "./assets/cable-v8-micro-usb.png",
  },
];

const defaultCategories = [
  "parlantes",
  "smartwatch",
  "cables",
  "adaptadores",
];

let products = loadProducts();
let categories = loadCategories();

// --- Selectores del DOM ---
const adminLogin = document.querySelector("#adminLogin");
const adminLoginForm = document.querySelector("#adminLoginForm");
const adminPassword = document.querySelector("#adminPassword");
const adminLoginMessage = document.querySelector("#adminLoginMessage");
const adminPanel = document.querySelector("#adminPanel");
const adminForm = document.querySelector("#adminForm");
const adminProductId = document.querySelector("#adminProductId");
const adminName = document.querySelector("#adminName");
const adminCategory = document.querySelector("#adminCategory");
const newCategory = document.querySelector("#newCategory");
const addCategoryButton = document.querySelector("#addCategoryButton");
const adminPrice = document.querySelector("#adminPrice");
const adminStock = document.querySelector("#adminStock");
const adminDescription = document.querySelector("#adminDescription");
const adminColors = document.querySelector("#adminColors");
const adminImage = document.querySelector("#adminImage");
const adminClear = document.querySelector("#adminClear");
const adminProducts = document.querySelector("#adminProducts");
const logoutAdmin = document.querySelector("#logoutAdmin");

const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

// --- Funciones de Carga y Guardado ---
function loadProducts() {
  const savedProducts = localStorage.getItem(PRODUCTS_STORAGE_KEY);
  if (!savedProducts) return [...defaultProducts];
  try {
    const parsedProducts = JSON.parse(savedProducts);
    return Array.isArray(parsedProducts) && parsedProducts.length > 0
      ? parsedProducts
      : [...defaultProducts];
  } catch {
    return [...defaultProducts];
  }
}

function loadCategories() {
  const savedCategories = localStorage.getItem(CATEGORY_STORAGE_KEY);
  if (!savedCategories) return [...defaultCategories];
  try {
    return JSON.parse(savedCategories);
  } catch {
    return [...defaultCategories];
  }
}

function saveProducts() {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

function saveCategories() {
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
}

// --- Helpers de Colores e Imágenes ---
function parseAdminColors(value) {
  if (!value) return [];
  return value
    .split(",")
    .map((entry) => {
      const parts = entry.split(":");
      if (parts.length < 2) return null;
      const name = parts[0].trim();
      const colorValue = parts[1].trim();
      if (!name) return null;
      return {
        name,
        value: colorValue || "#111111",
      };
    })
    .filter(Boolean);
}

function formatAdminColors(colors) {
  return colors?.map((color) => `${color.name}:${color.value}`).join(", ") || "";
}

function readImageFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function resetAdminForm() {
  if (adminForm) adminForm.reset();
  if (adminProductId) adminProductId.value = "";
}

// --- Renders de la interfaz ---
function renderAdminProducts() {
  if (!adminProducts) return;
  adminProducts.innerHTML = products
    .map(
      (product) => `
        <article class="admin-product">
          <img src="${product.image}" alt="${product.name}" />
          <div>
            <h3>${product.name}</h3>
            <span class="cart-item-price">${money.format(product.price)} - Stock: ${product.stock}</span>
            <div class="admin-product-actions">
              <input
                class="admin-price-input"
                type="number"
                min="0"
                step="1"
                value="${product.price}"
                data-admin-price="${product.id}"
                aria-label="Precio de ${product.name}"
              />
              <button class="back-button" type="button" data-admin-edit="${product.id}">Editar</button>
              <button class="remove-button" type="button" data-admin-delete="${product.id}">Borrar</button>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderCategories() {
  if (!adminCategory) return;
  adminCategory.innerHTML = categories
    .map((category) => `<option value="${category}">${category}</option>`)
    .join("");
}

function fillAdminForm(productId) {
  const product = products.find((entry) => entry.id === productId);
  if (!product) return;

  adminProductId.value = product.id;
  adminName.value = product.name;
  adminCategory.value = product.category;
  adminPrice.value = product.price;
  adminStock.value = product.stock;
  adminDescription.value = product.description;
  adminColors.value = formatAdminColors(product.colors);
  adminImage.value = "";
  adminName.focus();
}

async function saveAdminProduct(event) {
  event.preventDefault();

  const categoryValue = adminCategory.value.trim().toLowerCase();
  
  
  const categories = loadCategories(); 
  if (!categories.find(c => c.id === categoryValue)) {
    const savedCategories = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY) || "[]");
    savedCategories.push(categoryValue);
    localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(savedCategories));
  }

  const productId = Number(adminProductId.value);
  const currentProduct = products.find((entry) => entry.id === productId);
  const imageFile = adminImage.files[0];
  const colors = parseAdminColors(adminColors.value);
  
  const image = imageFile
    ? await readImageFile(imageFile)
    : currentProduct?.image || "./assets/favicon.png";

  const product = {
    id: productId || Math.max(0, ...products.map((entry) => entry.id), 0) + 1,
    name: adminName.value.trim(),
    category: categoryValue,
    price: Number(adminPrice.value),
    stock: Number(adminStock.value),
    description: adminDescription.value.trim(),
    image,
  };

  if (colors.length > 0) product.colors = colors;

  if (currentProduct) {
    products = products.map((entry) => (entry.id === productId ? product : entry));
  } else {
    products = [...products, product];
  }

  saveProducts();
  resetAdminForm();
  refreshCatalog();
}

function deleteAdminProduct(productId) {
  const product = products.find((entry) => entry.id === productId);
  if (!product || !confirm(`¿Borrar ${product.name}?`)) return;

  products = products.filter((entry) => entry.id !== productId);
  saveProducts();
  resetAdminForm();
  renderAdminProducts();
}

function updateAdminPrice(productId, price) {
  products = products.map((product) =>
    product.id === productId ? { ...product, price } : product
  );
  saveProducts();
  renderAdminProducts();
}

function addCategory() {
  if (!newCategory) return;
  const value = newCategory.value.trim().toLowerCase();
  if (!value) return;
  if (categories.includes(value)) return;

  categories.push(value);
  saveCategories();
  renderCategories();
  newCategory.value = "";
}

// --- Autenticación ---
function unlockAdmin() {
  localStorage.setItem("nexum-admin", "true");
  if (adminLogin) adminLogin.style.display = "none";
  if (adminPanel) adminPanel.style.display = "grid"; 
  renderAdminProducts();
  renderCategories();
}

function lockAdmin() {
  localStorage.removeItem("nexum-admin");
  if (adminPanel) adminPanel.style.display = "none";
  if (adminLogin) adminLogin.style.display = "flex";
  if (adminPassword) {
    adminPassword.value = "";
    adminPassword.focus();
  }
}

// --- Event Listeners ---
if (adminLoginForm) {
  adminLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (adminPassword.value === ADMIN_PASSWORD) {
      unlockAdmin();
    } else {
      if (adminLoginMessage) adminLoginMessage.textContent = "Clave incorrecta.";
    }
  });
}

if (logoutAdmin) {
  logoutAdmin.addEventListener("click", lockAdmin);
}

if (adminForm) adminForm.addEventListener("submit", saveAdminProduct);
if (adminClear) adminClear.addEventListener("click", resetAdminForm);
if (addCategoryButton) addCategoryButton.addEventListener("click", addCategory);

if (adminProducts) {
  adminProducts.addEventListener("click", (event) => {
    const editId = event.target.closest("[data-admin-edit]")?.dataset.adminEdit;
    const deleteId = event.target.closest("[data-admin-delete]")?.dataset.adminDelete;

    if (editId) fillAdminForm(Number(editId));
    if (deleteId) deleteAdminProduct(Number(deleteId));
  });

  adminProducts.addEventListener("change", (event) => {
    const productId = event.target.dataset.adminPrice;
    if (!productId) return;
    updateAdminPrice(Number(productId), Number(event.target.value));
  });
}

// --- Estado de sesión Inicial ---
if (localStorage.getItem("nexum-admin") === "true") {
  unlockAdmin();
} else {
  lockAdmin();
}
