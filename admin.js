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
    const adminLogin = document.querySelector("#adminLogin");
    const adminPanel = document.querySelector("#adminPanel");
    const adminForm = document.querySelector("#adminForm");
    const adminCategorySelect = document.querySelector("#adminCategory");
    const newCategoryInput = document.querySelector("#newCategory");
    const addCategoryBtn = document.querySelector("#addCategoryButton");
    const categoryAddContainer = document.querySelector(".admin-category-add");
    const logoutBtn = document.querySelector("#logoutAdmin");
    const adminProductsContainer = document.querySelector("#adminProducts");

    const adminProductId = document.querySelector("#adminProductId");
    const adminName = document.querySelector("#adminName");
    const adminPrice = document.querySelector("#adminPrice");
    const adminStock = document.querySelector("#adminStock");
    const adminDescription = document.querySelector("#adminDescription");
    const adminColors = document.querySelector("#adminColors");
    const adminClearBtn = document.querySelector("#adminClear");

    function checkSession() {
        const isLogged = localStorage.getItem(ADMIN_SESSION_KEY) === "true";
        if (adminLogin) adminLogin.style.display = isLogged ? "none" : "block";
        if (adminPanel) adminPanel.style.display = isLogged ? "block" : "none";
        
        if (isLogged) {
            updateCategorySelect();
            renderAdminProducts();
            crearBotonBorrarCategoria();
        }
    }

    function updateCategorySelect() {
        if (!adminCategorySelect) return;
        try {
            let categories = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY));
            if (!Array.isArray(categories)) categories = ["parlantes", "smartwatch", "cables", "adaptadores"];
            
            const safeCategories = categories.filter(cat => cat && typeof cat === 'string');
            const valorActual = adminCategorySelect.value;
            
            adminCategorySelect.innerHTML = safeCategories.map(cat => 
                `<option value="${cat}">${cat.charAt(0).toUpperCase() + cat.slice(1)}</option>`
            ).join("");

            if (safeCategories.includes(valorActual)) {
                adminCategorySelect.value = valorActual;
            }
        } catch (e) {
            console.error("Error:", e);
        }
    }

    function crearBotonBorrarCategoria() {
        if (!categoryAddContainer || document.querySelector("#deleteCatBtn")) return;

        const deleteCatBtn = document.createElement("button");
        deleteCatBtn.id = "deleteCatBtn";
        deleteCatBtn.type = "button";
        deleteCatBtn.textContent = "Borrar seleccionada";
        
        deleteCatBtn.style.cssText = `
            background-color: #ef4444; color: #ffffff; border: none; padding: 8px 12px; 
            font-size: 13px; font-weight: 600; cursor: pointer; border-radius: 4px; 
            margin-top: 8px; width: 100%; transition: background-color 0.2s;
        `;
        categoryAddContainer.appendChild(deleteCatBtn);

        deleteCatBtn.addEventListener("click", () => {
            const catToDelete = adminCategorySelect.value;
            if (!catToDelete) return;

            let currentProducts = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || [];
            if (currentProducts.some(p => p.category === catToDelete)) {
                alert(`⚠️ No podés borrar "${catToDelete.toUpperCase()}" porque hay productos usándola.`);
                return;
            }

            if (confirm(`¿Eliminar la categoría "${catToDelete.toUpperCase()}"?`)) {
                let currentCategories = JSON.parse(localStorage.getItem(CATEGORY_STORAGE_KEY)) || [];
                localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(currentCategories.filter(c => c !== catToDelete)));
                updateCategorySelect();
            }
        });
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
        }
    });

    function renderAdminProducts() {
        if (!adminProductsContainer) return;
        adminProductsContainer.style.display = "block"; 

        try {
            let products = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY));
            if (!Array.isArray(products)) products = [...defaultProducts];
            
            const safeProducts = products.filter(p => p && p.id && p.name);

            if (safeProducts.length === 0) {
                adminProductsContainer.innerHTML = `<div style="padding: 20px; text-align: center;">Inventario vacío</div>`;
                return;
            }

            adminProductsContainer.innerHTML = `
                <div style="margin-top: 40px; border-top: 2px solid #eee; padding-top: 20px;">
                    <h3 style="margin-bottom: 20px; font-size: 18px; color: #111;">Inventario</h3>
                    <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 15px;">
                        ${safeProducts.map(p => `
                            <div style="background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05); display: flex; flex-direction: column;">
                                <img src="${p.image || './assets/favicon.png'}" alt="Foto" style="width: 100%; height: 140px; object-fit: contain; background: #f8f9fa; border-radius: 6px; margin-bottom: 12px; border: 1px solid #eee;" />
                                
                                <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                                    <h4 style="margin: 0; font-size: 16px; color: #0f172a;">${p.name}</h4>
                                </div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 14px;">
                                    <span style="color: #10b981; font-weight: bold;">$${p.price}</span>
                                    <span style="color: #64748b;">Stock: <strong>${p.stock}</strong></span>
                                </div>
                                <div style="display: flex; gap: 8px; border-top: 1px solid #f1f5f9; padding-top: 12px;">
                                    <button type="button" class="action-edit-btn" data-id="${p.id}" style="flex: 1; background: #0f172a; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer;">Editar</button>
                                    <button type="button" class="action-delete-btn" data-id="${p.id}" style="flex: 1; background: #ef4444; color: white; border: none; padding: 8px; border-radius: 6px; cursor: pointer;">Borrar</button>
                                </div>
                            </div>
                        `).join("")}
                    </div>
                </div>
            `;
        } catch (e) {
            adminProductsContainer.innerHTML = "<p style='color:red;'>Error al cargar los productos.</p>";
        }
    }

    adminProductsContainer?.addEventListener("click", (e) => {
        const id = Number(e.target.dataset.id);
        if (!id) return;

        let products = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || [];

        if (e.target.classList.contains("action-delete-btn")) {
            if (confirm(`¿Confirmás la eliminación?`)) {
                localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products.filter(p => p.id !== id)));
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
                
                window.scrollTo({ top: 0, behavior: 'smooth' });
                const submitBtn = adminForm.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.textContent = "Actualizar producto";
            }
        }
    });

    adminForm?.addEventListener("submit", (e) => {
        e.preventDefault();
        let products = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY));
        if (!Array.isArray(products)) products = [...defaultProducts];
        
        const id = adminProductId.value ? Number(adminProductId.value) : Date.now();
        const index = products.findIndex(p => p.id === id);
        
        const productData = {
            id: id,
            name: adminName.value.trim(),
            category: adminCategorySelect.value,
            price: Number(adminPrice.value),
            stock: Number(adminStock.value),
            description: adminDescription.value.trim()
        };

        const imageInput = document.querySelector("#adminImage");

        const saveProduct = (finalImage) => {
            productData.image = finalImage;

            if (index !== -1) {
                products[index] = { ...products[index], ...productData };
            } else {
                products.push(productData);
            }

            try {
                // ACÁ ESTÁ EL SEGURO DE PESO DE IMAGEN
                localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
                adminForm.reset();
                if (adminProductId) adminProductId.value = "";
                const submitBtn = adminForm.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.textContent = "Guardar producto";
                renderAdminProducts();
            } catch (error) {
                alert("❌ ERROR: La imagen es demasiado pesada y el sistema se quedó sin espacio. Probá con una foto de menor calidad (menos de 500kb idealmente).");
            }
        };

        if (imageInput && imageInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function(event) {
                saveProduct(event.target.result); 
            };
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            let imageToSave = "./assets/favicon.png"; 
            if (index !== -1 && products[index].image) {
                imageToSave = products[index].image; 
            }
            saveProduct(imageToSave);
        }
    });

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
