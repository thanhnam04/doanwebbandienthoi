// API Configuration
const API_BASE_URL = 'http://localhost:3001/api';

// Authentication API
const AuthAPI = {
    async login(username, password) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            return await response.json();
        } catch (error) {
            console.error('Login error:', error);
            return { error: 'Network error' };
        }
    },

    async register(userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            console.error('Register error:', error);
            return { error: 'Network error' };
        }
    },

    async getProfile(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile/${userId}`);
            return await response.json();
        } catch (error) {
            console.error('Get profile error:', error);
            return { error: 'Network error' };
        }
    },

    async updateProfile(userId, userData) {
        try {
            const response = await fetch(`${API_BASE_URL}/auth/profile/${userId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            return await response.json();
        } catch (error) {
            console.error('Update profile error:', error);
            return { error: 'Network error' };
        }
    }
};

// Products API
const ProductsAPI = {
    async getAll() {
        try {
            const response = await fetch(`${API_BASE_URL}/products`);
            return await response.json();
        } catch (error) {
            console.error('Get products error:', error);
            return [];
        }
    },

    async getById(masp) {
        try {
            const response = await fetch(`${API_BASE_URL}/products/${masp}`);
            return await response.json();
        } catch (error) {
            console.error('Get product error:', error);
            return { error: 'Product not found' };
        }
    },

    async search(searchTerm) {
        try {
            const response = await fetch(`${API_BASE_URL}/products?search=${encodeURIComponent(searchTerm)}`);
            return await response.json();
        } catch (error) {
            console.error('Search products error:', error);
            return [];
        }
    },

    async filter(filters) {
        try {
            const params = new URLSearchParams(filters);
            const response = await fetch(`${API_BASE_URL}/products?${params}`);
            return await response.json();
        } catch (error) {
            console.error('Filter products error:', error);
            return [];
        }
    }
};

// Orders API
const OrdersAPI = {
    async create(orderData) {
        try {
            const response = await fetch(`${API_BASE_URL}/orders`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(orderData)
            });
            return await response.json();
        } catch (error) {
            console.error('Create order error:', error);
            return { error: 'Network error' };
        }
    },

    async getUserOrders(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/orders/user/${userId}`);
            return await response.json();
        } catch (error) {
            console.error('Get user orders error:', error);
            return [];
        }
    }
};

// Cart API
const CartAPI = {
    async get(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/${userId}`);
            return await response.json();
        } catch (error) {
            console.error('Get cart error:', error);
            return [];
        }
    },

    async add(userId, masp, quantity = 1) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/${userId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ masp, quantity })
            });
            return await response.json();
        } catch (error) {
            console.error('Add to cart error:', error);
            return { error: 'Network error' };
        }
    },

    async update(userId, masp, quantity) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/${userId}/${masp}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ quantity })
            });
            return await response.json();
        } catch (error) {
            console.error('Update cart error:', error);
            return { error: 'Network error' };
        }
    },

    async remove(userId, masp) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/${userId}/${masp}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Remove from cart error:', error);
            return { error: 'Network error' };
        }
    },

    async clear(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/cart/${userId}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Clear cart error:', error);
            return { error: 'Network error' };
        }
    }
};

// Admin API
const AdminAPI = {
    async getOrders() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/orders`);
            return await response.json();
        } catch (error) {
            console.error('Get admin orders error:', error);
            return [];
        }
    },

    async updateOrderStatus(orderId, status) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/orders/${orderId}/status`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status })
            });
            return await response.json();
        } catch (error) {
            console.error('Update order status error:', error);
            return { error: 'Network error' };
        }
    },

    async getUsers() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users`);
            return await response.json();
        } catch (error) {
            console.error('Get admin users error:', error);
            return [];
        }
    },

    async deleteUser(userId) {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Delete user error:', error);
            return { error: 'Network error' };
        }
    },

    async getStats() {
        try {
            const response = await fetch(`${API_BASE_URL}/admin/stats`);
            return await response.json();
        } catch (error) {
            console.error('Get admin stats error:', error);
            return { error: 'Network error' };
        }
    }
};

// User session management
const UserSession = {
    login(userData) {
        localStorage.setItem('currentUser', JSON.stringify(userData));
        localStorage.setItem('userToken', userData.token);
    },

    logout() {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userToken');
    },

    getCurrentUser() {
        const user = localStorage.getItem('currentUser');
        return user ? JSON.parse(user) : null;
    },

    isLoggedIn() {
        return !!localStorage.getItem('userToken');
    },

    isAdmin() {
        const user = this.getCurrentUser();
        return user && user.user && user.user.role === 'admin';
    }
};