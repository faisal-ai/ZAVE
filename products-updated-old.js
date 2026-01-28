console.log('🔄 Products script loading...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('✅ DOM loaded');
    console.log('📍 Current page:', window.location.pathname);
    
    // Always run on products page
    if (window.location.pathname.includes('products.html') || window.location.pathname.endsWith('/')) {
        console.log('🎯 Running on products page');
        loadProductsFromStorage();
    } else {
        console.log('⚠️ Not on products page, skipping');
    }
});

function loadProductsFromStorage(customProducts = null)  {
    console.log('🔍 Loading products from localStorage...');
    
    //const productsData = localStorage.getItem('products');
    const productsData = JSON.parse(localStorage.getItem('products')) || [];
    console.log('📦 Raw data:', productsData);
    
    if (!productsData) {
        console.error('❌ No products found in localStorage!');
        alert('No products found! Please add products via admin panel first.');
        return;
    }
    
    const products = JSON.parse(productsData);
    console.log('✅ Parsed products:', products);
    console.log('📊 Total products:', products.length);
    
    const productsGrid = document.querySelector('.products-grid');
    
    if (!productsGrid) {
        console.error('❌ Could not find .products-grid element!');
        return;
    }
    
    console.log('✅ Found products grid element');
    
    const activeProducts = products.filter(p => p.active);
    console.log('✅ Active products:', activeProducts.length);
    
    if (activeProducts.length === 0) {
        productsGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; padding: 60px; color: #666;">No active products available. Add products via admin panel!</p>';
        return;
    }
    
    console.log('🎨 Rendering products...');
    
    productsGrid.innerHTML = activeProducts.map((product, index) => {
        console.log(`Rendering product ${index + 1}:`, product.name);
        
        const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;
        
        return `
            <div class="product-card" data-category="${product.category}" data-id="${product.id}" style="cursor:pointer;">
                <div class="product-image" style="background: ${product.gradient}; position: relative;">
                    ${mainImage ? `<img src="${mainImage}" alt="${product.name}" style="width:100%;height:100%;object-fit:cover;">` : ''}
                    ${product.images && product.images.length > 1 ? `<span style="position:absolute;bottom:10px;right:10px;background:rgba(0,0,0,0.7);color:white;padding:5px 10px;border-radius:15px;font-size:11px;">${product.images.length} photos</span>` : ''}
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
    
    console.log('✅ Products rendered to DOM');
    
    // Add event listeners for add to cart
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    console.log('🛒 Found', addToCartButtons.length, 'add to cart buttons');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation();
            const product = this.getAttribute('data-product');
            const price = this.getAttribute('data-price');
            
            console.log('🛒 Adding to cart:', product, price);
            
            if (typeof cart !== 'undefined') {
                cart.addItem(product, price);
            } else {
                console.warn('⚠️ Cart object not found');
                alert('Added ' + product + ' to cart!');
            }
        });
    });
    
    // Make cards clickable
    document.querySelectorAll('.product-card').forEach(card => {
        card.addEventListener('click', function(e) {
            if (e.target.tagName !== 'BUTTON') {
                const productId = this.getAttribute('data-id');
                console.log('🔗 Opening product:', productId);
                window.location.href = 'product-detail.html?id=' + productId;
            }
        });
    });
    
    console.log('✅ All done! Products loaded successfully!');
}

console.log('✅ Products script loaded successfully');


// ===========================================
// SEARCH FUNCTIONALITY
// ===========================================

function performSearch() {
    console.log('🔍 Search clicked');
    
    const searchInput = document.getElementById('productSearch');
    if (!searchInput) {
        alert('Search box not found!');
        return;
    }
    
    const query = searchInput.value.trim().toLowerCase();
    console.log('Query:', query);
    
    if (!query) {
        alert('Please enter something to search');
        return;
    }
    
    if (query.length < 2) {
        alert('Please type at least 2 characters');
        return;
    }

    // Get products
    const allProducts = JSON.parse(localStorage.getItem('products')) || [];
    console.log('Total products:', allProducts.length);
    
    // Filter by search
    const results = allProducts.filter(product => {
        if (!product.active) return false;
        
        const searchText = [
            product.name || '',
            product.description || '',
            product.inspiredBy || '',
            product.notes || '',
            product.category || ''
        ].join(' ').toLowerCase();
        
        return searchText.includes(query);
    });

    console.log('Results found:', results.length);
    
    // Show results
    if (results.length === 0) {
        const grid = document.querySelector('.products-grid');
        grid.innerHTML = `
            <div style="grid-column:1/-1;text-align:center;padding:80px 20px;">
                <h3 style="font-size:28px;color:#2c2c2c;margin-bottom:15px;">😔 No Results Found</h3>
                <p style="color:#666;font-size:16px;margin-bottom:30px;">We couldn't find any products matching "<strong>${query}</strong>"</p>
                <button class="btn btn-primary" onclick="clearSearch()">View All Products</button>
            </div>
        `;
    } else {
        // Show filtered results
        loadProductsFromStorage(results);
        
        // Show count
        const container = document.querySelector('.filters .container');
        let info = document.querySelector('.search-results-info');
        if (!info) {
            info = document.createElement('div');
            info.className = 'search-results-info';
            container.appendChild(info);
        }
        info.innerHTML = `Found <strong>${results.length}</strong> product${results.length > 1 ? 's' : ''} for "<strong>${query}</strong>"`;
    }
}

function clearSearch() {
    console.log('Clearing search');
    
    // Clear input
    const searchInput = document.getElementById('productSearch');
    if (searchInput) searchInput.value = '';
    
    // Remove info message
    const info = document.querySelector('.search-results-info');
    if (info) info.remove();
    
    // Reload all products
    loadProductsFromStorage();
}

console.log('✅ Search functions loaded');