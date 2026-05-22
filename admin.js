// --- ESTO TIENE QUE IR AL FINAL DE TU ARCHIVO ---

document.addEventListener("click", (event) => {
  const categoryId = event.target.closest("[data-category]")?.dataset.category;
  const backCategories = event.target.closest("[data-back-categories]");
  const addId = event.target.closest("[data-add]")?.dataset.add;
  const increaseId = event.target.closest("[data-increase]")?.dataset.increase;
  const decreaseId = event.target.closest("[data-decrease]")?.dataset.decrease;
  const removeId = event.target.closest("[data-remove]")?.dataset.remove;
  const adminEditId = event.target.closest("[data-admin-edit]")?.dataset.adminEdit;
  const adminDeleteId = event.target.closest("[data-admin-delete]")?.dataset.adminDelete;

  if (categoryId) {
    selectedCategory = categoryId;
    setCategoryHash(selectedCategory);
    renderProducts(selectedCategory);
    scrollCatalogToTop();
  }
  if (backCategories) {
    selectedCategory = null;
    setCategoryHash(null);
    renderCategories();
    scrollCatalogToTop();
  }
  if (addId) addToCart(Number(addId));
  if (increaseId) increaseCartLine(increaseId);
  if (decreaseId) decreaseFromCart(decreaseId);
  if (removeId) {
    cart.delete(removeId);
    renderCart();
  }
  if (adminEditId) fillAdminForm(Number(adminEditId));
  if (adminDeleteId) deleteAdminProduct(Number(adminDeleteId));
});

document.querySelector("#openCart").addEventListener("click", openCart);
document.querySelector("#closeCart").addEventListener("click", closeCart);

if (adminOpen && adminClose && adminClear && adminForm && adminLoginForm && adminProducts) {
  adminOpen.addEventListener("click", openAdminPanel);
  adminClose.addEventListener("click", closeAdminPanel);
  adminClear.addEventListener("click", resetAdminForm);
  adminForm.addEventListener("submit", saveAdminProduct); // Aquí conecta tu botón de guardar
  adminLoginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (adminPassword.value === ADMIN_PASSWORD) {
      unlockAdmin();
    } else {
      adminLoginMessage.textContent = "Clave incorrecta.";
    }
  });
  adminProducts.addEventListener("change", (event) => {
    const productId = event.target.dataset.adminPrice;
    if (!productId) return;
    updateAdminPrice(Number(productId), Number(event.target.value));
  });
}

overlay.addEventListener("click", closeCart);
checkoutButton.addEventListener("click", checkout);

document.querySelector("#carouselPrev")?.addEventListener("click", () => {
  showSlide(currentSlide - 1);
  startCarousel();
});
document.querySelector("#carouselNext")?.addEventListener("click", () => {
  showSlide(currentSlide + 1);
  startCarousel();
});

carouselDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    showSlide(Number(dot.dataset.slide));
    startCarousel();
  });
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCart();
});

window.addEventListener("hashchange", () => {
  selectedCategory = getCategoryFromHash();
  if (selectedCategory) {
    renderProducts(selectedCategory);
    scrollCatalogToTop();
  } else {
    renderCategories();
    scrollCatalogToTop();
  }
});

selectedCategory = getCategoryFromHash();
if (selectedCategory) {
  renderProducts(selectedCategory);
  scrollCatalogToTop();
} else {
  renderCategories();
}
renderCart();
if (adminLogin && adminOpen) initAdmin();
showSlide(0);
startCarousel();
