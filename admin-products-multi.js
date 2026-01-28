// ===========================================
// PRODUCT MANAGEMENT SYSTEM - MULTI IMAGE
// ===========================================

let products = [];
let editingProductId = null;
let productImages = []; // Temporary storage for images during editing
let currentImageIndex = 0;

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    renderProducts();
    setupEventListeners();
    setupGradientPreview();
});

// Load products from localStorage
function loadProducts() {
    const storedProducts = localStorage.getItem('products');
    
    if (storedProducts) {
        products = JSON.parse(storedProducts);
    } else {
        // Initialize with default products
        products = [
            {
                id: 1,
                name: 'Velvet Noir',
                category: 'women',
                price: 45.00,
                inspiredBy: 'Tom Ford Black Orchid',
                notes: 'Black Truffle, Ylang-Ylang, Bergamot',
                description: 'A luxurious and mysterious fragrance with deep, rich notes.',
                images: [], // Now an array!
                gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                featured: true,
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Rose Éternelle',
                category: 'women',
                price: 42.00,
                inspiredBy: 'Lancôme La Vie Est Belle',
                notes: 'Iris, Patchouli, Praline',
                description: 'An elegant floral fragrance celebrating femininity.',
                images: [],
                gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                featured: true,
                active: true,
                createdAt: new Date().toISOString()
            },
            {
                id: 3,
                name: 'Azure Dreams',
                category: 'men',
                price: 48.00,
                inspiredBy: 'Dior Sauvage',
                notes: 'Bergamot, Pepper, Ambroxan',
                description: 'A fresh and powerful masculine scent.',
                images: [],
                gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                featured: true,
                active: true,
                createdAt: new Date().toISOString()
            }
        ];
        saveProducts();
    }
}

// Save products to localStorage
function saveProducts() {
    localStorage.setItem('products', JSON.stringify(products));
}

