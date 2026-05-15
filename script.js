let cart = JSON.parse(localStorage.getItem('cart')) || [];
count.innerText = cart.length;

totalElement.innerText = total.toLocaleString();

localStorage.setItem('cart',JSON.stringify(cart));

const message = cart.map(i=>`• ${i.name} - $${i.price}`).join('%0A');

document.getElementById('buy-btn').href =
`https://wa.me/5493364000000?text=Hola%20NEXUM%20quiero:%0A${message}%0A%0ATotal:%20$${total}`;

}

function addToCart(name,price){
cart.push({name,price});
updateCart();
}

function toggleCart(){
document.getElementById('cart').classList.toggle('active');
}

function searchProducts(){

const input = document.getElementById('search').value.toLowerCase();
const cards = document.querySelectorAll('.card');

cards.forEach(card=>{

const name = card.dataset.name;

if(name.includes(input)){
card.style.display='block';
}else{
card.style.display='none';
}

});
}

function filterCategory(){

const category = document.getElementById('category').value;
const cards = document.querySelectorAll('.card');

cards.forEach(card=>{

if(category === 'all'){
card.style.display='block';
return;
}

if(card.dataset.category === category){
card.style.display='block';
}else{
card.style.display='none';
}

});
}

function toggleTheme(){
document.body.classList.toggle('light');
}

updateCart();