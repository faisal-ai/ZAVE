// Shopping Cart Management
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.updateCartCount();
    }

    addItem(product, price) {
        const existingItem = this.items.find(item => item.product === product);
        
        if (existingItem) {
            existingItem.quantity++;
        } else {
            this.items.push({
                product: product,
                price: parseFloat(price),
                quantity: 1
            });
        }
        
        this.saveCart();
        this.updateCartCount();
        this.showNotification(`${product} added to cart!`);
    }

    removeItem(index) {
        this.items.splice(index, 1);
        this.saveCart();
        this.updateCartCount();
        this.renderCart();
    }

    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    saveCart() {
        localStorage.setItem('cart', JSON.stringify(this.items));
    }

    updateCartCount() {
        const count = this.items.reduce((total, item) => total + item.quantity, 0);
        const cartCountElement = document.getElementById('cartCount');
        if (cartCountElement) {
            cartCountElement.textContent = count;
        }
    }

    renderCart() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartTotalElement = document.getElementById('cartTotal');
        
        if (!cartItemsContainer) return;
        
        if (this.items.length === 0) {
            cartItemsContainer.innerHTML = '<div class="empty-cart"><p>Your cart is empty</p></div>';
            cartTotalElement.textContent = '0.00';
            return;
        }
        
        cartItemsContainer.innerHTML = this.items.map((item, index) => `
            <div class="cart-item">
                <div class="cart-item-info">
                    <h4>${item.product}</h4>
                    <p class="cart-item-price">$${item.price.toFixed(2)} x ${item.quantity}</p>
                </div>
                <button class="cart-item-remove" onclick="cart.removeItem(${index})">Remove</button>
            </div>
        `).join('');
        
        cartTotalElement.textContent = this.getTotal().toFixed(2);
    }

    showNotification(message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background-color: #27ae60;
            color: white;
            padding: 15px 25px;
            border-radius: 4px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 3000;
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    clear() {
        this.items = [];
        this.saveCart();
        this.updateCartCount();
    }
}

// Initialize cart
const cart = new ShoppingCart();

// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.getElementById('hamburger');
    const navMenu = document.getElementById('navMenu');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            navMenu.classList.toggle('active');
        });
    }

    // Cart modal
    const cartIcon = document.getElementById('cartIcon');
    const cartModal = document.getElementById('cartModal');
    const closeCart = document.getElementById('closeCart');
    
    if (cartIcon) {
        cartIcon.addEventListener('click', function(e) {
            e.preventDefault();
            cart.renderCart();
            cartModal.style.display = 'block';
        });
    }
    
    if (closeCart) {
        closeCart.addEventListener('click', function() {
            cartModal.style.display = 'none';
        });
    }
    
    window.addEventListener('click', function(e) {
        if (e.target === cartModal) {
            cartModal.style.display = 'none';
        }
    });

    // Add to cart buttons
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function() {
            const product = this.getAttribute('data-product');
            const price = this.getAttribute('data-price');
            cart.addItem(product, price);
        });
    });

    // Product filtering
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            filterButtons.forEach(btn => btn.classList.remove('active'));
            // Add active class to clicked button
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            
            productCards.forEach(card => {
                if (filter === 'all') {
                    card.style.display = 'block';
                } else {
                    const category = card.getAttribute('data-category');
                    if (category === filter) {
                        card.style.display = 'block';
                    } else {
                        card.style.display = 'none';
                    }
                }
            });
        });
    });

    // Checkout button
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function() {
            if (cart.items.length === 0) {
                alert('Your cart is empty!');
                return;
            }
            
            // Check if user is logged in
            const currentUser = JSON.parse(localStorage.getItem('currentUser'));
            if (!currentUser) {
                if (confirm('You need to login to checkout. Would you like to login now?')) {
                    window.location.href = 'account.html';
                }
                return;
            }
            
            window.location.href = 'checkout.html';  // Redirect to checkout page
        });
    }

    // Newsletter form
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            alert(`Thank you for subscribing! We'll send updates to ${email}`);
            this.reset();
        });
    }
    
    // Update account link on all pages
    updateAccountLinkOnPage();
});

// Update account link based on login status
function updateAccountLinkOnPage() {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const accountLink = document.getElementById('accountLink');
    
    if (accountLink && currentUser) {
        accountLink.textContent = currentUser.name.split(' ')[0];
    }
}

