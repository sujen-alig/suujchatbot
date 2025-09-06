// ModHub APK Downloader - Main Application Logic
const firebaseConfig = {
apiKey: "AIzaSyA9fayWTnESdVkgpHFZljzcsYRrqr2_FXc",
  authDomain: "chutiys-80753.firebaseapp.com",
  projectId: "chutiys-80753",
  storageBucket: "chutiys-80753.firebasestorage.app",
 messagingSenderId: "641714252457",
  appId: "1:641714252457:web:804144a8bf4e2b9600d7b8",
  
};
const app = firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();

// Application Data
const appData = {
  "featuredApps": [
    {
      "id": "1",
      "name": "Spotify Premium",
      "category": "Music",
      "version": "8.9.10.487",
      "size": "58.2 MB",
      "downloads": 2456789,
      "rating": 4.8,
      "description": "Unlimited music streaming with premium features unlocked",
      "modFeatures": ["Premium Unlocked", "Ad-Free", "Unlimited Skips", "High Quality Audio"],
      "icon": "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop",
      "screenshots": [
        "https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=300&h=500&fit=crop",
        "https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=300&h=500&fit=crop"
      ]
    },
    {
      "id": "2", 
      "name": "Instagram Plus",
      "category": "Social",
      "version": "295.0.0.31.123",
      "size": "42.8 MB",
      "downloads": 1873456,
      "rating": 4.6,
      "description": "Enhanced Instagram with download features and privacy options",
      "modFeatures": ["Download Photos/Videos", "Privacy Mode", "No Ads", "Story Saver"],
      "icon": "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=100&h=100&fit=crop",
      "screenshots": [
        "https://images.unsplash.com/photo-1611262588024-d12430b98920?w=300&h=500&fit=crop"
      ]
    },
    {
      "id": "3",
      "name": "WhatsApp Plus",
      "category": "Communication", 
      "version": "17.52.0",
      "size": "67.4 MB",
      "downloads": 3245678,
      "rating": 4.7,
      "description": "Modified WhatsApp with enhanced features and customization",
      "modFeatures": ["Custom Themes", "Hide Online Status", "Anti-Delete Messages", "Dual Account"],
      "icon": "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=100&h=100&fit=crop",
      "screenshots": [
        "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=300&h=500&fit=crop"
      ]
    },
    {
      "id": "4",
      "name": "Minecraft Premium",
      "category": "Games",
      "version": "1.20.81.01",
      "size": "156.7 MB", 
      "downloads": 4567891,
      "rating": 4.9,
      "description": "Premium Minecraft with all features unlocked and skins included",
      "modFeatures": ["All Skins Unlocked", "Unlimited Resources", "Premium Features", "No Ads"],
      "icon": "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=100&h=100&fit=crop",
      "screenshots": [
        "https://images.unsplash.com/photo-1606092195730-5d7b9af1efc5?w=300&h=500&fit=crop"
      ]
    },
    {
      "id": "5",
      "name": "YouTube Vanced",
      "category": "Video",
      "version": "18.21.34",
      "size": "89.3 MB",
      "downloads": 5678912,
      "rating": 4.8,
      "description": "Advanced YouTube with ad blocking and background playback",
      "modFeatures": ["Ad Blocker", "Background Play", "Picture in Picture", "Dark Theme"],
      "icon": "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=100&h=100&fit=crop",
      "screenshots": [
        "https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=300&h=500&fit=crop"
      ]
    }
  ],
  "categories": [
    {"name": "Games", "count": 1247, "icon": "🎮"},
    {"name": "Social", "count": 456, "icon": "👥"},
    {"name": "Music", "count": 234, "icon": "🎵"},
    {"name": "Video", "count": 345, "icon": "🎬"},
    {"name": "Tools", "count": 678, "icon": "🔧"},
    {"name": "Communication", "count": 123, "icon": "💬"},
    {"name": "Photography", "count": 234, "icon": "📷"},
    {"name": "Entertainment", "count": 456, "icon": "🎭"}
  ],
  "adminStats": {
    "totalUsers": 125847,
    "totalDownloads": 23456789,
    "totalApps": 3456,
    "monthlyRevenue": 8943.67,
    "activeUsers": 45678,
    "todayDownloads": 67891
  },
  "recentUploads": [
    {"name": "TikTok Pro", "uploadDate": "2025-09-06", "status": "Approved", "downloads": 23456},
    {"name": "Snapchat Plus", "uploadDate": "2025-09-05", "status": "Pending", "downloads": 0},
    {"name": "Netflix Mod", "uploadDate": "2025-09-04", "status": "Approved", "downloads": 56789}
  ],
  "userAnalytics": {
    "topCountries": [
      {"country": "India", "users": 34567, "percentage": 27.5},
      {"country": "United States", "users": 23456, "percentage": 18.6},
      {"country": "Brazil", "users": 18765, "percentage": 14.9},
      {"country": "Indonesia", "users": 15234, "percentage": 12.1},
      {"country": "Others", "users": 34825, "percentage": 27.7}
    ],
    "downloadTrends": [
      {"month": "Jan", "downloads": 456789},
      {"month": "Feb", "downloads": 567891},
      {"month": "Mar", "downloads": 678912},
      {"month": "Apr", "downloads": 789123},
      {"month": "May", "downloads": 891234},
      {"month": "Jun", "downloads": 912345},
      {"month": "Jul", "downloads": 1023456},
      {"month": "Aug", "downloads": 1134567},
      {"month": "Sep", "downloads": 1245678}
    ]
  }
};

