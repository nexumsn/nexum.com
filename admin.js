const ADMIN_PASSWORD = "nexum2026";
const ADMIN_SESSION_KEY = "nexum-admin";
const CATEGORY_STORAGE_KEY = "nexum-categories";
const PRODUCTS_STORAGE_KEY = "nexum-products";

// --- DATOS INICIALES POR DEFECTO ---
const defaultProducts = [
  { id: 1, name: "Smartwatch D 20", category: "smartwatch", price: 9000, stock: 1, description: "Reloj inteligente", image: "./assets/smartwatch-d20.png" },
  { id: 2, name: "Parlante GTS-1867", category: "parlantes", price: 15000, stock: 1, description: "Parlante portatil", image: "./assets/parlante-gts-1867.png" },
  { id: 3, name: "Cable Lightning", category: "cables", price: 2900, stock: 1, description: "Cable USB a Lightning", image: "./assets/cable-lightning.png" },
  { id: 4, name: "Adaptador HUB USB", category: "adaptadores", price: 8200, stock: 3, description: "Hub USB multiple", image: "./assets/adaptador-hub-usb.png" },
  { id: 5, name: "Cable V8 (micro usb)", category: "cables", price: 1900, stock: 3, description: "Cable micro USB", image: "./assets/cable-v8-micro-usb.png" },
];

