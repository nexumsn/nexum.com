const WHATSAPP_NUMBER = "5493364566962";
const PRODUCTS_STORAGE_KEY = "nexum-products";
const CATEGORY_STORAGE_KEY = "nexum-categories";
const ADMIN_SESSION_KEY = "nexum-admin";
const ADMIN_PASSWORD = "nexum2026";

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

const defaultCategoriesStrings = [
  "parlantes",
  "smartwatch",
  "cables",
  "adaptadores",
];

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

let products = loadProducts();

// --- LÓGICA DINÁMICA DE CATEGORÍAS ---
function loadCategories() {
  const savedCategories = localStorage.getItem(CATEGORY_STORAGE_KEY);
  let parsedCategories = [...defaultCategoriesStrings];

  if (savedCategories) {
    try {
      parsedCategories = JSON.parse(savedCategories);
    } catch {
      parsedCategories = [...defaultCategoriesStrings];
    }
  }

  return parsedCategories.map((catId) => {
    const productRef = products.find((p) => p.category === catId);
    return {
      id: catId,
      name: catId.charAt(0).toUpperCase() + catId.slice(1), 
      image: productRef ? productRef.image : "./assets/favicon.png",
    };
  });
}

let categories = loadCategories();
// ------------------------------------

const cart = new Map();

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

const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

function getCategoryName(categoryId) {
  return categories.find((category) => category.id === categoryId)?.name || categoryId;
}

function getCategoryFromHash() {
  const params = new URLSearchParams(window.location.hash.replace("#", ""));
  const categoryId = params.get("categoria");
  return categories.some((category) => category.id === categoryId) ? categoryId : null;
}

function setCategoryHash(categoryId) {
  if (categoryId) {
    window.location.hash = `categoria=${categoryId}`;
  } else {
    history.pushState("", document.title, window.location.pathname + window.location.search);
  }
}

function scrollCatalogToTop() {
  if (!catalogSection) return;
  requestAnimationFrame(() => {
    const headerHeight = document.querySelector(".site-header")?.offsetHeight || 0;
    const top = catalogSection.getBoundingClientRect().top + window.scrollY - headerHeight - 12;
    window.scrollTo({
      top: Math.max(top, 0),
      behavior: "smooth",
    });
  });
}

function renderCategories() {
  heroCarousel?.classList.remove("is-hidden");
  infoBand?.classList.remove("is-hidden");
  trustSection?.classList.remove("is-hidden");
  catalogTitle.textContent = "Productos";
  catalogDescription.textContent = "Elegi la categoria deseada.";
  productsGrid.className = "categories-grid";
  productsGrid.innerHTML = categories
    .map((category) => {
      const count = products.filter((product) => product.category === category.id).length;
      return `
        <button class="category-card" type="button" data-category="${category.id}">
          <img class="category-image" src="${category.image}" alt="${category.name}" />
          <span class="category-name">${category.name}</span>
          <span class="category-count">${count} producto${count === 1 ? "" : "s"}</span>
        </button>
      `;
    })
    .join("");
}

// --- MODIFICADO: Render de productos con validación de Stock ---
function renderProducts(categoryId) {
  const visibleProducts = products.filter((product) => product.category === categoryId);

  heroCarousel?.classList.add("is-hidden");
  infoBand?.classList.add("is-hidden");
  trustSection?.classList.add("is-hidden");
  catalogTitle.textContent = getCategoryName(categoryId);
  catalogDescription.textContent = "Productos disponibles en esta categoria.";
  productsGrid.className = "products-grid";
  productsGrid.innerHTML = `
    <div class="products-toolbar">
      <button class="back-button" type="button" data-back-categories>Volver a categorias</button>
    </div>
    ${visibleProducts
    .map(
      (product) => {
        // Validación de Stock
        const isOutOfStock = product.stock <= 0;
        const btnDisabled = isOutOfStock ? 'disabled' : '';
        const btnText = isOutOfStock ? 'Agotado' : 'Agregar';

        return `
        <article class="product-card" style="position: relative;">
          ${isOutOfStock ? `<span style="position: absolute; top: 0; left: 0; background: #4b5563; color: #fecaca; padding: 10px 20px; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; border-bottom-right-radius: 8px; z-index: 10; box-shadow: 2px 2px 5px rgba(0,0,0,0.2);">Sin Stock</span>` : ""}
          <img class="product-image" src="${product.image}" alt="${product.name}" />
          <div class="product-body">
            <span class="product-category">${getCategoryName(product.category)}</span>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <span class="stock-label">Stock disponible: ${product.stock}</span>
            ${
              product.colors
                ? `<div class="product-colors">
                    <span>${product.colors.length === 1 ? "Unico color disponible" : "Elegir color"}</span>
                    <div class="swatches" role="radiogroup" aria-label="Color de ${product.name}">
                      ${product.colors
                        .map(
                          (color, colorIndex) =>
                            `<label class="color-option" title="${color.name}">
                              <input
                                type="radio"
                                name="color-${product.id}"
                                value="${color.name}"
                                ${colorIndex === 0 ? "checked" : ""}
                              />
                              <span class="swatch" style="--swatch-color: ${color.value}" aria-hidden="true"></span>
                              <span>${color.name}</span>
                            </label>`,
                        )
                        .join("")}
                    </div>
                  </div>`
                : ""
            }
            <div class="product-bottom">
              <span class="price">${money.format(product.price)}</span>
              <button class="add-button" type="button" data-add="${product.id}" ${btnDisabled}>
                ${btnText}
              </button>
            </div>
          </div>
        </article>
      `;
      }
    )
    .join("")}
  `;
}

