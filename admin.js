const ADMIN_PASSWORD = "nexum2026";
const ADMIN_SESSION_KEY = "nexum-admin";
const CATEGORY_STORAGE_KEY = "nexum-categories";
const PRODUCTS_STORAGE_KEY = "nexum-products";

document.addEventListener("DOMContentLoaded", () => {
    // 1. SELECTORES DE SEGURIDAD
    const adminLogin = document.querySelector("#adminLogin");
    const adminPanel = document.querySelector("#adminPanel");
    const adminForm = document.querySelector("#adminForm");
    const adminCategorySelect = document.querySelector("#adminCategory");
    const newCategoryInput = document.querySelector("#newCategory");
    const addCategoryBtn = document.querySelector("#addCategoryButton");
    const logoutBtn = document.querySelector("#logoutAdmin");

    // 2. GESTIÓN DE SESIÓN
    function checkSession() {
        const isLogged = localStorage.getItem(ADMIN_SESSION_KEY) === "true";
        if (adminLogin) adminLogin.style.display = isLogged ? "none" : "block";
        if (adminPanel) adminPanel.style.display = isLogged ? "block" : "none";
    }

    checkSession();

    // Login
    document.querySelector("#adminLoginForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        if (document.querySelector("#adminPassword")?.value === ADMIN_PASSWORD) {
            localStorage.setItem(ADMIN_SESSION_KEY, "true");
            checkSession();
        } else {
            alert("Clave incorrecta");
        }
    });

    // Logout
    logoutBtn?.addEventListener("click", () => {
        localStorage.removeItem(ADMIN_SESSION_KEY);
        location.reload();
    });

    // 3. LÓGICA DE CATEGORÍAS
    function updateCategorySelect() {
        if (!adminCategorySelect) return;
        const categories = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY)) || ["parlantes", "smartwatch", "cables", "adaptadores"];
        adminCategorySelect.innerHTML = categories.map(cat => `<option value="${cat}">${cat}</option>`).join("");
    }

    addCategoryBtn?.addEventListener("click", () => {
        const newCat = newCategoryInput.value.trim().toLowerCase();
        if (!newCat) return;
        const categories = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY)) || ["parlantes", "smartwatch", "cables", "adaptadores"];
        if (!categories.includes(newCat)) {
            categories.push(newCat);
            localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
            updateCategorySelect();
            newCategoryInput.value = "";
            alert("Categoría agregada");
        }
    });

    // 4. GUARDADO DE PRODUCTOS
    adminForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        const products = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || [];
        const newProduct = {
            id: Date.now(),
            name: document.querySelector("#adminName").value,
            category: adminCategorySelect.value,
            price: document.querySelector("#adminPrice").value,
            stock: document.querySelector("#adminStock").value,
            description: document.querySelector("#adminDescription").value
        };
        products.push(newProduct);
        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
        alert("Producto guardado");
        adminForm.reset();
    });

    // Inicializar select al cargar
    updateCategorySelect();
});
