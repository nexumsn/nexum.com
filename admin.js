/** * ARCHIVO: script.js 
 * Lógica unificada: Catálogo, Admin, Carrito y Protección de Errores.
 */

const WHATSAPP_NUMBER = "5493364566962";
const PRODUCTS_STORAGE_KEY = "nexum-products";
const CATEGORY_STORAGE_KEY = "nexum-categories";
const ADMIN_SESSION_KEY = "nexum-admin";
const ADMIN_PASSWORD = "nexum2026";

// --- DATOS INICIALES ---
const defaultProducts = [
  { id: 1, name: "Smartwatch D 20", category: "smartwatch", price: 9000, stock: 1, description: "Reloj inteligente", image: "./assets/smartwatch-d20.png" },
  { id: 2, name: "Parlante GTS-1867", category: "parlantes", price: 15000, stock: 1, description: "Parlante portatil", image: "./assets/parlante-gts-1867.png" }
];

let products = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || [...defaultProducts];
let categories = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY)) || ["parlantes", "smartwatch", "cables", "adaptadores"];
let selectedCategory = null;

// --- INICIALIZACIÓN PROTEGIDA ---
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. GESTIÓN DE SESIÓN ADMIN
    const adminPanel = document.querySelector("#adminPanel");
    const adminLogin = document.querySelector("#adminLogin");
    const adminForm = document.querySelector("#adminForm");
    const loginForm = document.querySelector("#adminLoginForm");

    function checkSession() {
        const isLogged = localStorage.getItem(ADMIN_SESSION_KEY) === "true";
        if (adminLogin) adminLogin.style.display = isLogged ? "none" : "block";
        if (adminPanel) adminPanel.style.display = isLogged ? "block" : "none";
        if (adminForm) adminForm.style.display = isLogged ? "block" : "none";
    }

    checkSession(); // Verificar al cargar

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const pass = document.querySelector("#adminPassword")?.value;
            if (pass === ADMIN_PASSWORD) {
                localStorage.setItem(ADMIN_SESSION_KEY, "true");
                alert("Sesión iniciada");
                checkSession();
            } else {
                alert("Clave incorrecta");
            }
        });
    }

    // 2. GUARDADO DE PRODUCTOS
    if (adminForm) {
        adminForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const newProduct = {
                id: Date.now(),
                name: document.querySelector("#adminName")?.value,
                category: document.querySelector("#adminCategory")?.value.toLowerCase(),
                price: Number(document.querySelector("#adminPrice")?.value),
                stock: Number(document.querySelector("#adminStock")?.value),
                description: document.querySelector("#adminDescription")?.value
            };
            products.push(newProduct);
            localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
            alert("Producto guardado");
            adminForm.reset();
            refreshCatalog();
        });
    }

    // 3. RENDERIZADO (Con validación de existencia)
    function refreshCatalog() {
        const grid = document.querySelector("#productsGrid");
        if (!grid) return; // Si no hay grilla en esta página, no hacer nada

        grid.innerHTML = selectedCategory 
            ? renderProducts(selectedCategory) 
            : renderCategories();
    }

    function renderCategories() {
        return categories.map(cat => `
            <button class="category-card" data-category="${cat}">
                <span>${cat.toUpperCase()}</span>
            </button>
        `).join("");
    }

    function renderProducts(cat) {
        const filtered = products.filter(p => p.category === cat);
        return `<button data-back>Volver</button>` + filtered.map(p => `
            <div class="product-card"><h3>${p.name}</h3><p>$${p.price}</p></div>
        `).join("");
    }

    // 4. DELEGACIÓN DE CLICS (Funciona aunque el botón se cree después)
    document.addEventListener("click", (e) => {
        const catBtn = e.target.closest("[data-category]");
        const backBtn = e.target.closest("[data-back]");
        
        if (catBtn) {
            selectedCategory = catBtn.dataset.category;
            refreshCatalog();
        }
        if (backBtn) {
            selectedCategory = null;
            refreshCatalog();
        }
    });

    refreshCatalog();
});
