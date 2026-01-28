// User Authentication and Account Management
class UserAuth {
    constructor() {
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;
        this.users = JSON.parse(localStorage.getItem('users')) || [];
        this.orders = JSON.parse(localStorage.getItem('orders')) || [];
        this.addresses = JSON.parse(localStorage.getItem('addresses')) || [];
        this.init();
    }

    init() {
        this.checkAuthStatus();
        this.setupEventListeners();
        if (this.currentUser) {
            this.showDashboard();
            this.loadDashboardData();
        }
    }

    setupEventListeners() {
        // Auth tabs
        const authTabs = document.querySelectorAll('.auth-tab');
        authTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                authTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const targetTab = tab.getAttribute('data-tab');
                document.querySelectorAll('.auth-form').forEach(form => {
                    form.classList.remove('active');
                });
                document.getElementById(targetTab + 'Form').classList.add('active');
            });
        });

        // Login form
        const loginForm = document.getElementById('loginFormElement');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin();
            });
        }

        // Register form
        const registerForm = document.getElementById('registerFormElement');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister();
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                this.logout();
            });
        }

        // Dashboard tabs
        const dashboardTabs = document.querySelectorAll('.dashboard-tab');
        dashboardTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                dashboardTabs.forEach(t => t.classList.remove('active'));
                tab.classList.add('active');
                
                const targetTab = tab.getAttribute('data-tab');
                document.querySelectorAll('.dashboard-content').forEach(content => {
                    content.classList.remove('active');
                });
                document.getElementById(targetTab + 'Tab').classList.add('active');
                
                // Load specific tab data
                if (targetTab === 'orders') {
                    this.loadOrderHistory();
                } else if (targetTab === 'profile') {
                    this.loadProfile();
                } else if (targetTab === 'addresses') {
                    this.loadAddresses();
                }
            });
        });

        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.updateProfile();
            });
        }

        // Password form
        const passwordForm = document.getElementById('passwordForm');
        if (passwordForm) {
            passwordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.changePassword();
            });
        }

        // Add address button
        const addAddressBtn = document.getElementById('addAddressBtn');
        if (addAddressBtn) {
            addAddressBtn.addEventListener('click', () => {
                document.getElementById('addAddressModal').style.display = 'block';
            });
        }

        // Add address form
        const addAddressForm = document.getElementById('addAddressForm');
        if (addAddressForm) {
            addAddressForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.addAddress();
            });
        }

        // Close modals
        const closeOrderDetails = document.getElementById('closeOrderDetails');
        if (closeOrderDetails) {
            closeOrderDetails.addEventListener('click', () => {
                document.getElementById('orderDetailsModal').style.display = 'none';
            });
        }

        const closeAddressModal = document.getElementById('closeAddressModal');
        if (closeAddressModal) {
            closeAddressModal.addEventListener('click', () => {
                document.getElementById('addAddressModal').style.display = 'none';
            });
        }

        // Switch to login
        const switchToLogin = document.querySelector('.switch-to-login');
        if (switchToLogin) {
            switchToLogin.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelector('[data-tab="login"]').click();
            });
        }

        // Order status filters
        const orderFilters = document.querySelectorAll('.orders-filter .filter-btn');
        orderFilters.forEach(btn => {
            btn.addEventListener('click', () => {
                orderFilters.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const status = btn.getAttribute('data-status');
                this.filterOrders(status);
            });
        });
    }

    handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        const user = this.users.find(u => u.email === email && u.password === password);

        if (user) {
            this.currentUser = user;
            localStorage.setItem('currentUser', JSON.stringify(user));
            this.showNotification('Welcome back, ' + user.name + '!', 'success');
            this.showDashboard();
            this.loadDashboardData();
        } else {
            this.showNotification('Invalid email or password', 'error');
        }
    }

    handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('registerConfirmPassword').value;
        const agreeTerms = document.getElementById('agreeTerms').checked;

        // Validation
        if (password !== confirmPassword) {
            this.showNotification('Passwords do not match', 'error');
            return;
        }

        if (!agreeTerms) {
            this.showNotification('Please agree to the terms and conditions', 'error');
            return;
        }

        // Check if user already exists
        if (this.users.some(u => u.email === email)) {
            this.showNotification('Email already registered', 'error');
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            phone: '',
            dob: '',
            createdAt: new Date().toISOString()
        };

        this.users.push(newUser);
        localStorage.setItem('users', JSON.stringify(this.users));

        // Auto login
        this.currentUser = newUser;
        localStorage.setItem('currentUser', JSON.stringify(newUser));

        this.showNotification('Account created successfully!', 'success');
        this.showDashboard();
        this.loadDashboardData();
    }

    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
        this.showNotification('Logged out successfully', 'success');
        document.getElementById('accountDashboard').style.display = 'none';
        document.getElementById('authForms').style.display = 'block';
        this.updateAccountLink();
    }

    showDashboard() {
        document.getElementById('authForms').style.display = 'none';
        document.getElementById('accountDashboard').style.display = 'block';
        this.updateAccountLink();
    }

    checkAuthStatus() {
        this.updateAccountLink();
    }

    updateAccountLink() {
        const accountLink = document.getElementById('accountLink');
        if (accountLink) {
            if (this.currentUser) {
                accountLink.textContent = this.currentUser.name.split(' ')[0];
            } else {
                accountLink.textContent = 'Account';
            }
        }
    }

    loadDashboardData() {
        this.loadOverview();
        this.loadRecentOrders();
    }

    loadOverview() {
        const userOrders = this.orders.filter(o => o.userId === this.currentUser.id);
        
        document.getElementById('totalOrders').textContent = userOrders.length;
        document.getElementById('pendingOrders').textContent = userOrders.filter(o => o.status === 'pending' || o.status === 'processing').length;
        document.getElementById('completedOrders').textContent = userOrders.filter(o => o.status === 'delivered').length;
        
        const totalSpent = userOrders.reduce((sum, order) => sum + order.total, 0);
        document.getElementById('totalSpent').textContent = '$' + totalSpent.toFixed(2);
    }

    loadRecentOrders() {
        const userOrders = this.orders.filter(o => o.userId === this.currentUser.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 3);

        const recentOrdersList = document.getElementById('recentOrdersList');
        
        if (userOrders.length === 0) {
            recentOrdersList.innerHTML = '<p class="no-orders">No orders yet. <a href="products.html">Start shopping!</a></p>';
            return;
        }

        recentOrdersList.innerHTML = userOrders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <h4>Order #${order.orderNumber}</h4>
                        <p class="order-date">${new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <span class="order-status status-${order.status}">${order.status}</span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `<p>${item.quantity}x ${item.product}</p>`).join('')}
                </div>
                <div class="order-footer">
                    <span class="order-total">$${order.total.toFixed(2)}</span>
                    <button class="btn btn-secondary btn-small" onclick="userAuth.viewOrderDetails(${order.orderNumber})">View Details</button>
                </div>
            </div>
        `).join('');
    }

    loadOrderHistory() {
        const userOrders = this.orders.filter(o => o.userId === this.currentUser.id)
            .sort((a, b) => new Date(b.date) - new Date(a.date));

        this.renderOrders(userOrders);
    }

    filterOrders(status) {
        const userOrders = this.orders.filter(o => o.userId === this.currentUser.id);
        
        if (status === 'all') {
            this.renderOrders(userOrders);
        } else {
            const filtered = userOrders.filter(o => o.status === status);
            this.renderOrders(filtered);
        }
    }

    renderOrders(orders) {
        const ordersList = document.getElementById('ordersList');
        
        if (orders.length === 0) {
            ordersList.innerHTML = '<p class="no-orders">No orders found.</p>';
            return;
        }

        ordersList.innerHTML = orders.map(order => `
            <div class="order-card">
                <div class="order-header">
                    <div>
                        <h4>Order #${order.orderNumber}</h4>
                        <p class="order-date">${new Date(order.date).toLocaleDateString()}</p>
                    </div>
                    <span class="order-status status-${order.status}">${order.status}</span>
                </div>
                <div class="order-items">
                    ${order.items.map(item => `<p>${item.quantity}x ${item.product} - $${item.price.toFixed(2)}</p>`).join('')}
                </div>
                <div class="order-footer">
                    <span class="order-total">Total: $${order.total.toFixed(2)}</span>
                    <button class="btn btn-secondary btn-small" onclick="userAuth.viewOrderDetails(${order.orderNumber})">Track Order</button>
                </div>
            </div>
        `).join('');
    }

    viewOrderDetails(orderNumber) {
        const order = this.orders.find(o => o.orderNumber === orderNumber);
        if (!order) return;

        const modal = document.getElementById('orderDetailsModal');
        const content = document.getElementById('orderDetailsContent');

        // Tracking timeline
        const statuses = ['pending', 'processing', 'shipped', 'delivered'];
        const currentIndex = statuses.indexOf(order.status);

        content.innerHTML = `
            <h2>Order #${order.orderNumber}</h2>
            <p class="order-date">Placed on ${new Date(order.date).toLocaleDateString()}</p>
            
            <div class="order-tracking">
                <h3>Order Status</h3>
                <div class="tracking-timeline">
                    <div class="tracking-step ${currentIndex >= 0 ? 'completed' : ''}">
                        <div class="tracking-dot"></div>
                        <div class="tracking-label">
                            <strong>Order Placed</strong>
                            <p>${new Date(order.date).toLocaleDateString()}</p>
                        </div>
                    </div>
                    <div class="tracking-step ${currentIndex >= 1 ? 'completed' : ''}">
                        <div class="tracking-dot"></div>
                        <div class="tracking-label">
                            <strong>Processing</strong>
                            <p>${currentIndex >= 1 ? new Date(Date.parse(order.date) + 86400000).toLocaleDateString() : 'Pending'}</p>
                        </div>
                    </div>
                    <div class="tracking-step ${currentIndex >= 2 ? 'completed' : ''}">
                        <div class="tracking-dot"></div>
                        <div class="tracking-label">
                            <strong>Shipped</strong>
                            <p>${currentIndex >= 2 ? new Date(Date.parse(order.date) + 172800000).toLocaleDateString() : 'Pending'}</p>
                        </div>
                    </div>
                    <div class="tracking-step ${currentIndex >= 3 ? 'completed' : ''}">
                        <div class="tracking-dot"></div>
                        <div class="tracking-label">
                            <strong>Delivered</strong>
                            <p>${currentIndex >= 3 ? new Date(Date.parse(order.date) + 432000000).toLocaleDateString() : 'Pending'}</p>
                        </div>
                    </div>
                </div>
                ${order.status === 'shipped' ? `<p class="tracking-number">Tracking Number: <strong>${order.trackingNumber || 'ZV' + orderNumber + 'US'}</strong></p>` : ''}
            </div>

            <div class="order-details-section">
                <h3>Order Items</h3>
                <div class="order-items-list">
                    ${order.items.map(item => `
                        <div class="order-item-detail">
                            <span>${item.quantity}x ${item.product}</span>
                            <span>$${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="order-details-section">
                <h3>Shipping Address</h3>
                <p>${order.shippingAddress.name}<br>
                ${order.shippingAddress.address}<br>
                ${order.shippingAddress.city}, ${order.shippingAddress.zip}<br>
                ${order.shippingAddress.country}</p>
            </div>

            <div class="order-summary-detail">
                <div class="summary-row"><span>Subtotal:</span><span>$${order.subtotal.toFixed(2)}</span></div>
                <div class="summary-row"><span>Shipping:</span><span>$${order.shipping.toFixed(2)}</span></div>
                <div class="summary-row"><span>Tax:</span><span>$${order.tax.toFixed(2)}</span></div>
                <div class="summary-row total"><span>Total:</span><span>$${order.total.toFixed(2)}</span></div>
            </div>
        `;

        modal.style.display = 'block';
    }

    loadProfile() {
        document.getElementById('profileName').value = this.currentUser.name;
        document.getElementById('profileEmail').value = this.currentUser.email;
        document.getElementById('profilePhone').value = this.currentUser.phone || '';
        document.getElementById('profileDOB').value = this.currentUser.dob || '';
    }

    updateProfile() {
        const name = document.getElementById('profileName').value;
        const phone = document.getElementById('profilePhone').value;
        const dob = document.getElementById('profileDOB').value;

        this.currentUser.name = name;
        this.currentUser.phone = phone;
        this.currentUser.dob = dob;

        // Update in users array
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            localStorage.setItem('users', JSON.stringify(this.users));
        }

        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        this.updateAccountLink();
        this.showNotification('Profile updated successfully!', 'success');
    }

    changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;

        if (currentPassword !== this.currentUser.password) {
            this.showNotification('Current password is incorrect', 'error');
            return;
        }

        if (newPassword !== confirmNewPassword) {
            this.showNotification('New passwords do not match', 'error');
            return;
        }

        if (newPassword.length < 6) {
            this.showNotification('Password must be at least 6 characters', 'error');
            return;
        }

        this.currentUser.password = newPassword;

        // Update in users array
        const userIndex = this.users.findIndex(u => u.id === this.currentUser.id);
        if (userIndex !== -1) {
            this.users[userIndex] = this.currentUser;
            localStorage.setItem('users', JSON.stringify(this.users));
        }

        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        document.getElementById('passwordForm').reset();
        this.showNotification('Password changed successfully!', 'success');
    }

    loadAddresses() {
        const userAddresses = this.addresses.filter(a => a.userId === this.currentUser.id);
        const addressesList = document.getElementById('addressesList');

        if (userAddresses.length === 0) {
            addressesList.innerHTML = '<p class="no-addresses">No saved addresses. Add one to make checkout faster!</p>';
            return;
        }

        addressesList.innerHTML = userAddresses.map((address, index) => `
            <div class="address-card ${address.isDefault ? 'default-address' : ''}">
                <div class="address-header">
                    <h4>${address.label} ${address.isDefault ? '<span class="badge">Default</span>' : ''}</h4>
                    <div class="address-actions">
                        <button class="btn-icon" onclick="userAuth.editAddress(${address.id})">✎</button>
                        <button class="btn-icon" onclick="userAuth.deleteAddress(${address.id})">🗑</button>
                    </div>
                </div>
                <p>${address.name}<br>
                ${address.street}<br>
                ${address.city}, ${address.zip}<br>
                ${address.country}<br>
                Phone: ${address.phone}</p>
                ${!address.isDefault ? `<button class="btn btn-secondary btn-small" onclick="userAuth.setDefaultAddress(${address.id})">Set as Default</button>` : ''}
            </div>
        `).join('');
    }

    addAddress() {
        const address = {
            id: Date.now(),
            userId: this.currentUser.id,
            label: document.getElementById('addressLabel').value,
            name: document.getElementById('addressName').value,
            street: document.getElementById('addressStreet').value,
            city: document.getElementById('addressCity').value,
            zip: document.getElementById('addressZip').value,
            country: document.getElementById('addressCountry').value,
            phone: document.getElementById('addressPhone').value,
            isDefault: document.getElementById('addressDefault').checked
        };

        // If setting as default, remove default from other addresses
        if (address.isDefault) {
            this.addresses.forEach(a => {
                if (a.userId === this.currentUser.id) {
                    a.isDefault = false;
                }
            });
        }

        this.addresses.push(address);
        localStorage.setItem('addresses', JSON.stringify(this.addresses));
        
        document.getElementById('addAddressModal').style.display = 'none';
        document.getElementById('addAddressForm').reset();
        this.showNotification('Address added successfully!', 'success');
        this.loadAddresses();
    }

    deleteAddress(addressId) {
        if (confirm('Are you sure you want to delete this address?')) {
            this.addresses = this.addresses.filter(a => a.id !== addressId);
            localStorage.setItem('addresses', JSON.stringify(this.addresses));
            this.showNotification('Address deleted', 'success');
            this.loadAddresses();
        }
    }

    setDefaultAddress(addressId) {
        this.addresses.forEach(a => {
            if (a.userId === this.currentUser.id) {
                a.isDefault = (a.id === addressId);
            }
        });
        localStorage.setItem('addresses', JSON.stringify(this.addresses));
        this.showNotification('Default address updated', 'success');
        this.loadAddresses();
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
            animation: slideInRight 0.3s ease;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize auth system
const userAuth = new UserAuth();

// Create sample orders for demo purposes (only if no orders exist)
if (!localStorage.getItem('ordersInitialized')) {
    const sampleOrders = [];
    localStorage.setItem('orders', JSON.stringify(sampleOrders));
    localStorage.setItem('ordersInitialized', 'true');
}