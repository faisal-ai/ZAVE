// ===========================================
// REVIEWS SYSTEM
// ===========================================

console.log('🔄 Loading reviews...');

class ReviewsSystem {
    constructor() {
        this.reviews = JSON.parse(localStorage.getItem('reviews')) || {};
        console.log('Reviews loaded:', Object.keys(this.reviews).length, 'products have reviews');
    }

    addReview(productId, reviewData) {
        if (!this.reviews[productId]) {
            this.reviews[productId] = [];
        }
        
        const review = {
            id: Date.now(),
            rating: reviewData.rating,
            name: reviewData.name,
            title: reviewData.title,
            comment: reviewData.comment,
            date: new Date().toISOString(),
            verified: reviewData.verified || false
        };
        
        this.reviews[productId].push(review);
        this.save();
        console.log('Review added for product', productId);
        return review;
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

    getReviewCount(productId) {
        return (this.reviews[productId] || []).length;
    }

    save() {
        localStorage.setItem('reviews', JSON.stringify(this.reviews));
    }

    getStarsHTML(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let html = '';
        for (let i = 0; i < fullStars; i++) {
            html += '<span class="star full">★</span>';
        }
        if (hasHalfStar) {
            html += '<span class="star half">★</span>';
        }
        for (let i = 0; i < emptyStars; i++) {
            html += '<span class="star empty">☆</span>';
        }
        return html;
    }
}

const reviewsSystem = new ReviewsSystem();

// Add sample reviews
function initializeSampleReviews() {
    const products = JSON.parse(localStorage.getItem('products')) || [];
    
    if (Object.keys(reviewsSystem.reviews).length === 0 && products.length > 0) {
        products.slice(0, 3).forEach(product => {
            reviewsSystem.addReview(product.id, {
                rating: 5,
                name: 'Sarah M.',
                title: 'Amazing fragrance!',
                comment: 'This perfume is absolutely stunning! Long-lasting and smells exactly like the original.',
                verified: true
            });
            
            reviewsSystem.addReview(product.id, {
                rating: 4,
                name: 'Michael R.',
                title: 'Great quality',
                comment: 'Very impressed with the quality. The scent lasts all day.',
                verified: true
            });
        });
        console.log('✅ Sample reviews added');
    }
}

initializeSampleReviews();

console.log('✅ Reviews system ready');



let currentProduct = null;
let currentImageIndex = 0;
let productImages = [];

document.addEventListener('DOMContentLoaded', function() {
    loadProduct();
    setupQuantityHandlers();
});

function loadProduct() {
    const urlParams = new URLSearchParams(window.location.search);
    const productId = parseInt(urlParams.get('id'));
    
    if (!productId) {
        showError('Product not found');
        return;
    }
    
    const products = JSON.parse(localStorage.getItem('products')) || [];
    currentProduct = products.find(p => p.id === productId);
    
    if (!currentProduct || !currentProduct.active) {
        showError('Product not found');
        return;
    }
    
    renderProduct();
}

function renderProduct() {
    document.title = currentProduct.name + ' - ZAVÉ';
    document.getElementById('breadcrumbProduct').textContent = currentProduct.name;
    document.getElementById('productName').textContent = currentProduct.name;
    document.getElementById('productCategory').textContent = getCategoryName(currentProduct.category);
    document.getElementById('productPrice').textContent = '$' + currentProduct.price.toFixed(2);
    document.getElementById('totalPrice').textContent = '$' + currentProduct.price.toFixed(2);
    
    if (currentProduct.inspiredBy) {
        document.getElementById('productInspired').innerHTML = '<strong>Inspired by:</strong> ' + currentProduct.inspiredBy;
    }
    
    if (currentProduct.description) {
        document.getElementById('productDescription').textContent = currentProduct.description;
    }
    
    if (currentProduct.notes) {
        document.getElementById('productNotes').textContent = currentProduct.notes;
    }
    
    loadProductImages();
    document.getElementById('addToCartBtn').addEventListener('click', addToCart);
    loadReviews();
}

function loadProductImages() {
    productImages = currentProduct.images && currentProduct.images.length > 0 ? currentProduct.images : [];
    
    if (productImages.length === 0) {
        document.getElementById('mainImage').style.background = currentProduct.gradient;
        document.getElementById('mainImage').innerHTML = '<div style="text-align:center;padding:40px;color:white;"><h3>' + currentProduct.name + '</h3></div>';
        return;
    }
    
    updateMainImage(0);
    renderThumbnails();
}

function updateMainImage(index) {
    currentImageIndex = index;
    document.getElementById('mainImage').innerHTML = '<img src="' + productImages[index] + '" alt="' + currentProduct.name + '" onclick="openImageLightbox(' + index + ')" style="width:100%;height:100%;object-fit:cover;cursor:pointer;">';
}

function renderThumbnails() {
    if (productImages.length <= 1) return;
    
    const html = productImages.map((img, index) => 
        '<div class="thumbnail ' + (index === 0 ? 'active' : '') + '" onclick="selectThumbnail(' + index + ')"><img src="' + img + '" alt="Image ' + (index + 1) + '"></div>'
    ).join('');
    
    document.getElementById('thumbnailGallery').innerHTML = html;
}

function selectThumbnail(index) {
    document.querySelectorAll('.thumbnail').forEach((thumb, i) => {
        thumb.classList.toggle('active', i === index);
    });
    updateMainImage(index);
}

function openImageLightbox(index) {
    if (productImages.length === 0) return;
    currentImageIndex = index;
    document.getElementById('lightboxImage').src = productImages[index];
    document.getElementById('lightboxCounter').textContent = (index + 1) + ' / ' + productImages.length;
    document.getElementById('imageLightbox').style.display = 'flex';
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    document.getElementById('imageLightbox').style.display = 'none';
    document.body.style.overflow = 'auto';
}

function navigateLightbox(direction) {
    currentImageIndex += direction;
    if (currentImageIndex < 0) currentImageIndex = productImages.length - 1;
    if (currentImageIndex >= productImages.length) currentImageIndex = 0;
    document.getElementById('lightboxImage').src = productImages[currentImageIndex];
    document.getElementById('lightboxCounter').textContent = (currentImageIndex + 1) + ' / ' + productImages.length;
}

function setupQuantityHandlers() {
    document.getElementById('quantity').addEventListener('input', updateTotalPrice);
}

function increaseQuantity() {
    const input = document.getElementById('quantity');
    if (input.value < 10) {
        input.value = parseInt(input.value) + 1;
        updateTotalPrice();
    }
}

function decreaseQuantity() {
    const input = document.getElementById('quantity');
    if (input.value > 1) {
        input.value = parseInt(input.value) - 1;
        updateTotalPrice();
    }
}

function updateTotalPrice() {
    const quantity = parseInt(document.getElementById('quantity').value);
    const total = currentProduct.price * quantity;
    document.getElementById('totalPrice').textContent = '$' + total.toFixed(2);
}

function addToCart() {
    const quantity = parseInt(document.getElementById('quantity').value);
    if (typeof cart !== 'undefined') {
        for (let i = 0; i < quantity; i++) {
            cart.addItem(currentProduct.name, currentProduct.price);
        }
    }
}

function getCategoryName(category) {
    const categories = {'women': 'For Her', 'men': 'For Him', 'unisex': 'Unisex'};
    return categories[category] || category;
}

function showError(message) {
    document.querySelector('.product-detail-section .container').innerHTML = '<div style="text-align:center;padding:80px;"><h2>😔 ' + message + '</h2><p><a href="products.html" class="btn btn-primary">Back to Products</a></p></div>';
}


// Load and display reviews
function loadReviews() {
    const reviews = reviewsSystem.getReviews(currentProduct.id);
    const avgRating = reviewsSystem.getAverageRating(currentProduct.id);
    const reviewCount = reviewsSystem.getReviewCount(currentProduct.id);
    
    // Update rating display in product info
    const ratingSection = document.querySelector('.product-rating');
    if (ratingSection) {
        ratingSection.innerHTML = `
            <div class="stars">${reviewsSystem.getStarsHTML(avgRating)}</div>
            <span class="rating-count">${avgRating} (${reviewCount} reviews)</span>
        `;
    }
    
    // Display reviews
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) return;
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p style="text-align:center;padding:40px;color:#666;">No reviews yet. Be the first to review!</p>';
        return;
    }
    
    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="review-author">
                    <div style="display:flex;gap:10px;align-items:center;">
                        <span class="review-author-name">${review.name}</span>
                        ${review.verified ? '<span class="verified-badge">✓ Verified Purchase</span>' : ''}
                    </div>
                    <div class="stars">${reviewsSystem.getStarsHTML(review.rating)}</div>
                    <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
                </div>
            </div>
            <h4 class="review-title">${review.title}</h4>
            <p class="review-comment">${review.comment}</p>
        </div>
    `).join('');
}

function toggleReviewForm() {
    const form = document.getElementById('reviewForm');
    form.style.display = form.style.display === 'none' ? 'block' : 'none';
}

function submitReview(event) {
    event.preventDefault();
    
    const rating = document.querySelector('input[name="rating"]:checked').value;
    const name = document.getElementById('reviewName').value;
    const title = document.getElementById('reviewTitle').value;
    const comment = ''; // No comment field
    
    reviewsSystem.addReview(currentProduct.id, {
        rating: parseInt(rating),
        name: name,
        title: title,
        comment: comment,
        verified: false
    });
    
    alert('Thank you for your review! ⭐');
    event.target.reset();
    toggleReviewForm();
    loadReviews();
}



// ===========================================
// REVIEWS FUNCTIONS
// ===========================================

function loadReviews() {
    console.log('Loading reviews for product:', currentProduct.id);
    
    const reviews = reviewsSystem.getReviews(currentProduct.id);
    const avgRating = reviewsSystem.getAverageRating(currentProduct.id);
    const reviewCount = reviewsSystem.getReviewCount(currentProduct.id);
    
    console.log('Found', reviews.length, 'reviews, avg rating:', avgRating);
    
    // Update rating in product info
    const ratingSection = document.querySelector('.product-rating');
    if (ratingSection) {
        ratingSection.innerHTML = `
            <div class="stars">${reviewsSystem.getStarsHTML(avgRating)}</div>
            <span class="rating-count">${avgRating} stars (${reviewCount} reviews)</span>
        `;
    }
    
    // Display reviews list
    const reviewsList = document.getElementById('reviewsList');
    if (!reviewsList) {
        console.error('reviewsList element not found!');
        return;
    }
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p style="text-align:center;padding:40px;color:#666;">No reviews yet. Be the first to review!</p>';
        return;
    }
    
    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="review-author">
                    <div style="display:flex;gap:10px;align-items:center;margin-bottom:8px;">
                        <span class="review-author-name">${review.name}</span>
                        ${review.verified ? '<span class="verified-badge">✓ Verified</span>' : ''}
                    </div>
                    <div class="stars">${reviewsSystem.getStarsHTML(review.rating)}</div>
                    <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
                </div>
            </div>
            <h4 class="review-title">${review.title}</h4>
            <p class="review-comment">${review.comment}</p>
        </div>
    `).join('');
}

window.toggleReviewForm = function() {
    console.log('Toggle review form clicked');
    const form = document.getElementById('reviewForm');
    if (form) {
        form.style.display = form.style.display === 'none' ? 'block' : 'none';
        console.log('Form display:', form.style.display);
    } else {
        console.error('Review form not found!');
    }
};

window.submitReview = function(event) {
    event.preventDefault();
    console.log('Submit review clicked');
    
    const ratingInput = document.querySelector('input[name="rating"]:checked');
    if (!ratingInput) {
        alert('Please select a rating');
        return;
    }
    
    const rating = ratingInput.value;
    const name = document.getElementById('reviewName').value;
    const title = document.getElementById('reviewTitle').value;
    const comment = document.getElementById('reviewComment').value;
    
    reviewsSystem.addReview(currentProduct.id, {
        rating: parseInt(rating),
        name: name,
        title: title,
        comment: comment,
        verified: false
    });
    
    alert('Thank you for your review! ⭐');
    event.target.reset();
    toggleReviewForm();
    loadReviews();
};