// Render products grid
function renderProducts() {
    const grid = document.getElementById('adminProductsGrid');
    
    if (products.length === 0) {
        grid.innerHTML = '<div class="no-products"><p>No products yet. Click "Add New Product" to get started!</p></div>';
        return;
    }
    
    grid.innerHTML = products.map(product => {
        const mainImage = product.images && product.images.length > 0 ? product.images[0] : null;
        const imageCount = product.images ? product.images.length : 0;
        
        return `
            <div class="admin-product-card ${!product.active ? 'inactive' : ''}">
                <div class="admin-product-image" style="background: ${product.gradient};">
                    ${mainImage ? `<img src="${mainImage}" alt="${product.name}">` : ''}
                    ${imageCount > 1 ? `<span class="image-count-badge">${imageCount} photos</span>` : ''}
                    ${!product.active ? '<span class="inactive-badge">Inactive</span>' : ''}
                    ${product.featured ? '<span class="featured-badge">Featured</span>' : ''}
                </div>
                <div class="admin-product-info">
                    <h3>${product.name}</h3>
                    <p class="product-category">${getCategoryName(product.category)}</p>
                    <p class="product-price">$${product.price.toFixed(2)}</p>
                    ${product.inspiredBy ? `<p class="product-inspired">Inspired by ${product.inspiredBy}</p>` : ''}
                    <div class="admin-product-actions">
                        <button class="btn btn-sm btn-secondary" onclick="editProduct(${product.id})">Edit</button>
                        <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.id})">Delete</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Get category display name
function getCategoryName(category) {
    const categories = {
        'women': 'For Her',
        'men': 'For Him',
        'unisex': 'Unisex'
    };
    return categories[category] || category;
}

// Setup event listeners
function setupEventListeners() {
    // Add product button
    document.getElementById('addProductBtn').addEventListener('click', () => {
        openProductModal();
    });
    
    // Close modal buttons
    document.getElementById('closeProductModal').addEventListener('click', () => {
        closeProductModal();
    });
    
    document.getElementById('closeImagePreview').addEventListener('click', () => {
        document.getElementById('imagePreviewModal').style.display = 'none';
    });
    
    // Product form submit
    document.getElementById('productForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveProduct();
    });
    
    // Multiple file upload
    document.getElementById('productImageFile').addEventListener('change', handleFileUpload);
    
    // Image navigation
    document.getElementById('prevImageBtn').addEventListener('click', () => navigateImage(-1));
    document.getElementById('nextImageBtn').addEventListener('click', () => navigateImage(1));
    
    // Click outside modal to close
    window.addEventListener('click', (e) => {
        const productModal = document.getElementById('productModal');
        const deleteModal = document.getElementById('deleteModal');
        const imageModal = document.getElementById('imagePreviewModal');
        
        if (e.target === productModal) closeProductModal();
        if (e.target === deleteModal) closeDeleteModal();
        if (e.target === imageModal) imageModal.style.display = 'none';
    });
}

// Handle multiple file uploads
function handleFileUpload(e) {
    const files = e.target.files;
    
    if (files.length === 0) return;
    
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
            productImages.push(event.target.result);
            renderImageGallery();
        };
        reader.readAsDataURL(file);
    });
    
    e.target.value = ''; // Reset input
}

// Add image from URL
function addImageFromURL() {
    const url = document.getElementById('productImageURL').value.trim();
    
    if (!url) {
        showNotification('Please enter an image URL', 'error');
        return;
    }
    
    // Validate URL format
    try {
        new URL(url);
    } catch (e) {
        showNotification('Invalid URL format', 'error');
        return;
    }
    
    productImages.push(url);
    renderImageGallery();
    document.getElementById('productImageURL').value = '';
    showNotification('Image added successfully!', 'success');
}

// Render image gallery
function renderImageGallery() {
    const gallery = document.getElementById('imageGallery');
    
    if (productImages.length === 0) {
        gallery.innerHTML = `
            <div class="gallery-placeholder">
                <p>📸 No images added yet</p>
                <small>Add images below</small>
            </div>
        `;
        return;
    }
    
    gallery.innerHTML = productImages.map((img, index) => `
        <div class="gallery-item">
            <img src="${img}" alt="Product ${index + 1}" onclick="viewImage(${index})">
            <button class="remove-image-btn" onclick="removeImage(${index})" title="Remove image">&times;</button>
            ${index === 0 ? '<span class="main-badge">Main</span>' : ''}
            <div class="image-actions">
                ${index > 0 ? `<button onclick="moveImage(${index}, -1)" title="Move left">←</button>` : ''}
                ${index < productImages.length - 1 ? `<button onclick="moveImage(${index}, 1)" title="Move right">→</button>` : ''}
            </div>
        </div>
    `).join('');
}

// Remove image from gallery
function removeImage(index) {
    productImages.splice(index, 1);
    renderImageGallery();
    showNotification('Image removed', 'success');
}

// Move image position
function moveImage(index, direction) {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= productImages.length) return;
    
    [productImages[index], productImages[newIndex]] = [productImages[newIndex], productImages[index]];
    renderImageGallery();
}

// View image in modal
function viewImage(index) {
    currentImageIndex = index;
    const modal = document.getElementById('imagePreviewModal');
    const img = document.getElementById('previewImage');
    const counter = document.getElementById('imageCounter');
    
    img.src = productImages[index];
    counter.textContent = `${index + 1} / ${productImages.length}`;
    modal.style.display = 'block';
}

// Navigate between images
function navigateImage(direction) {
    currentImageIndex += direction;
    
    if (currentImageIndex < 0) currentImageIndex = productImages.length - 1;
    if (currentImageIndex >= productImages.length) currentImageIndex = 0;
    
    document.getElementById('previewImage').src = productImages[currentImageIndex];
    document.getElementById('imageCounter').textContent = `${currentImageIndex + 1} / ${productImages.length}`;
}

// Setup gradient preview
function setupGradientPreview() {
    const gradientSelect = document.getElementById('productGradient');
    const gradientPreview = document.getElementById('gradientPreview');
    
    gradientSelect.addEventListener('change', function() {
        gradientPreview.style.background = this.value;
    });
    
    gradientPreview.style.background = gradientSelect.value;
}

// Open product modal
function openProductModal(productId = null) {
    editingProductId = productId;
    productImages = [];
    const modal = document.getElementById('productModal');
    const form = document.getElementById('productForm');
    
    if (productId) {
        const product = products.find(p => p.id === productId);
        if (product) {
            document.getElementById('modalTitle').textContent = 'Edit Product';
            document.getElementById('productId').value = product.id;
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productInspiredBy').value = product.inspiredBy || '';
            document.getElementById('productNotes').value = product.notes || '';
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productGradient').value = product.gradient;
            document.getElementById('productFeatured').checked = product.featured || false;
            document.getElementById('productActive').checked = product.active;
            
            // Load existing images
            productImages = product.images ? [...product.images] : [];
            renderImageGallery();
            
            document.getElementById('gradientPreview').style.background = product.gradient;
        }
    } else {
        document.getElementById('modalTitle').textContent = 'Add New Product';
        form.reset();
        productImages = [];
        renderImageGallery();
        document.getElementById('productActive').checked = true;
        document.getElementById('gradientPreview').style.background = document.getElementById('productGradient').value;
    }
    
    modal.style.display = 'block';
}

// Close product modal
function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    document.getElementById('productForm').reset();
    productImages = [];
    editingProductId = null;
}

// Save product
function saveProduct() {
    const name = document.getElementById('productName').value;
    const category = document.getElementById('productCategory').value;
    const price = parseFloat(document.getElementById('productPrice').value);
    const inspiredBy = document.getElementById('productInspiredBy').value;
    const notes = document.getElementById('productNotes').value;
    const description = document.getElementById('productDescription').value;
    const gradient = document.getElementById('productGradient').value;
    const featured = document.getElementById('productFeatured').checked;
    const active = document.getElementById('productActive').checked;
    
    const productData = {
        name,
        category,
        price,
        inspiredBy,
        notes,
        description,
        images: [...productImages], // Save all images
        gradient,
        featured,
        active
    };
    
    if (editingProductId) {
        const index = products.findIndex(p => p.id === editingProductId);
        if (index !== -1) {
            products[index] = {
                ...products[index],
                ...productData,
                updatedAt: new Date().toISOString()
            };
            showNotification('Product updated successfully!', 'success');
        }
    } else {
        const newProduct = {
            id: Date.now(),
            ...productData,
            createdAt: new Date().toISOString()
        };
        products.push(newProduct);
        showNotification('Product added successfully!', 'success');
    }
    
    saveProducts();
    renderProducts();
    closeProductModal();
}

// Edit product
function editProduct(productId) {
    openProductModal(productId);
}

// Delete product
function deleteProduct(productId) {
    const deleteModal = document.getElementById('deleteModal');
    deleteModal.style.display = 'block';
    
    const confirmBtn = document.getElementById('confirmDeleteBtn');
    confirmBtn.onclick = function() {
        products = products.filter(p => p.id !== productId);
        saveProducts();
        renderProducts();
        closeDeleteModal();
        showNotification('Product deleted successfully!', 'success');
    };
}

// Close delete modal
function closeDeleteModal() {
    document.getElementById('deleteModal').style.display = 'none';
}

// Show notification
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
        max-width: 400px;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

window.console.log('✅ Multi-Image Product Management System loaded');