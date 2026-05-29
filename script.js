const WHATSAPP_NUMBER = "5493364566962";

const CATEGORY_STORAGE_KEY = "nexum-categories";

const ADMIN_SESSION_KEY = "nexum-admin";

const ADMIN_PASSWORD = "nexum2026";



// Enlace de Google Sheets publicado como CSV

const GOOGLE_SHEET_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRtK_HnvsQnAbP1z_QNZiJ_6YHP403Kb7sUJDXN0SX-zei441nSCBHeV3niy8t6FZWoPCWSipQlZuUh/pub?output=csv";



let products = [];

let categories = [];

const cart = new Map();

let selectedCategory = null;

let currentSort = 'default'; // Guarda el orden de precio seleccionado



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

      if (char === '"') {

        inQuotes = !inQuotes;

      } else if (char === ',' && !inQuotes) {

        result.push(current.trim());

        current = '';

      } else {

        current += char;

      }

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

    const parsedRows = parseCSV(csvText);

    const dataRows = parsedRows.slice(1);

    

    return dataRows.map(row => {

      return {

        id: String(row[0]).trim(),

        name: row[1] || "Producto sin nombre",

        category: (row[2] || "general").toLowerCase().trim(),

        price: Number(row[3]) || 0,

        stock: Number(row[4]) || 0,

        description: row[5] || "",

        image: row[6] || "./assets/favicon.png",

        colors: row[7] ? parseAdminColors(row[7]) : null

      };

    });

  } catch (error) {

    console.error("Error cargando base de datos:", error);

    return [];

  }

}



function parseAdminColors(value) {

  if (!value) return null;

  return value

    .split(",")

    .map((entry) => {

      const parts = entry.split(":");

      const name = parts[0]?.trim();

      const colorValue = parts[1]?.trim();

      if (!name) return null;

      return { name, value: colorValue || "#111111" };

    })

    .filter(Boolean);

}



// 1. ACOMODAR CATEGORÍAS (Aquí elegís el orden del menú principal)

function loadCategories() {

  const order = ["auriculares", "smartwatch", "parlantes", "cables", "adaptadores"];

  

  const uniqueCategories = [...new Set(products.map(p => p.category))];

  

  return uniqueCategories.sort((a, b) => {

    const indexA = order.indexOf(a) === -1 ? 99 : order.indexOf(a);

    const indexB = order.indexOf(b) === -1 ? 99 : order.indexOf(b);

    return indexA - indexB;

  }).map((catId) => {

    const productRef = products.find((p) => p.category === catId);

    return {

      id: catId,

      name: catId.charAt(0).toUpperCase() + catId.slice(1), 

      image: productRef ? productRef.image : "./assets/favicon.png",

    };

  });

}



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

    window.scrollTo({ top: Math.max(top, 0), behavior: "smooth" });

  });

}



