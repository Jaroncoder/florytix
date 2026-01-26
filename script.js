// Register Service Worker for PWA
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Use relative path to work with both user pages and project pages on GitHub Pages
        navigator.serviceWorker.register('sw.js')
            .then((registration) => {
                console.log('Service Worker registered successfully:', registration.scope);
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    console.log('New service worker found');
                });
            })
            .catch((error) => {
                console.error('Service Worker registration failed:', error);
            });
    });
    
    // Check if service worker is already controlling the page
    if (navigator.serviceWorker.controller) {
        console.log('Service Worker is controlling this page');
    }
}

// Install PWA prompt
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    showInstallPrompt();
});

function showInstallPrompt() {
    const installBanner = document.createElement('div');
    installBanner.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: linear-gradient(135deg, #FF1493 0%, #FF69B4 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        box-shadow: 0 5px 20px rgba(255, 20, 147, 0.3);
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 15px;
        animation: slideUp 0.5s ease;
    `;
    installBanner.innerHTML = `
        <span>Install Florytix app for better experience</span>
        <button id="installBtn" style="background: white; color: #FF1493; border: none; padding: 8px 20px; border-radius: 20px; font-weight: 600; cursor: pointer;">Install</button>
        <button id="dismissBtn" style="background: transparent; color: white; border: 1px solid white; padding: 8px 15px; border-radius: 20px; font-weight: 600; cursor: pointer;">Later</button>
    `;
    document.body.appendChild(installBanner);

    document.getElementById('installBtn').addEventListener('click', async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`User response to install prompt: ${outcome}`);
            deferredPrompt = null;
        }
        installBanner.remove();
    });

    document.getElementById('dismissBtn').addEventListener('click', () => {
        installBanner.remove();
    });
}

// Products Data
const products = [
    {
        id: 1,
        name: 'Red Rose Bouquet',
        category: 'roses',
        price: 3699,
        image: 'images/rose-red.png',
        description: 'Classic red roses, perfect for expressing love'
    },
    {
        id: 2,
        name: 'Pink Tulip Bundle',
        category: 'tulips',
        price: 2899,
        image: 'images/tulip-pink.png',
        description: 'Fresh pink tulips from Holland'
    },
    {
        id: 3,
        name: 'Sunflower Delight',
        category: 'bouquets',
        price: 2649,
        image: 'images/sunflower.png',
        description: 'Bright sunflowers to brighten your day'
    },
    {
        id: 4,
        name: 'Hibiscus Paradise',
        category: 'bouquets',
        price: 3129,
        image: 'images/hibiscus.png',
        description: 'Tropical hibiscus arrangement'
    },
    {
        id: 5,
        name: 'Cherry Blossom',
        category: 'bouquets',
        price: 3449,
        image: 'images/cherry-blossom.png',
        description: 'Delicate cherry blossoms in full bloom'
    },
    {
        id: 6,
        name: 'White Lily Elegance',
        category: 'lilies',
        price: 3929,
        image: 'images/lily-white.png',
        description: 'Elegant white lilies for special occasions'
    },
    {
        id: 7,
        name: 'Mixed Wildflowers',
        category: 'bouquets',
        price: 2399,
        image: 'images/wildflowers.png',
        description: 'Colorful wildflower collection'
    },
    {
        id: 8,
        name: 'Royal Rose Collection',
        category: 'roses',
        price: 4499,
        image: 'images/royal-rose.png',
        description: 'Premium long-stem roses'
    },
    {
        id: 9,
        name: 'Spring Tulips',
        category: 'tulips',
        price: 2729,
        image: 'images/tulip-spring.png',
        description: 'Vibrant spring tulip mix'
    },
    {
        id: 10,
        name: 'Daisy Dream',
        category: 'bouquets',
        price: 2249,
        image: 'images/daisy.png',
        description: 'Cheerful white daisies'
    },
    {
        id: 11,
        name: 'Pink Rose Romance',
        category: 'roses',
        price: 3529,
        image: 'images/rose-pink.png',
        description: 'Soft pink roses for romance'
    },
    {
        id: 12,
        name: 'Lotus Serenity',
        category: 'lilies',
        price: 4249,
        image: 'images/lotus.png',
        description: 'Peaceful lotus flowers'
    }
];

// Cart functionality
let cart = JSON.parse(localStorage.getItem('florytixCart')) || [];

// Update cart count
function updateCartCount() {
    const cartCount = cart.reduce((total, item) => total + item.quantity, 0);
    const cartCountElements = document.querySelectorAll('#cartCount');
    cartCountElements.forEach(element => {
        element.textContent = cartCount;
    });
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('florytixCart', JSON.stringify(cart));
    updateCartCount();
}

// Add to cart
function addToCart(productId) {
    const product = products.find(p => p.id === productId);
    const existingItem = cart.find(item => item.id === productId);
    
    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }
    
    saveCart();
    showNotification('Added to cart! ✓');
}

// Remove from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.id !== productId);
    saveCart();
    loadCart();
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(item => item.id === productId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(productId);
        } else {
            saveCart();
            loadCart();
        }
    }
}

// Create product card
function createProductCard(product) {
    return `
        <div class="product-card" data-category="${product.category}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" onerror="this.src='images/placeholder.jpg'">
            </div>
            <div class="product-info">
                <div class="product-category">${product.category}</div>
                <h3 class="product-name">${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <div class="product-footer">
                    <span class="product-price">₹${product.price.toFixed(2)}</span>
                    <button class="btn-add-cart" onclick="addToCart(${product.id})">
                        <i class="fas fa-shopping-cart"></i>
                        <span>Add</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Load products
function loadProducts(filter = 'all') {
    const featuredContainer = document.getElementById('featuredProducts');
    const shopContainer = document.getElementById('shopProducts');
    
    const filteredProducts = filter === 'all' 
        ? products 
        : products.filter(p => p.category === filter);
    
    const productsHTML = filteredProducts.map(createProductCard).join('');
    
    if (featuredContainer) {
        featuredContainer.innerHTML = filteredProducts.slice(0, 6).map(createProductCard).join('');
    }
    
    if (shopContainer) {
        shopContainer.innerHTML = productsHTML;
    }
}

// Filter products
function setupFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', () => {
            filterButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const filter = button.dataset.filter;
            loadProducts(filter);
        });
    });
}

