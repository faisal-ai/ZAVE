// ===========================================
// ENHANCED FEATURES: Search, Wishlist, Reviews, Inventory, Variants, Sales
// ===========================================

// WISHLIST MANAGEMENT
class Wishlist {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('wishlist')) || [];
        this.updateCount();
    }

    add(productId) {
        if (!this.items.includes(productId)) {
            this.items.push(productId);
            this.save();
            this.updateCount();
            showNotification('Added to wishlist! ❤', 'success');
            return true;
        }
        return false;
    }

    remove(productId) {
        this.items = this.items.filter(id => id !== productId);
        this.save();
        this.updateCount();
        showNotification('Removed from wishlist', 'success');
    }

    has(productId) {
        return this.items.includes(productId);
    }

    save() {
        localStorage.setItem('wishlist', JSON.stringify(this.items));
    }

    updateCount() {
        const countElements = document.querySelectorAll('#wishlistCount');
        countElements.forEach(el => el.textContent = this.items.length);
    }

    getItems() {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        return this.items.map(id => products.find(p => p.id === id)).filter(Boolean);
    }
}

// PRODUCT SEARCH
class ProductSearch {
    constructor() {
        this.setupSearchBar();
    }

    setupSearchBar() {
        const searchHTML = `
            <div class="search-container">
                <input type="text" id="productSearch" placeholder="Search fragrances..." />
                <button onclick="performSearch()">🔍</button>
            </div>
        `;
        
        const filtersSection = document.querySelector('.filters .container');
        if (filtersSection) {
            filtersSection.insertAdjacentHTML('afterbegin', searchHTML);
        }
    }

    search(query) {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        query = query.toLowerCase();
        
        return products.filter(p => 
            p.active && (
                p.name.toLowerCase().includes(query) ||
                (p.description && p.description.toLowerCase().includes(query)) ||
                (p.inspiredBy && p.inspiredBy.toLowerCase().includes(query)) ||
                (p.notes && p.notes.toLowerCase().includes(query))
            )
        );
    }
}

// REVIEWS SYSTEM
class ReviewsSystem {
    constructor() {
        this.reviews = JSON.parse(localStorage.getItem('reviews')) || {};
    }

    addReview(productId, review) {
        if (!this.reviews[productId]) {
            this.reviews[productId] = [];
        }
        
        review.id = Date.now();
        review.date = new Date().toISOString();
        this.reviews[productId].push(review);
        this.save();
    }

    getReviews(productId) {
        return this.reviews[productId] || [];
    }

    getAverageRating(productId) {
        const productReviews = this.reviews[productId] || [];
        if (productReviews.length === 0) return 0;
        
        const sum = productReviews.reduce((acc, r) => acc + r.rating, 0);
        return (sum / productReviews.length).toFixed(1);
    }

    save() {
        localStorage.setItem('reviews', JSON.stringify(this.reviews));
    }
}

// INVENTORY MANAGEMENT
class InventoryManager {
    constructor() {
        this.inventory = JSON.parse(localStorage.getItem('inventory')) || {};
    }

    setStock(productId, quantity) {
        this.inventory[productId] = quantity;
        this.save();
    }

    getStock(productId) {
        return this.inventory[productId] || 0;
    }

    decreaseStock(productId, quantity = 1) {
        if (this.inventory[productId]) {
            this.inventory[productId] = Math.max(0, this.inventory[productId] - quantity);
            this.save();
        }
    }

    isInStock(productId) {
        return (this.inventory[productId] || 0) > 0;
    }

    save() {
        localStorage.setItem('inventory', JSON.stringify(this.inventory));
    }
}

// EMAIL NOTIFICATIONS
class EmailNotifications {
    sendOrderConfirmation(orderData) {
        console.log('📧 Sending order confirmation email...');
        
        // Simulated email (in production, call your backend API)
        const emailContent = `
            Order Confirmation - ZAVÉ
            
            Thank you for your order!
            Order #${orderData.orderNumber}
            
            Items:
            ${orderData.items.map(item => `- ${item.product} x${item.quantity} - $${item.price.toFixed(2)}`).join('\n')}
            
            Total: $${orderData.total.toFixed(2)}
            
            Shipping to:
            ${orderData.shippingAddress.name}
            ${orderData.shippingAddress.address}
            ${orderData.shippingAddress.city}, ${orderData.shippingAddress.zip}
        `;
        
        console.log(emailContent);
        showNotification('Order confirmation sent to ' + orderData.shippingAddress.email, 'success');
        
        // Store email log
        const emailLog = JSON.parse(localStorage.getItem('emailLog')) || [];
        emailLog.push({
            to: orderData.shippingAddress.email,
            subject: 'Order Confirmation #' + orderData.orderNumber,
            date: new Date().toISOString(),
            type: 'order_confirmation'
        });
        localStorage.setItem('emailLog', JSON.stringify(emailLog));
    }

    sendShippingNotification(orderNumber, trackingNumber) {
        console.log(`📧 Sending shipping notification for order #${orderNumber}`);
        showNotification('Shipping notification sent!', 'success');
    }
}

// PRODUCT VARIANTS (Sizes)
class ProductVariants {
    getVariants() {
        return [
            { size: '30ml', price_multiplier: 0.7, label: '30ml - Travel Size' },
            { size: '50ml', price_multiplier: 1.0, label: '50ml - Standard' },
            { size: '100ml', price_multiplier: 1.6, label: '100ml - Value Size' }
        ];
    }

    calculatePrice(basePrice, size) {
        const variant = this.getVariants().find(v => v.size === size);
        return variant ? basePrice * variant.price_multiplier : basePrice;
    }
}

// SALES & DISCOUNTS
class SalesManager {
    constructor() {
        this.sales = JSON.parse(localStorage.getItem('sales')) || {};
    }

    setSale(productId, discountPercent, endDate = null) {
        this.sales[productId] = {
            discount: discountPercent,
            endDate: endDate,
            active: true
        };
        this.save();
    }

    getSale(productId) {
        const sale = this.sales[productId];
        if (!sale || !sale.active) return null;
        
        // Check if sale has expired
        if (sale.endDate && new Date(sale.endDate) < new Date()) {
            this.sales[productId].active = false;
            this.save();
            return null;
        }
        
        return sale;
    }

    calculateSalePrice(price, productId) {
        const sale = this.getSale(productId);
        if (!sale) return price;
        
        return price * (1 - sale.discount / 100);
    }

    removeSale(productId) {
        if (this.sales[productId]) {
            this.sales[productId].active = false;
            this.save();
        }
    }

    save() {
        localStorage.setItem('sales', JSON.stringify(this.sales));
    }
}

// Initialize all systems
const wishlist = new Wishlist();
const productSearch = new ProductSearch();
const reviewsSystem = new ReviewsSystem();
const inventoryManager = new InventoryManager();
const emailNotifications = new EmailNotifications();
const productVariants = new ProductVariants();
const salesManager = new SalesManager();

// Global functions
function toggleWishlist(productId) {
    if (wishlist.has(productId)) {
        wishlist.remove(productId);
        return false;
    } else {
        wishlist.add(productId);
        return true;
    }
}

function performSearch() {
    const query = document.getElementById('productSearch').value;
    const results = productSearch.search(query);
    
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    
    if (results.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:60px;">No products found for "' + query + '"</p>';
        return;
    }
    
    // Render search results (reuse existing product rendering)
    loadProductsFromStorage(results);
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background-color: ${type === 'success' ? '#27ae60' : '#e74c3c'};
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
    }, 3000);
}

console.log('✅ Enhanced features loaded: Search, Wishlist, Reviews, Inventory, Variants, Sales');