// Application State
let currentUser = null;
let isAdminLoggedIn = false;
let currentTheme = 'light';

// Initialize Application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    renderFeaturedApps();
    renderCategories();
    setupAdminPanel();
    setupTheme();
    populateSearchFilters();
    
    // Show home page by default
    navigateToPage('home');
}

// Event Listeners
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) {
                navigateToPage(page);
            }
        });
    });

    // Admin Navigation
    document.querySelectorAll('.admin-nav-link').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.adminPage;
            if (page) {
                navigateToAdminPage(page);
            }
        });
    });

    // Login/Logout - Fixed to prevent navigation conflict
    const loginBtn = document.getElementById('loginBtn');
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            showLoginModal();
        });
    }
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            logout();
        });
    }

    // Login Modal
    const closeLoginModal = document.getElementById('closeLoginModal');
    if (closeLoginModal) {
        closeLoginModal.addEventListener('click', hideLoginModal);
    }
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchLoginTab(tab);
        });
    });

    // Login Forms
    const userLoginBtn = document.getElementById('userLoginBtn');
    if (userLoginBtn) {
        userLoginBtn.addEventListener('click', loginUser);
    }
    
    const adminLoginBtn = document.getElementById('adminLoginBtn');
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', loginAdmin);
    }

    // Theme Toggle
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
    }

    // Search
    const searchBtn = document.getElementById('searchBtn');
    if (searchBtn) {
        searchBtn.addEventListener('click', performSearch);
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') performSearch();
        });
    }

    // Modal Close
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', hideAppModal);
    }

    // Upload functionality
    setupUploadListeners();
    
    // Close modals when clicking outside
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal')) {
            hideAppModal();
            hideLoginModal();
        }
    });
}

function setupUploadListeners() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    
    if (uploadArea && fileInput) {
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--color-primary)';
        });
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--color-border)';
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.style.borderColor = 'var(--color-border)';
            handleFileUpload(e.dataTransfer.files);
        });
        
        fileInput.addEventListener('change', (e) => {
            handleFileUpload(e.target.files);
        });
    }

    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', uploadApp);
    }
}

