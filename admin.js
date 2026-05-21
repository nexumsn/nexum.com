const PRODUCTS_STORAGE_KEY = "nexum-products";
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

let products = loadProducts();

const adminLogin = document.querySelector("#adminLogin");
const adminLoginForm = document.querySelector("#adminLoginForm");
const adminPassword = document.querySelector("#adminPassword");
const adminLoginMessage = document.querySelector("#adminLoginMessage");
const adminPanel = document.querySelector("#adminPanel");
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

const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

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

function saveProducts() {
  localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
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
  adminProducts.innerHTML = products
    .map(
      (product) => `
        <article class="admin-product">
          <img src="${product.image}" alt="${product.name}" />
          <div>
            <h3>${product.name}</h3>
            <span class="cart-item-price">${money.format(product.price)} - Stock: ${product.stock}</span>
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

  const productId = Number(adminProductId.value);
  const currentProduct = products.find((entry) => entry.id === productId);
  const imageFile = adminImage.files[0];
  const colors = parseAdminColors(adminColors.value);
  const image = imageFile
    ? await readImageFile(imageFile)
    : currentProduct?.image || "./assets/favicon.png";
  const product = {
    id: productId || Math.max(0, ...products.map((entry) => entry.id)) + 1,
    name: adminName.value.trim(),
    category: adminCategory.value,
    price: Number(adminPrice.value),
    stock: Number(adminStock.value),
    description: adminDescription.value.trim(),
    image,
  };

  if (colors.length > 0) product.colors = colors;

  if (currentProduct) {
    products = products.map((entry) => (entry.id === productId ? product : entry));
  } else {
    products = [...products, product];
  }

  saveProducts();
  resetAdminForm();
  renderAdminProducts();
}

function deleteAdminProduct(productId) {
  const product = products.find((entry) => entry.id === productId);
  if (!product || !confirm(`Borrar ${product.name}?`)) return;

  products = products.filter((entry) => entry.id !== productId);
  saveProducts();
  resetAdminForm();
  renderAdminProducts();
}

function updateAdminPrice(productId, price) {
  products = products.map((product) =>
    product.id === productId ? { ...product, price } : product,
  );
  saveProducts();
  renderAdminProducts();
}

function unlockAdmin() {

  localStorage.setItem("nexum-admin", "true");

  adminLogin.classList.add("is-hidden");

  adminPanel.hidden = false;

  renderAdminProducts();
}

adminLoginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (adminPassword.value === ADMIN_PASSWORD) {
    unlockAdmin();
  } else {
    adminLoginMessage.textContent = "Clave incorrecta.";
  }
});

adminForm.addEventListener("submit", saveAdminProduct);
adminClear.addEventListener("click", resetAdminForm);
adminProducts.addEventListener("click", (event) => {
  const editId = event.target.closest("[data-admin-edit]")?.dataset.adminEdit;
  const deleteId = event.target.closest("[data-admin-delete]")?.dataset.adminDelete;

  if (editId) fillAdminForm(Number(editId));
  if (deleteId) deleteAdminProduct(Number(deleteId));
});
adminProducts.addEventListener("change", (event) => {
  const productId = event.target.dataset.adminPrice;
  if (!productId) return;

  updateAdminPrice(Number(productId), Number(event.target.value));
});

if (localStorage.getItem("nexum-admin") === "true") {

  adminLogin.classList.add("is-hidden");

  adminPanel.hidden = false;

  renderAdminProducts();

} else {

  adminPanel.hidden = true;

  adminLogin.classList.remove("is-hidden");

  adminPassword.focus();

}
