const WHATSAPP_NUMBER = "5493364566962";
const PRODUCTS_STORAGE_KEY = "nexum-products";
const CATEGORY_STORAGE_KEY = "nexum-categories";
const ADMIN_SESSION_KEY = "nexum-admin";
const ADMIN_PASSWORD = "nexum2026";

// --- DATOS Y CARGA ---
const defaultProducts = [
  { id: 1, name: "Smartwatch D 20", category: "smartwatch", price: 9000, stock: 1, colors: [{ name: "Negro", value: "#050505" }], description: "Reloj inteligente", image: "./assets/smartwatch-d20.png" },
  { id: 2, name: "Parlante GTS-1867", category: "parlantes", price: 15000, stock: 1, description: "Parlante portatil", image: "./assets/parlante-gts-1867.png" }
];

let products = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || [...defaultProducts];
let categories = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY)) || ["parlantes", "smartwatch", "cables", "adaptadores"];

// --- INICIALIZACIÓN PROTEGIDA ---
document.addEventListener("DOMContentLoaded", () => {
    
    // 1. Lógica de Login
    const loginForm = document.querySelector("#adminLoginForm");
    const adminPanel = document.querySelector("#adminPanel");
    const adminLogin = document.querySelector("#adminLogin");

    if (loginForm) {
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const pass = document.querySelector("#adminPassword")?.value;
            if (pass === ADMIN_PASSWORD) {
                localStorage.setItem(ADMIN_SESSION_KEY, "true");
                alert("Sesión iniciada");
                location.reload();
            } else {
                alert("Clave incorrecta");
            }
        });
    }

    // Mostrar/Ocultar panel según sesión
    if (localStorage.getItem(ADMIN_SESSION_KEY) === "true") {
        if (adminLogin) adminLogin.style.display = "none";
        if (adminPanel) adminPanel.style.display = "block";
    }

    // 2. Lógica de Guardado (Admin)
    const adminForm = document.querySelector("#adminForm");
    if (adminForm) {
        adminForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const form = e.target;
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
                description: form.querySelector("#adminDescription")?.value,
                image: "./assets/favicon.png"
            };

            products.push(newProduct);
            localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
            alert("Producto guardado");
            form.reset();
            refreshCatalog();
        });
    }

    // 3. Renderizado de Catálogo (Solo si existe el contenedor)
    function refreshCatalog() {
        const grid = document.querySelector("#productsGrid");
        if (!grid) return;
        
        grid.innerHTML = products.map(p => `
            <div class="product-card">
                <h3>${p.name}</h3>
                <p>$${p.price}</p>
            </div>
        `).join("");
    }

    refreshCatalog();
});

// --- FUNCIONES GLOBALES ---
function cerrarSesion() {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    location.reload();
}
