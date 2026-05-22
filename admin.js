const WHATSAPP_NUMBER = "5493364566962";
const PRODUCTS_STORAGE_KEY = "nexum-products";
const CATEGORY_STORAGE_KEY = "nexum-categories";
const ADMIN_SESSION_KEY = "nexum-admin";
const ADMIN_PASSWORD = "nexum2026";

// --- INICIALIZACIÓN ---
const defaultProducts = [
  { id: 1, name: "Smartwatch D 20", category: "smartwatch", price: 9000, stock: 1, colors: [{ name: "Negro", value: "#050505" }], description: "Reloj inteligente", image: "./assets/smartwatch-d20.png" },
  { id: 2, name: "Parlante GTS-1867", category: "parlantes", price: 15000, stock: 1, description: "Parlante portatil", image: "./assets/parlante-gts-1867.png" },
  { id: 3, name: "Cable Lightning", category: "cables", price: 2900, stock: 1, description: "Cable USB a Lightning", image: "./assets/cable-lightning.png" },
  { id: 4, name: "Adaptador HUB USB", category: "adaptadores", price: 8200, stock: 3, description: "Hub USB multiple", image: "./assets/adaptador-hub-usb.png" },
  { id: 5, name: "Cable V8 (micro usb)", category: "cables", price: 1900, stock: 3, colors: [{ name: "Violeta", value: "#6c37b8" }], description: "Cable micro USB", image: "./assets/cable-v8-micro-usb.png" },
];

let products = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || [...defaultProducts];
let categories = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY)) || ["parlantes", "smartwatch", "cables", "adaptadores"];
let selectedCategory = null;

// --- FUNCIONES PROTEGIDAS ---
function loadProducts() { return JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || [...defaultProducts]; }

function refreshCatalog() {
    products = loadProducts();
    const grid = document.querySelector("#productsGrid");
    if (!grid) return; // Si no hay grilla, salimos sin error
    
    if (selectedCategory) renderProducts(selectedCategory);
    else renderCategories();
}

function renderCategories() {
    const grid = document.querySelector("#productsGrid");
    if (!grid) return; // Protección
    
    grid.className = "categories-grid";
    grid.innerHTML = categories.map(cat => `
        <button class="category-card" data-category="${cat}">
            <span>${cat.charAt(0).toUpperCase() + cat.slice(1)}</span>
        </button>
    `).join("");
}

function renderProducts(cat) {
    const grid = document.querySelector("#productsGrid");
    if (!grid) return; // Protección
    
    const filtered = products.filter(p => p.category === cat);
    grid.className = "products-grid";
    grid.innerHTML = `<button data-back>Volver</button>` + filtered.map(p => `
        <div class="product-card"><h3>${p.name}</h3><p>$${p.price}</p></div>
    `).join("");
}

// --- LÓGICA DE GUARDADO ---
async function saveAdminProduct(e) {
    e.preventDefault();
    const form = e.target;
    // Usamos ?. para evitar errores si el campo no existe en el form
    const cat = form.querySelector("#adminCategory")?.value.toLowerCase();
    
    if (cat && !categories.includes(cat)) {
        categories.push(cat);
        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
    }

    const newProduct = {
        id: Date.now(),
        name: form.querySelector("#adminName")?.value,
        category: cat,
        price: Number(form.querySelector("#adminPrice")?.value),
        stock: Number(form.querySelector("#adminStock")?.value),
        description: form.querySelector("#adminDescription")?.value
    };

    products.push(newProduct);
    localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    alert("¡Guardado correctamente!");
    form.reset();
    refreshCatalog();
}

// --- ARRANQUE SEGURO ---
document.addEventListener("DOMContentLoaded", () => {
    // 1. Lógica de Login: solo se ejecuta si existe el form en el HTML actual
    const loginForm = document.querySelector("#adminLoginForm");
    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const pass = document.querySelector("#adminPassword")?.value;
            if (pass === ADMIN_PASSWORD) {
                localStorage.setItem(ADMIN_SESSION_KEY, "true");
                location.reload();
            } else { alert("Clave incorrecta"); }
        });
    }

    // 2. Lógica de Guardado: solo si existe adminForm
    const adminForm = document.querySelector("#adminForm");
    if (adminForm) {
        adminForm.addEventListener("submit", saveAdminProduct);
    }

    // 3. Navegación: delegada al document para que siempre funcione
    document.addEventListener("click", (e) => {
        const catBtn = e.target.closest("[data-category]");
        if (catBtn) {
            selectedCategory = catBtn.dataset.category;
            refreshCatalog();
        }
        if (e.target.closest("[data-back]")) {
            selectedCategory = null;
            refreshCatalog();
        }
    });

    // 4. Carga inicial
    refreshCatalog();
});