function renderCategories() {

  // Ocultar controles de ordenamiento de precio en el menú principal

  const sortingControls = document.getElementById('sortingControls');

  if (sortingControls) sortingControls.style.display = 'none';



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



// 2. MOSTRAR PRODUCTOS + ORDENAR POR PRECIO

function renderProducts(categoryId) {

  const visibleProducts = products.filter((product) => product.category === categoryId);



  // Aplicar filtro de ordenamiento por precio

  const sortedProducts = [...visibleProducts].sort((a, b) => {

    if (currentSort === 'price-low') return a.price - b.price;

    if (currentSort === 'price-high') return b.price - a.price;

    return 0; 

  });



  // Mostrar el menú desplegable de ordenamiento de precio

  const sortingControls = document.getElementById('sortingControls');

  if (sortingControls) sortingControls.style.display = 'flex';



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

    ${sortedProducts

    .map(

      (product) => {

        const isOutOfStock = product.stock <= 0;

        const btnDisabled = isOutOfStock ? 'disabled' : '';

        const btnText = isOutOfStock ? 'Agotado' : 'Agregar';



        return `

        <article class="product-card" style="position: relative;">

          ${isOutOfStock ? `<span style="position: absolute; top: 0; left: 0; background: #4b5563; color: #ff3333; padding: 10px 20px; font-size: 14px; font-weight: bold; text-transform: uppercase; letter-spacing: 1.5px; border-bottom-right-radius: 8px; z-index: 10; box-shadow: 2px 2px 5px rgba(0,0,0,0.2);">Sin Stock</span>` : ""}

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



function nextSlide() { showSlide(currentSlide + 1); }

function startCarousel() { clearInterval(carouselTimer); carouselTimer = setInterval(nextSlide, 4500); }



function getCartLines() {

  return [...cart.values()].map((item) => {

    const product = products.find((entry) => entry.id === item.id);

    return { ...product, cartKey: item.key, selectedColor: item.color, quantity: item.quantity };

  });

}



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

                <button type="button" data-decrease="${item.cartKey}">-</button>

                <strong>${item.quantity}</strong>

                <button type="button" data-increase="${item.cartKey}" ${item.quantity >= item.stock ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}>+</button>

              </div>

              <button class="remove-button" type="button" data-remove="${item.cartKey}">Quitar</button>

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



function getCartKey(productId, colorName = "") { return colorName ? `${productId}-${colorName}` : String(productId); }



function addToCart(productId, colorName = getSelectedColor(productId)) {

  const product = products.find((entry) => entry.id === productId);

  if (!product) return;



  const key = getCartKey(productId, colorName);

  const current = cart.get(key) || { id: productId, key, color: colorName, quantity: 0 };



  if (current.quantity >= product.stock) {

    alert(`⚠️ Stock máximo alcanzado: Sólo quedan ${product.stock} unidades.`);

    return;

  }



  cart.set(key, { ...current, quantity: current.quantity + 1 });

  renderCart();

  openCart();

}



function increaseCartLine(cartKey) {

  const current = cart.get(cartKey);

  if (!current) return;

  const product = products.find((entry) => entry.id === current.id);

  if (current.quantity >= product.stock) return;

  cart.set(cartKey, { ...current, quantity: current.quantity + 1 });

  renderCart();

}



function decreaseFromCart(cartKey) {

  const current = cart.get(cartKey);

  if (!current) return;

  if (current.quantity === 1) { cart.delete(cartKey); } else { cart.set(cartKey, { ...current, quantity: current.quantity - 1 }); }

  renderCart();

}



function openCart() { cartPanel.classList.add("is-open"); overlay.hidden = false; }

function closeCart() { cartPanel.classList.remove("is-open"); overlay.hidden = true; }



function buildWhatsAppMessage() {

  const lines = getCartLines();

  const total = lines.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const productLines = lines

    .map((item) => `${item.name}${item.selectedColor ? ` (Color: ${item.selectedColor})` : ""} x${item.quantity}: ${money.format(item.price * item.quantity)}`)

    .join("\n");

  return `Hola! Quiero realizar este pedido:\n\n${productLines}\n\nTotal: ${money.format(total)}\n\nQuedo atento/a para coordinar.`;

}



function checkout() {

  if (cart.size === 0) return;

  window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(buildWhatsAppMessage())}`, "_blank");

}



// CAPTURA DE EVENTOS DE CLICS

document.addEventListener("click", (event) => {

  const categoryId = event.target.closest("[data-category]")?.dataset.category;

  const backCategories = event.target.closest("[data-back-categories]");

  const addId = event.target.closest("[data-add]")?.dataset.add;

  const increaseId = event.target.closest("[data-increase]")?.dataset.increase;

  const decreaseId = event.target.closest("[data-decrease]")?.dataset.decrease;

  const removeId = event.target.closest("[data-remove]")?.dataset.remove;



  if (categoryId) { 

    selectedCategory = categoryId; 

    setCategoryHash(selectedCategory); 

    renderProducts(selectedCategory); 

    scrollCatalogToTop(); 

  }

  

  if (backCategories) { 

    // Resetear el menú desplegable visualmente al volver atrás

    const sortSelect = document.getElementById('sortSelect');

    if (sortSelect) sortSelect.value = 'default';



    currentSort = 'default'; 

    selectedCategory = null; 

    setCategoryHash(null); 

    renderCategories(); 

    scrollCatalogToTop(); 

  }

  

  if (addId) addToCart(String(addId)); 

  if (increaseId) increaseCartLine(increaseId);

  if (decreaseId) decreaseFromCart(decreaseId);

  if (removeId) { cart.delete(removeId); renderCart(); }

});



// CAPTURA DE CAMBIO EN EL MENÚ DESPLEGABLE

document.querySelector("#sortSelect")?.addEventListener("change", (event) => {

  currentSort = event.target.value;

  renderProducts(selectedCategory); // Recarga los productos con el nuevo orden seleccionado

  scrollCatalogToTop();

});



document.querySelector("#openCart").addEventListener("click", openCart);

document.querySelector("#closeCart").addEventListener("click", closeCart);

if (overlay) overlay.addEventListener("click", closeCart);

if (checkoutButton) checkoutButton.addEventListener("click", checkout);



document.querySelector("#carouselPrev")?.addEventListener("click", () => { showSlide(currentSlide - 1); startCarousel(); });

document.querySelector("#carouselNext")?.addEventListener("click", () => { showSlide(currentSlide + 1); startCarousel(); });

carouselDots.forEach((dot) => { dot.addEventListener("click", () => { showSlide(Number(dot.dataset.slide)); startCarousel(); }); });

document.addEventListener("keydown", (event) => { if (event.key === "Escape") closeCart(); });



window.addEventListener("hashchange", () => {

  selectedCategory = getCategoryFromHash();

  if (selectedCategory) { renderProducts(selectedCategory); } else { renderCategories(); }

  scrollCatalogToTop();

});



async function initApp() {

  products = await fetchProductsFromSheets();

  categories = loadCategories();



  selectedCategory = getCategoryFromHash();

  if (selectedCategory) {

    renderProducts(selectedCategory);

  } else {

    renderCategories();

  }

  renderCart();

  showSlide(0);

  startCarousel();

}



initApp(); 

