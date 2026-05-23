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

    // --- 3. RENDERIZAR TABLA DE PRODUCTOS (CON EDITAR Y BORRAR) ---
    function renderAdminProducts() {
        if (!adminProductsContainer) return;
        const products = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || [...defaultProducts];
        
        if (products.length === 0) {
            adminProductsContainer.innerHTML = "<p>No hay productos cargados.</p>";
            return;
        }

        adminProductsContainer.innerHTML = `
            <h3 style="margin-top:20px;">Productos cargados:</h3>
            <table style="width:100%; border-collapse: collapse; margin-top: 10px; font-size: 14px;">
                <thead>
                    <tr style="background:#222; color:#fff; text-align:left;">
                        <th style="padding:10px;">Nombre</th>
                        <th style="padding:10px;">Categoría</th>
                        <th style="padding:10px;">Precio</th>
                        <th style="padding:10px;">Stock</th>
                        <th style="padding:10px; text-align:center;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    ${products.map(p => `
                        <tr style="border-bottom: 1px solid #ddd;">
                            <td style="padding:10px;"><strong>${p.name}</strong></td>
                            <td style="padding:10px;">${p.category}</td>
                            <td style="padding:10px;">$${p.price}</td>
                            <td style="padding:10px;">${p.stock} u.</td>
                            <td style="padding:10px; text-align:center;">
                                <button type="button" class="action-edit-btn" data-id="${p.id}" style="background:#007bff; color:#fff; border:none; padding:5px 10px; cursor:pointer; margin-right:5px; border-radius:3px;">Editar</button>
                                <button type="button" class="action-delete-btn" data-id="${p.id}" style="background:#dc3545; color:#fff; border:none; padding:5px 10px; cursor:pointer; border-radius:3px;">Borrar</button>
                            </td>
                        </tr>
                    `).join("")}
                </tbody>
            </table>
        `;
    }

    // --- 4. ACCIONES DINÁMICAS (EDITAR Y BORRAR) ---
    adminProductsContainer?.addEventListener("click", (e) => {
        const id = Number(e.target.dataset.id);
        if (!id) return;

        let products = JSON.parse(localStorage.getItem(PRODUCTS_STORAGE_KEY)) || [...defaultProducts];

        // Acción Borrar
        if (e.target.classList.contains("action-delete-btn")) {
            if (confirm("¿Seguro que querés eliminar este producto?")) {
                products = products.filter(p => p.id !== id);
                localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
                renderAdminProducts();
            }
        }

        // Acción Editar
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
                
                // Hacer foco en el formulario
                adminName?.focus();
                
                // Cambiar el texto del botón principal temporalmente si se desea
                const submitBtn = adminForm.querySelector('button[type="submit"]');
                if (submitBtn) submitBtn.textContent = "Actualizar producto";
            }
        }
    });

    // Botón Limpiar formulario
    adminClearBtn?.addEventListener("click", () => {
        if (adminForm) adminForm.reset();
        if (adminProductId) adminProductId.value = "";
        const submitBtn = adminForm?.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = "Guardar producto";
    });

    // --- 5. GUARDAR O ACTUALIZAR PRODUCTOS ---
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
            image: "./assets/favicon.png" // Podés expandir esto luego con el FileReader si lo usás
        };

        // Si tiene colores válidos, los procesamos
        if (adminColors && adminColors.value.trim() !== "") {
            productData.colors = adminColors.value.split(",").map(e => ({
                name: e.split(":")[0]?.trim(),
                value: e.split(":")[1]?.trim() || "#111"
            }));
        }

        const index = products.findIndex(p => p.id === id);
        if (index !== -1) {
            // Reemplazamos si ya existía (Modo Editar)
            products[index] = productData;
            alert("Producto actualizado correctamente");
        } else {
            // Añadimos nuevo si no existía (Modo Guardar)
            products.push(productData);
            alert("Producto guardado con éxito");
        }

        localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
        adminForm.reset();
        if (adminProductId) adminProductId.value = "";
        
        const submitBtn = adminForm.querySelector('button[type="submit"]');
        if (submitBtn) submitBtn.textContent = "Guardar producto";

        renderAdminProducts();
    });

    // Inicializaciones automáticas al cargar
    updateCategorySelect();
    renderAdminProducts();
});
