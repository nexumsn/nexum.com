let cart = [];
let total = 0;

function addToCart(name, price) {
  cart.push({ name, price });
  total += price;

  updateCart();
}

function updateCart() {
  const cartItems = document.getElementById('cart-items');
  const totalElement = document.getElementById('total');
  const cartCount = document.getElementById('cart-count');

  cartItems.innerHTML = '';

  cart.forEach(product => {
    const li = document.createElement('li');
    li.innerText = `${product.name} - $${product.price.toLocaleString()}`;
    cartItems.appendChild(li);
  });

  totalElement.innerText = total.toLocaleString();
  cartCount.innerText = cart.length;

  const message = cart.map(p => `• ${p.name} - $${p.price}`).join('%0A');

  document.getElementById('whatsapp-order').href =
  `https://wa.me/5493364000000?text=Hola%20NEXUM,%20quiero%20comprar:%0A${message}%0A%0ATotal:%20$${total}`;
}

function toggleCart() {
  document.getElementById('cart').classList.toggle('active');