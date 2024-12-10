let cart = JSON.parse(localStorage.getItem('cart')) || [];

function addToCart(name, image, price) {
    const item = { name, image, price };
    cart.push(item);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert(name + ' ha sido añadido al carrito.');
    console.log(cart);
}

function removeFromCart(index) {
    cart.splice(index, 1);
    localStorage.setItem('cart', JSON.stringify(cart));
    alert('Producto eliminado del carrito.');
    displayCartItems(); // Refresca la lista de productos
}

function displayCartItems() {
    const cartItems = JSON.parse(localStorage.getItem('cart')) || [];
    const cartContainer = document.querySelector('.cart-items');
    cartContainer.innerHTML = ''; // Limpia el contenido anterior

    if (cartItems.length === 0) {
        // Si el carrito está vacío, muestra un mensaje
        const emptyMessage = document.createElement('p');
        emptyMessage.classList.add('empty-cart-message');
        emptyMessage.textContent = 'Tu carrito está vacío.';
        cartContainer.appendChild(emptyMessage);
    } else {
        let subtotal = 0;

        cartItems.forEach((item, index) => {
            const cartItem = document.createElement('div');
            cartItem.classList.add('cart-item');
            cartItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <p class="cart-item-name">${item.name}</p>
                    <p class="cart-item-price">Precio: $${item.price.toFixed(2)}</p>
                </div>
                <button class="remove-item" onclick="removeFromCart(${index})">Eliminar</button>
            `;
            cartContainer.appendChild(cartItem);
            subtotal += item.price;
        });

        const iva = subtotal * 0.15;
        const total = subtotal + iva;

        document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
        document.getElementById('iva').textContent = `$${iva.toFixed(2)}`;
        document.getElementById('total').textContent = `$${total.toFixed(2)}`;

        // Evento del botón de pagar
        const payButton = document.getElementById('pay-button');
        payButton.addEventListener('click', () => {
            // Verifica si el usuario está autenticado
            const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

            if (!isLoggedIn) {
                alert('Debes iniciar sesión antes de proceder al pago.');
                window.location.href = '../../paginas/menu/usuario.html'; // Redirige a la página de inicio de sesión
            } else if (cartItems.length === 0) {
                alert('El carrito está vacío. Agrega productos antes de pagar.');
            } else {
                alert(`Gracias por tu compra. Total a pagar: $${total.toFixed(2)}`);
                cart = []; // Vacía el arreglo de productos
                localStorage.setItem('cart', JSON.stringify(cart)); // Actualiza el Local Storage
                displayCartItems(); // Refresca el contenido del carrito
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('carrito.html')) {
        displayCartItems();
    }
});