function showSlide(index) {
  if (!carouselTrack || carouselSlides.length === 0) return;
  currentSlide = (index + carouselSlides.length) % carouselSlides.length;
  carouselTrack.style.transform = `translateX(-${currentSlide * 100}%)`;

  carouselSlides.forEach((slide, slideIndex) => {
    slide.classList.toggle("is-active", slideIndex === currentSlide);
  });
  carouselDots.forEach((dot, dotIndex) => {
    dot.classList.toggle("is-active", dotIndex === currentSlide);
  });
}

function nextSlide() {
  showSlide(currentSlide + 1);
}

function startCarousel() {
  clearInterval(carouselTimer);
  carouselTimer = setInterval(nextSlide, 4500);
}

function getCartLines() {
  return [...cart.values()].map((item) => {
    const product = products.find((entry) => entry.id === item.id);
    return { ...product, cartKey: item.key, selectedColor: item.color, quantity: item.quantity };
  });
}

// --- MODIFICADO: Render de Carrito con validación en el botón "+" ---
function renderCart() {
  const lines = getCartLines();
  const totalQuantity = lines.reduce((sum, item) => sum + item.quantity, 0);
  const total = lines.reduce((sum, item) => sum + item.price * item.quantity, 0);

  cartCount.textContent = totalQuantity;
  cartTotal.textContent = money.format(total);
  checkoutButton.disabled = lines.length === 0;
  cartEmpty.hidden = lines.length > 0;

  cartItems.innerHTML = lines
    .map(
      (item) => `
        <article class="cart-item">
          <img src="${item.image}" alt="${item.name}" />
          <div>
            <h3>${item.name}</h3>
            <span class="cart-item-price">${money.format(item.price)} c/u</span>
            ${item.selectedColor ? `<span class="cart-item-color">Color: ${item.selectedColor}</span>` : ""}
            <div class="quantity-row">
              <div class="quantity-controls" aria-label="Cantidad de ${item.name}">
                <button type="button" data-decrease="${item.cartKey}" aria-label="Restar ${item.name}">-</button>
                <strong>${item.quantity}</strong>
                <button type="button" data-increase="${item.cartKey}" aria-label="Sumar ${item.name}" ${item.quantity >= item.stock ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>+</button>
              </div>
              <button class="remove-button" type="button" data-remove="${item.cartKey}">
                Quitar
              </button>
            </div>
          </div>
        </article>
      `,
    )
    .join("");
}

function getSelectedColor(productId) {
  const product = products.find((entry) => entry.id === productId);
  if (!product?.colors?.length) return "";
  return document.querySelector(`input[name="color-${productId}"]:checked`)?.value || product.colors[0].name;
}

function getCartKey(productId, colorName = "") {
  return colorName ? `${productId}-${colorName}` : String(productId);
}

// --- MODIFICADO: Agregar al carrito con límite de stock ---
function addToCart(productId, colorName = getSelectedColor(productId)) {
  const product = products.find((entry) => entry.id === productId);
  if (!product) return;

  const key = getCartKey(productId, colorName);
  const current = cart.get(key) || { id: productId, key, color: colorName, quantity: 0 };

  // Evitar agregar más del stock disponible
  if (current.quantity >= product.stock) {
    alert(`⚠️ Stock máximo alcanzado: Sólo quedan ${product.stock} unidades de ${product.name}.`);
    return;
  }

  cart.set(key, { ...current, quantity: current.quantity + 1 });
  renderCart();
  openCart();
}

