console.log('🔄 Products script loading...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded');
    if (window.location.pathname.includes('products.html')) {
        console.log('🎯 Running on products page');
        loadProductsFromStorage();
        setupFilters();
    }
});

function loadProductsFromStorage(customProducts = null) {
    console.log('🔍 Loading products...');
    let products;
    if (customProducts) {
        products = customProducts;
        console.log('✅ Using custom products:', products.length);
    } else {
        const productsData = localStorage.getItem('products');
        if (!productsData) {
            alert('No products found!');
            return;
        }
        products = JSON.parse(productsData);
    }
    const productsGrid = document.querySelector('.products-grid');
    if (!productsGrid) return;
    const activeProducts = products.filter(p => p.active);
    if (activeProducts.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column:1/-1;text-align:center;padding:60px;">No products available.</p>';
        return;
    }
    productsGrid.innerHTML = activeProducts.map(product => {
        const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;
        const inWishlist = typeof wishlist !== 'undefined' && wishlist.has(product.id);
        return `
            <div class="product-card" data-category="${product.category}" data-id="${product.id}" style="cursor:pointer;">
                <button class="wishlist-heart-btn ${inWishlist ? 'in-wishlist' : ''}" 
                        onclick="event.stopPropagation(); toggleWishlist(${product.id}, this)">
                    ${inWishlist ? '❤️' : '🤍'}
                </button>
                <div class="product-image" style="background:${product.gradient};position:relative;">
                    ${mainImage ? `<img src="${mainImage}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">` : ''}
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-desc">${product.inspiredBy ? 'Inspired by ' + product.inspiredBy : ''}</p>
                    ${product.notes ? `<p class="product-notes">Notes: ${product.notes}</p>` : ''}
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    <button class="btn btn-primary add-to-cart" data-product="${product.name}" data-price="${product.price}">Add to Cart</button>
                    <button class="btn btn-secondary" onclick="window.location.href='product-detail.html?id=${product.id}'">View Details</button>
                </div>
            </div>
        `;
    }).join('');
    attachEventListeners();
}

function attachEventListeners() {
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const product = this.getAttribute('data-product');
            const price = this.getAttribute('data-price');
            if (typeof cart !== 'undefined') {
                cart.addItem(product, price);
            }
        });
    });
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.tagName !== 'BUTTON') {
                window.location.href = 'product-detail.html?id=' + this.getAttribute('data-id');
            }
        });
    });
}

function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            const filter = this.getAttribute('data-filter');
            const allProducts = JSON.parse(localStorage.getItem('products')) || [];
            let filtered;
            if (filter === 'all') {
                filtered = allProducts.filter(p => p.active);
            } else {
                filtered = allProducts.filter(p => p.active && p.category === filter);
            }
            loadProductsFromStorage(filtered);
        });
    });
}

function performSearch() {
    const searchInput = document.getElementById('productSearch');
    const query = searchInput.value.trim().toLowerCase();
    if (!query || query.length < 2) {
        alert('Please enter at least 2 characters');
        return;
    }
    const allProducts = JSON.parse(localStorage.getItem('products')) || [];
    const results = allProducts.filter(product => {
        if (!product.active) return false;
        const text = [product.name, product.description, product.inspiredBy, product.notes].join(' ').toLowerCase();
        return text.includes(query);
    });
    if (results.length === 0) {
        document.querySelector('.products-grid').innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:80px;">
                <h3>😔 No Results Found</h3>
                <p>No products match "${query}"</p>
                <button class="btn btn-primary" onclick="clearSearch()">View All</button>
            </div>
        `;
    } else {
        loadProductsFromStorage(results);
        const info = document.createElement('div');
        info.className = 'search-results-info';
        info.innerHTML = `Found <strong>${results.length}</strong> result${results.length > 1 ? 's' : ''} for "<strong>${query}</strong>"`;
        document.querySelector('.filters .container').appendChild(info);
    }
}

function clearSearch() {
    document.getElementById('productSearch').value = '';
    const info = document.querySelector('.search-results-info');
    if (info) info.remove();
    loadProductsFromStorage();
}

console.log('✅ Products script loaded');

// ===========================================
// WISHLIST SYSTEM
// ===========================================

console.log('🔄 Loading wishlist...');

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
            alert('Added to wishlist! ❤️');
            return true;
        }
        return false;
    }

    remove(productId) {
        this.items = this.items.filter(id => id !== productId);
        this.save();
        this.updateCount();
        alert('Removed from wishlist');
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
        const countElements = document.querySelectorAll('#wishlistCount');
        countElements.forEach(el => {
            if (el) el.textContent = this.items.length;
        });
    }

    getItems() {
        const products = JSON.parse(localStorage.getItem('products')) || [];
        return this.items.map(id => products.find(p => p.id === id)).filter(Boolean);
    }
}

const wishlist = new Wishlist();

function toggleWishlist(productId, element) {
    console.log('Toggle wishlist:', productId);
    const isInWishlist = wishlist.toggle(productId);
    if (element) {
        element.classList.toggle('in-wishlist', isInWishlist);
        element.textContent = isInWishlist ? '❤️' : '🤍';
    }
    loadProductsFromStorage();
    return isInWishlist;
}

console.log('✅ Wishlist loaded');