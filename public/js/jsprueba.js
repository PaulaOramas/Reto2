let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(artwork) {
    cart.push(artwork);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(artwork + ' ha sido añadido al carrito.');
    console.log(cart);
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('carrito.html')) {
        const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
        const cartContainer = document.querySelector('.cart-container');

        cartItems.forEach(item => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.textContent = item;
            cartContainer.appendChild(cartItem);
        });
    }
});