// Navigation - Fixed navigation logic
function navigateToPage(page) {
    // Hide all pages
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    
    // Show selected page
    const targetPage = document.getElementById(page);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Update nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[data-page="${page}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Handle page-specific logic
        if (page === 'profile' && !currentUser) {
            showLoginModal();
            return;
        }
        if (page === 'admin' && !isAdminLoggedIn) {
            showLoginModal();
            return;
        }
        if (page === 'categories') {
            renderCategoriesList();
        }
    }
}

function navigateToAdminPage(page) {
    // Hide all admin pages
    document.querySelectorAll('.admin-page').forEach(p => p.classList.remove('active'));
    
    // Show selected admin page
    const targetPage = document.getElementById(`admin-${page}`);
    if (targetPage) {
        targetPage.classList.add('active');
        
        // Update admin nav links
        document.querySelectorAll('.admin-nav-link').forEach(link => {
            link.classList.remove('active');
        });
        const activeLink = document.querySelector(`[data-admin-page="${page}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
        
        // Handle page-specific logic
        if (page === 'dashboard') {
            renderAdminDashboard();
        }
        if (page === 'apps') {
            renderAppsTable();
        }
        if (page === 'analytics') {
            renderAnalytics();
        }
        if (page === 'upload') {
            setupUploadForm();
        }
    }
}

// Authentication - Fixed modal functionality
function showLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function hideLoginModal() {
    const modal = document.getElementById('loginModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function switchLoginTab(tab) {
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.login-form').forEach(form => form.classList.remove('active'));
    
    const tabBtn = document.querySelector(`[data-tab="${tab}"]`);
    const tabForm = document.getElementById(`${tab}Login`);
    
    if (tabBtn) tabBtn.classList.add('active');
    if (tabForm) tabForm.classList.add('active');
}

function loginUser() {
    const email = document.getElementById('userEmail').value;
    const password = document.getElementById('userPassword').value;
    
    // Demo login validation
    if (email === 'user@demo.com' && password === 'password') {
        currentUser = { name: 'Demo User', email: email };
        updateAuthState();
        hideLoginModal();
        showToast('Welcome back!', 'success');
        
        // Show user-only elements
        document.querySelectorAll('.user-only').forEach(el => el.classList.remove('hidden'));
    } else {
        showToast('Invalid credentials. Use demo credentials.', 'error');
    }
}

function loginAdmin() {
    const email = document.getElementById('adminEmail').value;
    const password = document.getElementById('adminPassword').value;
    
    // Demo admin login validation
    if (email === 'admin@modhub.com' && password === 'admin123') {
        currentUser = { name: 'Admin User', email: email, isAdmin: true };
        isAdminLoggedIn = true;
        updateAuthState();
        hideLoginModal();
        showToast('Admin login successful!', 'success');
        navigateToPage('admin');
        
        // Show admin-only elements
        document.querySelectorAll('.admin-only').forEach(el => el.classList.remove('hidden'));
    } else {
        showToast('Invalid admin credentials. Use demo credentials.', 'error');
    }
}

function logout() {
    currentUser = null;
    isAdminLoggedIn = false;
    updateAuthState();
    navigateToPage('home');
    showToast('Logged out successfully', 'info');
    
    // Hide protected elements
    document.querySelectorAll('.user-only').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.admin-only').forEach(el => el.classList.add('hidden'));
}

function updateAuthState() {
    const loginBtn = document.getElementById('loginBtn');
    const logoutBtn = document.getElementById('logoutBtn');
    
    if (currentUser) {
        if (loginBtn) loginBtn.classList.add('hidden');
        if (logoutBtn) logoutBtn.classList.remove('hidden');
        
        // Update profile info
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        if (profileName) profileName.textContent = currentUser.name;
        if (profileEmail) profileEmail.textContent = currentUser.email;
    } else {
        if (loginBtn) loginBtn.classList.remove('hidden');
        if (logoutBtn) logoutBtn.classList.add('hidden');
    }
}

// Theme Management - Fixed theme toggle
function setupTheme() {
    // Don't use localStorage in sandbox environment
    currentTheme = 'light';
    document.documentElement.setAttribute('data-color-scheme', currentTheme);
    updateThemeToggle();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-color-scheme', currentTheme);
    updateThemeToggle();
    showToast(`Switched to ${currentTheme} theme`, 'info');
}

function updateThemeToggle() {
    const icon = document.querySelector('#themeToggle i');
    if (icon) {
        icon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
    }
}

// Content Rendering
function renderFeaturedApps() {
    const container = document.getElementById('featuredAppsGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    appData.featuredApps.forEach(app => {
        const appCard = createAppCard(app);
        container.appendChild(appCard);
    });
}

function renderCategories() {
    const container = document.getElementById('categoriesGrid');
    if (!container) return;
    
    container.innerHTML = '';
    
    appData.categories.slice(0, 6).forEach(category => {
        const categoryCard = createCategoryCard(category);
        container.appendChild(categoryCard);
    });
}

function renderCategoriesList() {
    const container = document.getElementById('categoriesList');
    if (!container) return;
    
    container.innerHTML = '';
    
    appData.categories.forEach(category => {
        const categoryCard = createCategoryCard(category);
        container.appendChild(categoryCard);
    });
}

// Fixed app card creation with proper event handlers
function createAppCard(app) {
    const card = document.createElement('div');
    card.className = 'app-card';
    card.innerHTML = `
        <div class="app-header">
            <img src="${app.icon}" alt="${app.name}" class="app-icon" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
            <div class="app-icon" style="display: none;">📱</div>
            <div class="app-info">
                <h3>${app.name}</h3>
                <span class="app-category">${app.category}</span>
            </div>
        </div>
        <div class="app-meta">
            <div class="app-rating">
                <i class="fas fa-star" style="color: #ffc107;"></i>
                <span>${app.rating}</span>
            </div>
            <span>${formatNumber(app.downloads)} downloads</span>
        </div>
        <p class="app-description">${app.description}</p>
        <div class="mod-features">
            ${app.modFeatures.map(feature => `<span class="mod-tag">${feature}</span>`).join('')}
        </div>
        <div class="app-actions">
            <button class="btn btn--primary download-btn">
                <i class="fas fa-download"></i>
                Download
            </button>
            <button class="btn btn--secondary details-btn">
                <i class="fas fa-info-circle"></i>
            </button>
        </div>
    `;
    
    // Add download functionality
    const downloadBtn = card.querySelector('.download-btn');
    if (downloadBtn) {
        downloadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            downloadApp(app);
        });
    }
    
    // Add details functionality
    const detailsBtn = card.querySelector('.details-btn');
    if (detailsBtn) {
        detailsBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            showAppDetails(app.id);
        });
    }
    
    // Add click to show details
    card.addEventListener('click', () => {
        showAppDetails(app.id);
    });
    
    return card;
}

function createCategoryCard(category) {
    const card = document.createElement('div');
    card.className = 'category-card';
    card.innerHTML = `
        <div class="category-icon">${category.icon}</div>
        <h3 class="category-name">${category.name}</h3>
        <p class="category-count">${category.count} apps</p>
    `;
    
    card.addEventListener('click', () => {
        navigateToPage('search');
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = category.name;
            performSearch();
        }
    });
    
    return card;
}

// App Details Modal - Fixed modal functionality
function showAppDetails(appId) {
    const app = appData.featuredApps.find(a => a.id === appId);
    if (!app) return;
    
    const modalName = document.getElementById('modalAppName');
    const modalContent = document.getElementById('modalAppContent');
    
    if (modalName) modalName.textContent = app.name;
    if (modalContent) {
        modalContent.innerHTML = `
            <div class="modal-app-details">
                <div class="modal-app-header">
                    <img src="${app.icon}" alt="${app.name}" class="modal-app-icon" onerror="this.style.display='none';">
                    <div class="modal-app-info">
                        <h3>${app.name}</h3>
                        <p><strong>Category:</strong> ${app.category}</p>
                        <p><strong>Version:</strong> ${app.version}</p>
                        <p><strong>Size:</strong> ${app.size}</p>
                        <p><strong>Downloads:</strong> ${formatNumber(app.downloads)}</p>
                        <div class="app-rating">
                            <i class="fas fa-star" style="color: #ffc107;"></i>
                            <span>${app.rating}</span>
                        </div>
                    </div>
                </div>
                <div class="modal-section">
                    <h4>Description</h4>
                    <p>${app.description}</p>
                </div>
                <div class="modal-section">
                    <h4>Mod Features</h4>
                    <div class="mod-features">
                        ${app.modFeatures.map(feature => `<span class="mod-tag">${feature}</span>`).join('')}
                    </div>
                </div>
                ${app.screenshots.length > 0 ? `
                <div class="modal-section">
                    <h4>Screenshots</h4>
                    <div class="modal-app-screenshots">
                        ${app.screenshots.map(screenshot => `
                            <img src="${screenshot}" alt="Screenshot" class="screenshot" onerror="this.style.display='none';">
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                <div class="modal-section">
                    <button class="btn btn--primary btn--full-width modal-download-btn">
                        <i class="fas fa-download"></i>
                        Download ${app.name}
                    </button>
                </div>
            </div>
        `;
        
        // Add download functionality to modal button
        const modalDownloadBtn = modalContent.querySelector('.modal-download-btn');
        if (modalDownloadBtn) {
            modalDownloadBtn.addEventListener('click', () => {
                downloadApp(app);
                hideAppModal();
            });
        }
    }
    
    const modal = document.getElementById('appModal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function hideAppModal() {
    const modal = document.getElementById('appModal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Download Functionality
function downloadApp(app) {
    // Simulate download process
    showToast('Download started!', 'success');
    
    // Update download count
    app.downloads++;
    
    // Add to user's download history (if logged in)
    if (currentUser) {
        addToDownloadHistory(app);
    }
    
    // Simulate download progress
    setTimeout(() => {
        showToast(`${app.name} downloaded successfully!`, 'success');
    }, 2000);
}

function addToDownloadHistory(app) {
    // This would normally save to backend/database
    // For demo purposes, we'll just show a toast
    showToast(`Added ${app.name} to download history`, 'info');
}

// Search Functionality - Fixed search filters
function populateSearchFilters() {
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        // Clear existing options except "All Categories"
        categoryFilter.innerHTML = '<option value="">All Categories</option>';
        
        appData.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            categoryFilter.appendChild(option);
        });
    }
    
    // Also populate upload category dropdown
    const uploadCategory = document.getElementById('uploadCategory');
    if (uploadCategory) {
        uploadCategory.innerHTML = '<option value="">Select Category</option>';
        appData.categories.forEach(category => {
            const option = document.createElement('option');
            option.value = category.name;
            option.textContent = category.name;
            uploadCategory.appendChild(option);
        });
    }
}

function performSearch() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    const query = searchInput ? searchInput.value.toLowerCase() : '';
    const category = categoryFilter ? categoryFilter.value : '';
    const sort = sortFilter ? sortFilter.value : 'downloads';
    
    let results = [...appData.featuredApps];
    
    // Filter by search query
    if (query) {
        results = results.filter(app => 
            app.name.toLowerCase().includes(query) ||
            app.description.toLowerCase().includes(query) ||
            app.modFeatures.some(feature => feature.toLowerCase().includes(query))
        );
    }
    
    // Filter by category
    if (category) {
        results = results.filter(app => app.category === category);
    }
    
    // Sort results
    switch (sort) {
        case 'downloads':
            results.sort((a, b) => b.downloads - a.downloads);
            break;
        case 'rating':
            results.sort((a, b) => b.rating - a.rating);
            break;
        case 'recent':
            // For demo, just reverse the array
            results.reverse();
            break;
    }
    
    renderSearchResults(results, query);
}

function renderSearchResults(results, query) {
    const container = document.getElementById('searchResults');
    if (!container) return;
    
    if (results.length === 0) {
        container.innerHTML = `
            <div class="text-center p-16">
                <i class="fas fa-search" style="font-size: 3rem; color: var(--color-text-secondary); margin-bottom: 1rem;"></i>
                <h3>No apps found</h3>
                <p class="text-muted">Try adjusting your search terms or filters.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = `
        <h3>${results.length} app${results.length !== 1 ? 's' : ''} found ${query ? `for "${query}"` : ''}</h3>
        <div class="apps-grid"></div>
    `;
    
    const appsGrid = container.querySelector('.apps-grid');
    if (appsGrid) {
        results.forEach(app => {
            const appCard = createAppCard(app);
            appsGrid.appendChild(appCard);
        });
    }
}

// Admin Panel
function setupAdminPanel() {
    renderAdminStats();
}

function renderAdminStats() {
    const stats = appData.adminStats;
    
    const totalUsers = document.getElementById('totalUsers');
    const totalDownloads = document.getElementById('totalDownloads');
    const totalApps = document.getElementById('totalApps');
    const monthlyRevenue = document.getElementById('monthlyRevenue');
    
    if (totalUsers) totalUsers.textContent = formatNumber(stats.totalUsers);
    if (totalDownloads) totalDownloads.textContent = formatNumber(stats.totalDownloads);
    if (totalApps) totalApps.textContent = formatNumber(stats.totalApps);
    if (monthlyRevenue) monthlyRevenue.textContent = `$${formatNumber(stats.monthlyRevenue)}`;
}

function renderAdminDashboard() {
    renderAdminStats();
    setTimeout(() => renderDownloadsChart(), 100);
}

function renderDownloadsChart() {
    const ctx = document.getElementById('downloadsChart');
    if (!ctx) return;
    
    try {
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: appData.userAnalytics.downloadTrends.map(item => item.month),
                datasets: [{
                    label: 'Downloads',
                    data: appData.userAnalytics.downloadTrends.map(item => item.downloads),
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatNumber(value);
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.warn('Chart.js not loaded:', error);
    }
}

function renderAppsTable() {
    const container = document.getElementById('appsTable');
    if (!container) return;
    
    container.innerHTML = `
        <div class="table-header">
            <div>App Name</div>
            <div>Category</div>
            <div>Downloads</div>
            <div>Rating</div>
            <div>Actions</div>
        </div>
    `;
    
    appData.featuredApps.forEach(app => {
        const row = document.createElement('div');
        row.className = 'table-row';
        row.innerHTML = `
            <div class="app-table-info">
                <img src="${app.icon}" alt="${app.name}" class="app-table-icon" onerror="this.style.display='none';">
                <div class="app-table-details">
                    <h4>${app.name}</h4>
                    <p>v${app.version} • ${app.size}</p>
                </div>
            </div>
            <div>${app.category}</div>
            <div>${formatNumber(app.downloads)}</div>
            <div>
                <div class="app-rating">
                    <i class="fas fa-star" style="color: #ffc107; margin-right: 4px;"></i>
                    ${app.rating}
                </div>
            </div>
            <div class="table-actions">
                <button class="btn btn--sm btn--secondary">Edit</button>
                <button class="btn btn--sm btn--outline" style="color: var(--color-error);">Delete</button>
            </div>
        `;
        container.appendChild(row);
    });
}

function renderAnalytics() {
    renderCountriesList();
    setTimeout(() => renderTrendsChart(), 100);
}

function renderCountriesList() {
    const container = document.getElementById('countriesList');
    if (!container) return;
    
    container.innerHTML = '';
    appData.userAnalytics.topCountries.forEach(country => {
        const item = document.createElement('div');
        item.className = 'country-item';
        item.innerHTML = `
            <div class="country-info">
                <div class="country-name">${country.country}</div>
                <div class="country-users">${formatNumber(country.users)} users</div>
            </div>
            <div class="country-percentage">${country.percentage}%</div>
        `;
        container.appendChild(item);
    });
}

function renderTrendsChart() {
    const ctx = document.getElementById('trendsChart');
    if (!ctx) return;
    
    try {
        new Chart(ctx, {
            type: 'bar',
            data: {
                labels: appData.userAnalytics.downloadTrends.map(item => item.month),
                datasets: [{
                    label: 'Monthly Downloads',
                    data: appData.userAnalytics.downloadTrends.map(item => item.downloads),
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F', '#DB4545', '#D2BA4C', '#964325', '#944454']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return formatNumber(value);
                            }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.warn('Chart.js not loaded:', error);
    }
}

// Upload Functionality
function setupUploadForm() {
    // Form is already set up in HTML and event listeners
}

function handleFileUpload(files) {
    if (files.length > 0) {
        const file = files[0];
        if (file.type === 'application/vnd.android.package-archive' || file.name.endsWith('.apk')) {
            showToast(`File ${file.name} ready for upload`, 'success');
            
            // Pre-fill form with file name
            const fileName = file.name.replace('.apk', '');
            const uploadAppName = document.getElementById('uploadAppName');
            if (uploadAppName) {
                uploadAppName.value = fileName;
            }
        } else {
            showToast('Please select a valid APK file', 'error');
        }
    }
}

function uploadApp() {
    const uploadAppName = document.getElementById('uploadAppName');
    const uploadCategory = document.getElementById('uploadCategory');
    const uploadDescription = document.getElementById('uploadDescription');
    const uploadFeatures = document.getElementById('uploadFeatures');
    
    const appName = uploadAppName ? uploadAppName.value : '';
    const category = uploadCategory ? uploadCategory.value : '';
    const description = uploadDescription ? uploadDescription.value : '';
    const features = uploadFeatures ? uploadFeatures.value : '';
    
    if (!appName || !category || !description) {
        showToast('Please fill in all required fields', 'error');
        return;
    }
    
    // Simulate upload process
    showToast('Uploading app...', 'info');
    
    setTimeout(() => {
        // Create new app object
        const newApp = {
            id: String(appData.featuredApps.length + 1),
            name: appName,
            category: category,
            version: '1.0.0',
            size: '50.0 MB',
            downloads: 0,
            rating: 4.5,
            description: description,
            modFeatures: features.split(',').map(f => f.trim()).filter(f => f),
            icon: 'https://images.unsplash.com/photo-1614680376573-df3480f0c6ff?w=100&h=100&fit=crop',
            screenshots: []
        };
        
        // Add to featured apps (for demo)
        appData.featuredApps.push(newApp);
        
        // Clear form
        if (uploadAppName) uploadAppName.value = '';
        if (uploadCategory) uploadCategory.value = '';
        if (uploadDescription) uploadDescription.value = '';
        if (uploadFeatures) uploadFeatures.value = '';
        
        showToast(`${appName} uploaded successfully!`, 'success');
        
        // Refresh featured apps display
        renderFeaturedApps();
        
        // Navigate to apps management
        navigateToAdminPage('apps');
    }, 2000);
}

// Toast Notifications
function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    
    const icon = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    }[type];
    
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 5000);
}

// Utility Functions
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// GitHub Integration Simulation
function connectToGitHub() {
    showToast('Connected to GitHub repository: sujen-alig/suujchatbot', 'success');
}

// Firebase Simulation
function initializeFirebase() {
    console.log('Firebase initialized (simulated)');
    showToast('Connected to Firebase backend', 'success');
}

// Call Firebase initialization
setTimeout(initializeFirebase, 1000);