// --- MODIFICADO: Sumar línea del carrito con límite de stock ---
function increaseCartLine(cartKey) {
  const current = cart.get(cartKey);
  if (!current) return;

  const product = products.find((entry) => entry.id === current.id);
  
  // Evitar sumar más del stock disponible
  if (current.quantity >= product.stock) {
    alert(`⚠️ Stock máximo alcanzado: Sólo quedan ${product.stock} unidades de ${product.name}.`);
    return;
  }

  cart.set(cartKey, { ...current, quantity: current.quantity + 1 });
  renderCart();
}

function decreaseFromCart(cartKey) {
  const current = cart.get(cartKey);
  if (!current) return;

  if (current.quantity === 1) {
    cart.delete(cartKey);
  } else {
    cart.set(cartKey, { ...current, quantity: current.quantity - 1 });
  }
  renderCart();
}

function openCart() {
  cartPanel.classList.add("is-open");
  cartPanel.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
}

function closeCart() {
  cartPanel.classList.remove("is-open");
  cartPanel.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
}

function buildWhatsAppMessage() {
  const lines = getCartLines();
  const total = lines.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const productLines = lines
    .map(
      (item) => {
        const colorText = item.selectedColor
          ? ` - Color: ${item.selectedColor}`
          : "";
        return `- ${item.name}${colorText} x${item.quantity}: ${money.format(item.price * item.quantity)}`;
      },
    )
    .join("\n");
  return `Hola! Quiero realizar este pedido:\n\n${productLines}\n\nTotal: ${money.format(total)}\n\nQuedo atento/a para coordinar.`;
}