// Load cart page
function loadCart() {
    const cartItemsContainer = document.getElementById('cartItems');
    
    if (!cartItemsContainer) return;
    
    if (cart.length === 0) {
        cartItemsContainer.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">⊘</div>
                <h3>Your cart is empty</h3>
                <p>Add some beautiful flowers to get started!</p>
                <a href="shop.html" class="btn btn-primary" style="margin-top: 20px;">
                    <span>Shop Now</span>
                    <i class="fas fa-arrow-right"></i>
                </a>
            </div>
        `;
        updateSummary();
        return;
    }
    
    const cartHTML = cart.map(item => `
        <div class="cart-item">
            <div class="cart-item-image">
                <img src="${item.image}" alt="${item.name}" onerror="this.src='images/placeholder.jpg'">
            </div>
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
                <div class="cart-item-quantity">
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, -1)">-</button>
                    <span class="qty-value">${item.quantity}</span>
                    <button class="qty-btn" onclick="updateQuantity(${item.id}, 1)">+</button>
                </div>
            </div>
            <div class="cart-item-actions">
                <button class="btn-remove" onclick="removeFromCart(${item.id})">
                    <i class="fas fa-trash"></i> Remove
                </button>
            </div>
        </div>
    `).join('');
    
    cartItemsContainer.innerHTML = cartHTML;
    updateSummary();
}

// Update cart summary
function updateSummary() {
    const subtotal = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    const shipping = subtotal > 0 ? (subtotal >= 4000 ? 0 : 99) : 0;
    const total = subtotal + shipping;
    
    const subtotalElement = document.getElementById('subtotal');
    const shippingElement = document.getElementById('shipping');
    const totalElement = document.getElementById('total');
    
    if (subtotalElement) subtotalElement.textContent = `₹${subtotal.toFixed(2)}`;
    if (shippingElement) {
        shippingElement.textContent = shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`;
    }
    if (totalElement) totalElement.textContent = `₹${total.toFixed(2)}`;
}

// Checkout function
function checkout() {
    if (cart.length === 0) {
        showCustomAlert('Your cart is empty! ⊘', 'Please add some items to your cart before checkout.');
        return;
    }
    
    // Calculate delivery date (3-5 days from now)
    const deliveryDate = new Date();
    deliveryDate.setDate(deliveryDate.getDate() + Math.floor(Math.random() * 3) + 3);
    const formattedDate = deliveryDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    showCustomAlert(
        'Purchase Successful! ✓',
        `Thank you for your order! Your beautiful flowers will be delivered by ${formattedDate}. We appreciate your business! ✿`
    );
    
    // Clear cart after checkout
    setTimeout(() => {
        cart = [];
        saveCart();
        loadCart();
    }, 3000);
}

// Custom alert
function showCustomAlert(title, message) {
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'alert-overlay';
    
    // Create alert
    const alert = document.createElement('div');
    alert.className = 'custom-alert';
    alert.innerHTML = `
        <div class="alert-icon">✅</div>
        <h2 class="alert-title">${title}</h2>
        <p class="alert-message">${message}</p>
        <button class="btn btn-primary" onclick="closeCustomAlert()">
            <span>OK</span>
            <i class="fas fa-check"></i>
        </button>
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(alert);
    
    // Show with animation
    setTimeout(() => {
        overlay.classList.add('show');
        alert.classList.add('show');
    }, 10);
}

// Close custom alert
function closeCustomAlert() {
    const overlay = document.querySelector('.alert-overlay');
    const alert = document.querySelector('.custom-alert');
    
    if (overlay && alert) {
        overlay.classList.remove('show');
        alert.classList.remove('show');
        
        setTimeout(() => {
            overlay.remove();
            alert.remove();
        }, 300);
    }
}

// Simple notification
function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #FF1493 0%, #FF69B4 100%);
        color: white;
        padding: 15px 25px;
        border-radius: 50px;
        box-shadow: 0 5px 20px rgba(255, 20, 147, 0.3);
        z-index: 10000;
        animation: slideInRight 0.5s ease, slideOutRight 0.5s ease 2.5s;
        font-weight: 600;
    `;
    notification.textContent = message;
    
    // Add animation styles
    if (!document.getElementById('notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
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
    }
    
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
}

// Contact form submission
function setupContactForm() {
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            showCustomAlert(
                'Message Sent! ✉',
                'Thank you for contacting us! We\'ll get back to you within 24 hours.'
            );
            contactForm.reset();
        });
    }
}

// Setup checkout button
function setupCheckout() {
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', checkout);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    loadProducts();
    loadCart();
    setupFilters();
    setupContactForm();
    setupCheckout();
    
    // Add smooth scroll
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });
});

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.closeCustomAlert = closeCustomAlert;