// Checkout Form
function showCheckoutForm() {
    const cartItemsContainer = document.getElementById('cartItems');
    const subtotal = cart.getTotal();
    const shipping = 10.00;
    const tax = subtotal * 0.08; // 8% tax
    const total = subtotal + shipping + tax;
    
    cartItemsContainer.innerHTML = `
        <div class="checkout-form">
            <div class="form-section">
                <h3>Shipping Information</h3>
                <div class="form-group">
                    <label>Full Name</label>
                    <input type="text" id="fullName" required>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label>Address</label>
                    <input type="text" id="address" required>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>City</label>
                        <input type="text" id="city" required>
                    </div>
                    <div class="form-group">
                        <label>ZIP Code</label>
                        <input type="text" id="zip" required>
                    </div>
                </div>
                <div class="form-group">
                    <label>Country</label>
                    <select id="country" required>
                        <option value="">Select Country</option>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                    </select>
                </div>
            </div>
            
            <div class="form-section">
                <h3>Payment Method</h3>
                <div class="payment-methods">
                    <div class="payment-method active">
                        <input type="radio" name="payment" value="card" id="card" checked>
                        <label for="card">Credit Card</label>
                    </div>
                    <div class="payment-method">
                        <input type="radio" name="payment" value="paypal" id="paypal">
                        <label for="paypal">PayPal</label>
                    </div>
                </div>
                
                <div id="cardFields">
                    <div class="form-group">
                        <label>Card Number</label>
                        <input type="text" id="cardNumber" placeholder="1234 5678 9012 3456" required>
                    </div>
                    <div class="form-row">
                        <div class="form-group">
                            <label>Expiry Date</label>
                            <input type="text" id="expiry" placeholder="MM/YY" required>
                        </div>
                        <div class="form-group">
                            <label>CVV</label>
                            <input type="text" id="cvv" placeholder="123" required>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="order-summary">
                <h3>Order Summary</h3>
                <div class="summary-row">
                    <span>Subtotal:</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Shipping:</span>
                    <span>$${shipping.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Tax:</span>
                    <span>$${tax.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                    <span>Total:</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
            </div>
            
            <button class="btn btn-primary" onclick="processPayment()" style="width: 100%; margin-top: 20px;">Place Order</button>
        </div>
    `;
    
    // Payment method toggle
    const paymentMethods = document.querySelectorAll('.payment-method');
    paymentMethods.forEach(method => {
        method.addEventListener('click', function() {
            paymentMethods.forEach(m => m.classList.remove('active'));
            this.classList.add('active');
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            
            const cardFields = document.getElementById('cardFields');
            if (radio.value === 'paypal') {
                cardFields.style.display = 'none';
            } else {
                cardFields.style.display = 'block';
            }
        });
    });
}

// Process Payment
function processPayment() {
    const fullName = document.getElementById('fullName').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const zip = document.getElementById('zip').value;
    const country = document.getElementById('country').value;
    
    // Basic validation
    if (!fullName || !email || !address || !city || !zip || !country) {
        alert('Please fill in all shipping information');
        return;
    }
    
    const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
    
    if (paymentMethod === 'card') {
        const cardNumber = document.getElementById('cardNumber').value;
        const expiry = document.getElementById('expiry').value;
        const cvv = document.getElementById('cvv').value;
        
        if (!cardNumber || !expiry || !cvv) {
            alert('Please fill in all payment information');
            return;
        }
    }
    
    // Simulate payment processing
    showProcessingAnimation();
    
    setTimeout(() => {
        const orderNumber = createOrder(fullName, email, address, city, zip, country);
        showSuccessMessage(orderNumber);
        cart.clear();
    }, 2000);
}

// Create Order and save to localStorage
function createOrder(fullName, email, address, city, zip, country) {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const orderNumber = Math.floor(100000 + Math.random() * 900000);
    const subtotal = cart.getTotal();
    const shipping = 10.00;
    const tax = subtotal * 0.08;
    const total = subtotal + shipping + tax;
    
    const order = {
        orderNumber: orderNumber,
        userId: currentUser ? currentUser.id : null,
        date: new Date().toISOString(),
        items: cart.items,
        subtotal: subtotal,
        shipping: shipping,
        tax: tax,
        total: total,
        status: 'pending',
        shippingAddress: {
            name: fullName,
            address: address,
            city: city,
            zip: zip,
            country: country
        },
        trackingNumber: null
    };
    
    // Save order to localStorage
    const orders = JSON.parse(localStorage.getItem('orders')) || [];
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    return orderNumber;
}

function showProcessingAnimation() {
    const cartItemsContainer = document.getElementById('cartItems');
    cartItemsContainer.innerHTML = `
        <div class="success-message">
            <div class="success-icon" style="font-size: 48px;">⏳</div>
            <h3>Processing your order...</h3>
            <p>Please wait while we process your payment.</p>
        </div>
    `;
}

function showSuccessMessage(orderNumber) {
    const cartItemsContainer = document.getElementById('cartItems');
    
    cartItemsContainer.innerHTML = `
        <div class="success-message">
            <div class="success-icon">✓</div>
            <h2>Order Placed Successfully!</h2>
            <p>Your order number is: <strong>#${orderNumber}</strong></p>
            <p>We've sent a confirmation email with your order details.</p>
            <p style="margin-top: 20px;">You can track your order from your account page.</p>
            <div style="display: flex; gap: 15px; justify-content: center; margin-top: 30px;">
                <button class="btn btn-secondary" onclick="window.location.href='account.html'">View Order</button>
                <button class="btn btn-primary" onclick="closeModal()">Continue Shopping</button>
            </div>
        </div>
    `;
}

function closeModal() {
    const cartModal = document.getElementById('cartModal');
    cartModal.style.display = 'none';
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);