function checkout() {
  if (cart.size === 0) return;
  const encodedMessage = encodeURIComponent(buildWhatsAppMessage());
  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`, "_blank");
}

function saveProducts() {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
}

function refreshCatalog() {
  categories = loadCategories();
  if (selectedCategory) {
    renderProducts(selectedCategory);
  } else {
    renderCategories();
  }
  renderCart();
  renderAdminProducts();
}

function parseAdminColors(value) {
  return value
    .split(",")
    .map((entry) => {
      const [name, colorValue] = entry.split(":").map((part) => part.trim());
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
  adminForm.reset();
  adminProductId.value = "";
}

function renderAdminProducts() {
  if (!adminProducts) return;
  adminProducts.innerHTML = products
    .map(
      (product) => `
        <article class="admin-product">
          <img src="${product.image}" alt="${product.name}" />
          <div>
            <h3>${product.name}</h3>
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
      `,
    )
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

  // 1. Buscamos el ID. Si está vacío, asume que es 0 (producto nuevo)
  const productId = Number(adminProductId.value) || 0;
  const currentProduct = products.find((entry) => entry.id === productId);
  
  // 2. Lógica a prueba de balas para la imagen
  let finalImage = "./assets/favicon.png"; // Fallback extremo
  
  if (adminImage.files && adminImage.files.length > 0) {
    // A) Si elegiste un archivo nuevo de tu PC en este momento, usa ese.
    finalImage = await readImageFile(adminImage.files[0]);
  } else if (currentProduct && currentProduct.image) {
    // B) Si NO subiste nada nuevo, pero el producto ya existía, ¡MANTIENE LA SUYA!
    finalImage = currentProduct.image;
  }

  const colors = parseAdminColors(adminColors.value);
  
  const product = {
    id: productId || Math.max(0, ...products.map((entry) => entry.id), 0) + 1,
    name: adminName.value.trim(),
    category: adminCategory.value,
    price: Number(adminPrice.value),
    stock: Number(adminStock.value),
    description: adminDescription.value.trim(),
    image: finalImage,
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
  
  // Te agrego un mensajito para que sepas que guardó bien
  alert("¡Producto actualizado correctamente!"); 
}

function deleteAdminProduct(productId) {
  const product = products.find((entry) => entry.id === productId);
  if (!product || !confirm(`Borrar ${product.name}?`)) return;

  products = products.filter((entry) => entry.id !== productId);
  [...cart.entries()].forEach(([key, item]) => {
    if (item.id === productId) cart.delete(key);
  });
  saveProducts();
  resetAdminForm();
  refreshCatalog();
}

function updateAdminPrice(productId, price) {
  products = products.map((product) =>
    product.id === productId ? { ...product, price } : product,
  );
  saveProducts();
  refreshCatalog();
}

function openAdminPanel() {
  adminPanel.hidden = false;
  renderAdminProducts();
}

function closeAdminPanel() {
  adminPanel.hidden = true;
}

function unlockAdmin() {
  localStorage.setItem(ADMIN_SESSION_KEY, "true");
  adminLogin.classList.add("is-hidden");
  adminOpen.classList.remove("is-hidden");
  openAdminPanel();
}

function initAdmin() {
  const params = new URLSearchParams(window.location.search);
  const requestedAdmin = params.get("admin") === "1";
  const isUnlocked = localStorage.getItem(ADMIN_SESSION_KEY) === "true";

  if (!requestedAdmin && !isUnlocked) return;
  if (isUnlocked) {
    adminOpen.classList.remove("is-hidden");
    if (requestedAdmin) openAdminPanel();
    return;
  }

  adminLogin.classList.remove("is-hidden");
  adminPassword.focus();
}

document.addEventListener("click", (event) => {
  const categoryId = event.target.closest("[data-category]")?.dataset.category;
  const backCategories = event.target.closest("[data-back-categories]");
  const addId = event.target.closest("[data-add]")?.dataset.add;
  const increaseId = event.target.closest("[data-increase]")?.dataset.increase;
  const decreaseId = event.target.closest("[data-decrease]")?.dataset.decrease;
  const removeId = event.target.closest("[data-remove]")?.dataset.remove;
  const adminEditId = event.target.closest("[data-admin-edit]")?.dataset.adminEdit;
  const adminDeleteId = event.target.closest("[data-admin-delete]")?.dataset.adminDelete;

  if (categoryId) {
    selectedCategory = categoryId;
    setCategoryHash(selectedCategory);
    renderProducts(selectedCategory);
    scrollCatalogToTop();
  }
  if (backCategories) {
    selectedCategory = null;
    setCategoryHash(null);
    renderCategories();
    scrollCatalogToTop();
  }
  if (addId) addToCart(Number(addId));
  if (increaseId) increaseCartLine(increaseId);
  if (decreaseId) decreaseFromCart(decreaseId);
  if (removeId) {
    cart.delete(removeId);
    renderCart();
  }
  if (adminEditId) fillAdminForm(Number(adminEditId));
  if (adminDeleteId) deleteAdminProduct(Number(adminDeleteId));
});

document.querySelector("#openCart").addEventListener("click", openCart);
document.querySelector("#closeCart").addEventListener("click", closeCart);
if (adminOpen && adminClose && adminClear && adminForm && adminLoginForm && adminProducts) {
  adminOpen.addEventListener("click", openAdminPanel);
  adminClose.addEventListener("click", closeAdminPanel);
  adminClear.addEventListener("click", resetAdminForm);
  adminForm.addEventListener("submit", saveAdminProduct);
  adminLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (adminPassword.value === ADMIN_PASSWORD) {
      unlockAdmin();
    } else {
      adminLoginMessage.textContent = "Clave incorrecta.";
    }
  });
  adminProducts.addEventListener("change", (event) => {
    const productId = event.target.dataset.adminPrice;
    if (!productId) return;

    updateAdminPrice(Number(productId), Number(event.target.value));
  });
}
if (overlay) overlay.addEventListener("click", closeCart);
if (checkoutButton) checkoutButton.addEventListener("click", checkout);
document.querySelector("#carouselPrev")?.addEventListener("click", () => {
  showSlide(currentSlide - 1);
  startCarousel();
});
document.querySelector("#carouselNext")?.addEventListener("click", () => {
  showSlide(currentSlide + 1);
  startCarousel();
});
carouselDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    showSlide(Number(dot.dataset.slide));
    startCarousel();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCart();
});

window.addEventListener("hashchange", () => {
  selectedCategory = getCategoryFromHash();

  if (selectedCategory) {
    renderProducts(selectedCategory);
    scrollCatalogToTop();
  } else {
    renderCategories();
    scrollCatalogToTop();
  }
});

selectedCategory = getCategoryFromHash();
if (selectedCategory) {
  renderProducts(selectedCategory);
  scrollCatalogToTop();
} else {
  renderCategories();
}
renderCart();
if (adminLogin && adminOpen) initAdmin();
showSlide(0);
startCarousel();
