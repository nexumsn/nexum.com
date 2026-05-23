const ADMIN_PASSWORD = "nexum2026";
const ADMIN_SESSION_KEY = "nexum-admin";
const CATEGORY_STORAGE_KEY = "nexum-categories";
const PRODUCTS_STORAGE_KEY = "nexum-products";

// --- DATOS INICIALES ---
const defaultProducts = [
  { id: 1, name: "Smartwatch D 20", category: "smartwatch", price: 9000, stock: 1, description: "Reloj inteligente", image: "./assets/smartwatch-d20.png" },
  { id: 2, name: "Parlante GTS-1867", category: "parlantes", price: 15000, stock: 1, description: "Parlante portatil", image: "./assets/parlante-gts-1867.png" }
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
        
        if (isLogged) {
            updateCategorySelect();
            renderAdminProducts();
        }
    }

    // --- 2. LÓGICA DE CATEGORÍAS (Con Borrado Seguro) ---
    function updateCategorySelect() {
        if (!adminCategorySelect) return;
        try {
            let categories = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY));
            if (!Array.isArray(categories)) categories = ["parlantes", "smartwatch", "cables", "adaptadores"];
            
            const safeCategories = categories.filter(cat => cat && typeof cat === 'string');
            
            adminCategorySelect.innerHTML = safeCategories.map(cat => 
                `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`
            ).join("");

            // Crear botón de borrar categoría si no existe en el HTML
            let deleteCatBtn = document.querySelector("#deleteCatBtn");
            if (!deleteCatBtn) {
                deleteCatBtn = document.createElement("button");
                deleteCatBtn.id = "deleteCatBtn";
                deleteCatBtn.type = "button";
                deleteCatBtn.textContent = "Borrar esta categoría";
                deleteCatBtn.style.cssText = "background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-size: 12px; margin-top: 10px; display: block; font-weight: bold;";
                
                adminCategorySelect.insertAdjacentElement("afterend", deleteCatBtn);

                deleteCatBtn.addEventListener("click", () => {
                    const catToDelete = adminCategorySelect.value;
                    if (!catToDelete) return;

                    // Validación de seguridad
                    let currentProducts = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || [];
                    const isUsed = currentProducts.some(p => p.category === catToDelete);

                    if (isUsed) {
                        alert(`⚠️ No podés borrar "${catToDelete.toUpperCase()}" porque hay productos usándola. Cambiale la categoría a esos productos o borralos primero.`);
                        return;
                    }

                    if (confirm(`¿Seguro que querés eliminar la categoría "${catToDelete.toUpperCase()}"?`)) {
                        let currentCategories = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY)) || [];
                        currentCategories = currentCategories.filter(c => c !== catToDelete);
                        localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(currentCategories));
                        updateCategorySelect();
                        alert("Categoría eliminada con éxito.");
                    }
                });
            }
        } catch (e) {
            console.error("Error cargando categorías:", e);
        }
    }

    addCategoryBtn?.addEventListener("click", () => {
        const newCat = newCategoryInput.value.trim().toLowerCase();
        if (!newCat) return;
        let categories = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY)) || ["parlantes", "smartwatch", "cables", "adaptadores"];
        if (!categories.includes(newCat)) {
            categories.push(newCat);
            localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
            updateCategorySelect();
            newCategoryInput.value = "";
            alert("Categoría agregada");
        }
    });

    // --- 3. RENDERIZAR LISTA DE PRODUCTOS ---
    function renderAdminProducts() {
        if (!adminProductsContainer) return;
        adminProductsContainer.style.display = "block"; 

        try {
            let products = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY));
            if (!Array.isArray(products)) products = [...defaultProducts];
            
            const safeProducts = products.filter(p => p && p.id && p.name);

            if (safeProducts.length === 0) {
                adminProductsContainer.innerHTML = `
                    <div style="margin-top: 40px; padding: 20px; background: #f8f9fa; border: 1px dashed #ccc; border-radius: 8px; text-align: center;">
                        <h3 style="margin-bottom: 10px; color: #333;">No hay productos</h3>
                        <p style="color: #666; margin: 0;">Los productos que agregues aparecerán aquí.</p>
                    </div>`;
                return;
            }

            adminProductsContainer.innerHTML = `
                <div style="margin-top: 40px; border-top: 2px solid #eee; padding-top: 20px;">
                    <h3 style="margin-bottom: 20px; font-size: 18px; color: #111;">Inventario de Nexum</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 15px;">
                        ${safeProducts.map(p => `
                            <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column; justify-content: space-between;">
                                <div>
                                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                                        <h4 style="margin: 0; font-size: 16px; color: #0f172a;">${p.name}</h4>
                                        <span style="background: #f1f5f9; color: #475569; padding: 2px 8px; border-radius: 12px; font-size: 11px; text-transform: uppercase; font-weight: bold;">${p.category}</span>
                                    </div>
                                    <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 14px;">
                                        <span style="color: #10b981; font-weight: bold;">$${p.price}</span>
                                        <span style="color: #64748b;">Stock: <strong>${p.stock}</strong></span>
                                    </div>
                                </div>
                                <div style="display: flex; gap: 8px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                                    <button type="button" class="action-edit-btn" data-id="${p.id}" style="flex: 1; background: #0f172a; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: background 0.2s;">Editar</button>
                                    <button type="button" class="action-delete-btn" data-id="${p.id}" style="flex: 1; background: #ef4444; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer; font-size: 13px; font-weight: 600; transition: background 0.2s;">Borrar</button>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `;
        } catch (e) {
            console.error("Error renderizando productos:", e);
            adminProductsContainer.innerHTML = "<p style='color:red;'>Error al cargar los productos. Revisá la consola.</p>";
        }
    }

    // --- 4. EVENTOS DE ACCIÓN (EDITAR Y BORRAR) ---
    adminProductsContainer?.addEventListener("click", (e) => {
        const id = Number(e.target.dataset.id);
        if (!id) return;

        let products = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || [];

        if (e.target.classList.contains("action-delete-btn")) {
            if (confirm(`¿Seguro que querés eliminar este producto?`)) {
                products = products.filter(p => p.id !== id);
                localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
                renderAdminProducts();
            }
        }

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
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
                adminName?.focus();
                
                const submitBtn = adminForm.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.textContent = "Actualizar producto";
            }
        }
    });

    // --- 5. GUARDAR Y ACTUALIZAR FORMULARIO ---
    adminForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        let products = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY));
        if (!Array.isArray(products)) products = [...defaultProducts];
        
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

        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            products[index] = productData;
            alert("Producto actualizado");
        } else {
            products.push(productData);
            alert("Producto guardado");
        }

        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
        adminForm.reset();
        if (adminProductId) adminProductId.value = "";
        
        const submitBtn = adminForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = "Guardar producto";

        renderAdminProducts();
    });

    // --- RESTO DE EVENTOS ---
    adminClearBtn?.addEventListener("click", () => {
        if (adminForm) adminForm.reset();
        if (adminProductId) adminProductId.value = "";
        const submitBtn = adminForm?.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = "Guardar producto";
    });

    document.querySelector("#adminLoginForm")?.addEventListener("submit", (e) => {
        e.preventDefault();
        if (document.querySelector("#adminPassword")?.value === ADMIN_PASSWORD) {
            localStorage.setItem(ADMIN_SESSION_KEY, "true");
            checkSession();
        } else {
            alert("Clave incorrecta");
        }
    });

    logoutBtn?.addEventListener("click", () => {
        localStorage.removeItem(ADMIN_SESSION_KEY);
        location.reload();
    });

    checkSession();
});