document.addEventListener("DOMContentLoaded", () => {
    // --- SELECTORES ---
    const adminLogin = document.querySelector("#adminLogin");
    const adminPanel = document.querySelector("#adminPanel");
    const adminForm = document.querySelector("#adminForm");
    const adminCategorySelect = document.querySelector("#adminCategory");
    const newCategoryInput = document.querySelector("#newCategory");
    const addCategoryBtn = document.querySelector("#addCategoryButton");
    const logoutBtn = document.querySelector("#logoutAdmin");
    const adminProductsContainer = document.querySelector("#adminProducts");

    // Campos del formulario
    const adminProductId = document.querySelector("#adminProductId");
    const adminName = document.querySelector("#adminName");
    const adminPrice = document.querySelector("#adminPrice");
    const adminStock = document.querySelector("#adminStock");
    const adminDescription = document.querySelector("#adminDescription");
    const adminColors = document.querySelector("#adminColors");
    const adminClearBtn = document.querySelector("#adminClear");

    // --- 1. GESTIÓN DE SESIÓN ---
    function checkSession() {
        const isLogged = localStorage.getItem(ADMIN_SESSION_KEY) === "true";
        if (adminLogin) adminLogin.style.display = isLogged ? "none" : "block";
        if (adminPanel) adminPanel.style.display = isLogged ? "block" : "none";
        if (isLogged) renderAdminProducts();
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

    // --- 2. LÓGICA DE CATEGORÍAS ---
    function updateCategorySelect() {
        if (!adminCategorySelect) return;
        const categories = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY)) || ["parlantes", "smartwatch", "cables", "adaptadores"];
        adminCategorySelect.innerHTML = categories.map(cat => `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`).join("");
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

    // --- 3. RENDERIZAR LISTADO DE PRODUCTOS (ABAJO DEL FORMULARIO) ---
    function renderAdminProducts() {
        if (!adminProductsContainer) return;
        const products = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || [...defaultProducts];
        
        if (products.length === 0) {
            adminProductsContainer.innerHTML = "<p style='padding: 20px; color: #666;'>No hay productos guardados todavía.</p>";
            return;
        }

        // Estilos e inyección de las tarjetas de producto
        adminProductsContainer.innerHTML = `
            <h3 style="margin: 30px 0 15px 0; font-size: 20px; border-top: 2px solid #eee; padding-top: 20px;">Productos cargados en Nexum</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; margin-top: 15px;">
                ${products.map(p => `
                    <div style="background: #fff; border: 1px solid #e0e0e0; border-radius: 8px; padding: 15px; display: flex; flex-direction: column; justify-content: space-between; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                        <div>
                            <h4 style="margin: 0 0 5px 0; font-size: 16px; color: #111;">${p.name}</h4>
                            <p style="margin: 0 0 10px 0; font-size: 13px; color: #666; text-transform: uppercase; font-weight: bold;">${p.category}</p>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 14px;">
                                <span style="color: #2e7d32; font-weight: bold;">$${p.price}</span>
                                <span style="color: #555;">Stock: <strong>${p.stock} u.</strong></span>
                            </div>
                        </div>
                        <div style="display: flex; gap: 10px; border-top: 1px solid #f0f0f0; padding-top: 10px;">
                            <button type="button" class="action-edit-btn" data-id="${p.id}" style="flex: 1; background: #007bff; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px;">Editar</button>
                            <button type="button" class="action-delete-btn" data-id="${p.id}" style="flex: 1; background: #dc3545; color: white; border: none; padding: 8px; border-radius: 4px; cursor: pointer; font-weight: bold; font-size: 13px;">Borrar</button>
                        </div>
                    </div>
                `).join("")}
            </div>
        `;
    }

    // --- 4. ACCIONES (EDITAR Y BORRAR) ---
    adminProductsContainer?.addEventListener("click", (e) => {
        const id = Number(e.target.dataset.id);
        if (!id) return;

        let products = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || [...defaultProducts];

        // Acción: Borrar
        if (e.target.classList.contains("action-delete-btn")) {
            if (confirm("¿Estás seguro de que querés eliminar este producto?")) {
                products = products.filter(p => p.id !== id);
                localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
                renderAdminProducts();
            }
        }

        // Acción: Editar
        if (e.target.classList.contains("action-edit-btn")) {
            const prod = products.find(p => p.id === id);
            if (prod) {
                if (adminProductId) adminProductId.value = prod.id;
                if (adminName) adminName.value = prod.name;
                if (adminCategorySelect) adminCategorySelect.value = prod.category;
                if (adminPrice) adminPrice.value = prod.price;
                if (adminStock) adminStock.value = prod.stock;
                if (adminDescription) adminDescription.value = prod.description || "";
                if (adminColors) adminColors.value = prod.colors ? prod.colors.map(c => `${c.name}:${c.value}`).join(",") : "";
                
                // Mover pantalla automáticamente al formulario arriba
                window.scrollTo({ top: 0, behavior: 'smooth' });
                adminName?.focus();
                
                const submitBtn = adminForm.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.textContent = "Actualizar producto";
            }
        }
    });

    // Botón Limpiar
    adminClearBtn?.addEventListener("click", () => {
        if (adminForm) adminForm.reset();
        if (adminProductId) adminProductId.value = "";
        const submitBtn = adminForm?.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = "Guardar producto";
    });

    // --- 5. ENVIAR FORMULARIO (GUARDAR O ACTUALIZAR) ---
    adminForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        let products = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || [...defaultProducts];
        
        const id = adminProductId.value ? Number(adminProductId.value) : Date.now();
        
        const productData = {
            id: id,
            name: adminName.value.trim(),
            category: adminCategorySelect.value,
            price: Number(adminPrice.value),
            stock: Number(adminStock.value),
            description: adminDescription.value.trim(),
            image: "./assets/favicon.png"
        };

        if (adminColors && adminColors.value.trim() !== "") {
            productData.colors = adminColors.value.split(",").map(el => ({
                name: el.split(":")[0]?.trim(),
                value: el.split(":")[1]?.trim() || "#111"
            }));
        }

        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = productData;
            alert("Producto actualizado con éxito.");
        } else {
            products.push(productData);
            alert("Producto guardado con éxito.");
        }

        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
        adminForm.reset();
        if (adminProductId) adminProductId.value = "";
        
        const submitBtn = adminForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = "Guardar producto";

        renderAdminProducts();
    });

    // Ejecuciones iniciales automáticas
    updateCategorySelect();
    renderAdminProducts();
});
