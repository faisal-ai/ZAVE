console.log('🔄 Wishlist script loading...');

// Wishlist Class
class Wishlist {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('wishlist')) || [];
        this.updateCount();
        console.log('✅ Wishlist initialized with', this.items.length, 'items');
    }

    add(productId) {
        if (!this.items.includes(productId)) {
            this.items.push(productId);
            this.save();
            this.updateCount();
            this.showNotification('Added to wishlist! ❤️', 'success');
            return true;
        }
        return false;
    }

    remove(productId) {
        this.items = this.items.filter(id => id !== productId);
        this.save();
        this.updateCount();
        this.showNotification('Removed from wishlist', 'success');
    }

    has(productId) {
        return this.items.includes(productId);
    }

    toggle(productId) {
        if (this.has(productId)) {
            this.remove(productId);
            return false;
        } else {
            this.add(productId);
            return true;
        }
    }

    save() {
        localStorage.setItem('wishlist', JSON.stringify(this.items));
    }

    updateCount() {
        const countElements = document.querySelectorAll('#wishlistCount, .wishlist-count');
        countElements.forEach(el => {
            if (el) el.textContent = this.items.length;
        });
    }

    getItems() {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        return this.items.map(id => products.find(p => p.id === id)).filter(Boolean);
    }

    showNotification(message, type = 'success') {
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
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => notification.remove(), 2000);
    }
}

// Initialize wishlist
const wishlist = new Wishlist();

// Global toggle function
function toggleWishlist(productId, element) {
    console.log('Toggle wishlist for product:', productId);
    const isInWishlist = wishlist.toggle(productId);
    
    if (element) {
        element.classList.toggle('in-wishlist', isInWishlist);
        element.textContent = isInWishlist ? '❤️' : '🤍';
    }
    
    return isInWishlist;
}

// Wishlist page loader
if (window.location.pathname.includes('wishlist.html')) {
    document.addEventListener('DOMContentLoaded', loadWishlistPage);
}

function loadWishlistPage() {
    console.log('Loading wishlist page...');
    const wishlistItems = wishlist.getItems();
    const wishlistGrid = document.getElementById('wishlistGrid');
    const emptyWishlist = document.getElementById('emptyWishlist');
    
    if (wishlistItems.length === 0) {
        wishlistGrid.style.display = 'none';
        emptyWishlist.style.display = 'block';
        return;
    }
    
    wishlistGrid.style.display = 'grid';
    emptyWishlist.style.display = 'none';
    
    wishlistGrid.innerHTML = wishlistItems.map(product => {
        const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;
        
        return `
            <div class="wishlist-item">
                <button class="remove-wishlist-btn" onclick="removeFromWishlist(${product.id})">✕</button>
                <div class="wishlist-product-image" style="background:${product.gradient};" onclick="window.location.href='product-detail.html?id=${product.id}'">
                    ${mainImage ? `<img src="${mainImage}" alt="${product.name}">` : ''}
                </div>
                <div class="wishlist-product-info">
                    <h3>${product.name}</h3>
                    <p class="product-desc">${product.inspiredBy ? 'Inspired by ' + product.inspiredBy : ''}</p>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <div class="wishlist-actions">
                        <button class="btn btn-primary" onclick="addToCartFromWishlist('${product.name}', ${product.price})">Add to Cart</button>
                        <button class="btn btn-secondary" onclick="window.location.href='product-detail.html?id=${product.id}'">View Details</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function removeFromWishlist(productId) {
    wishlist.remove(productId);
    loadWishlistPage();
}

function addToCartFromWishlist(productName, price) {
    if (typeof cart !== 'undefined') {
        cart.addItem(productName, price);
    } else {
        alert('Added to cart: ' + productName);
    }
}

console.log('✅ Wishlist system loaded');