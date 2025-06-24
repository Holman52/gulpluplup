 const cartIcon = document.getElementById('cartIcon');
 const cartContainer = document.getElementById('cartContainer');
 const closeCart = document.getElementById('closeCart');
 const overlay = document.getElementById('overlay');
const body = document.body;   
cartIcon.addEventListener('click', function() {
    cartContainer.classList.add('active-cart');
    overlay.classList.add('active');
    body.classList.add('cart-open');
});
            
closeCart.addEventListener('click', function() {
    cartContainer.classList.remove('active-cart');
    overlay.classList.remove('active');
    body.classList.remove('cart-open');
});