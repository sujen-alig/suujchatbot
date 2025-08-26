// ModAPK Hub - Supabase Integration JavaScript

class ModAPKHub {
    constructor() {
        this.supabase = null;
        this.user = null;
        this.apks = [];
        this.categories = [];
        this.filteredAPKs = [];
        this.isConfigured = false;
        this.currentEditId = null;
        this.realtimeSubscriptions = [];
        this.searchTimeout = null;
        this.activityInterval = null;
        
        // Configuration
        this.config = {
            url: '',
            anonKey: '',
            channels: ['apks-changes', 'downloads-live', 'admin-notifications', 'user-activity']
        };
        
        // Sample categories
        this.defaultCategories = [
            { name: "Games", icon: "fas fa-gamepad", count: 0, color: "#FF6B6B" },
            { name: "Social", icon: "fas fa-users", count: 0, color: "#4ECDC4" },
            { name: "Music", icon: "fas fa-music", count: 0, color: "#45B7D1" },
            { name: "Photography", icon: "fas fa-camera", count: 0, color: "#96CEB4" },
            { name: "Productivity", icon: "fas fa-briefcase", count: 0, color: "#FFEAA7" },
            { name: "Tools", icon: "fas fa-wrench", count: 0, color: "#DDA0DD" },
            { name: "Entertainment", icon: "fas fa-film", count: 0, color: "#FD79A8" }
        ];
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            setTimeout(() => this.init(), 100);
        }
    }

    async init() {
        try {
            console.log('Initializing ModAPK Hub with Supabase...');
            
            // Setup event listeners first
            this.setupEventListeners();
            
            // Initialize theme
            this.initTheme();
            
            // Check if Supabase is configured
            await this.checkConfiguration();
            
            if (!this.isConfigured) {
                // Load sample data for demo
                this.loadSampleData();
                this.showConfigurationModal();
                return;
            }
            
            // Initialize Supabase
            await this.initializeSupabase();
            
            // Load initial data
            await this.loadInitialData();
            
            // Setup real-time subscriptions
            this.setupRealtimeSubscriptions();
            
            // Check authentication state
            await this.checkAuthState();
            
            // Start activity tracking
            this.startActivityTracking();
            
            console.log('ModAPK Hub initialized successfully!');
            
        } catch (error) {
            console.error('Initialization error:', error);
            this.showToast('Failed to initialize application: ' + error.message, 'error');
            // Load sample data as fallback
            this.loadSampleData();
        }
    }

    loadSampleData() {
        console.log('Loading sample data...');
        this.apks = this.getSampleAPKs();
        this.filteredAPKs = [...this.apks];
        this.loadCategories();
        this.renderCategories();
        this.renderAPKGrid();
        this.updateStats();
        this.showLoadingIndicator(false);
        console.log('Sample data loaded:', this.apks.length, 'APKs');
    }

    // Configuration Management
    async checkConfiguration() {
        const savedConfig = localStorage.getItem('modapk_supabase_config');
        if (savedConfig) {
            try {
                this.config = JSON.parse(savedConfig);
                if (this.config.url && this.config.anonKey) {
                    this.isConfigured = true;
                    return;
                }
            } catch (error) {
                console.error('Error parsing saved config:', error);
            }
        }
        this.isConfigured = false;
    }

    showConfigurationModal() {
        const modal = document.getElementById('configModal');
        if (modal) {
            modal.classList.remove('hidden');
            console.log('Configuration modal shown');
        }
    }

    hideConfigurationModal() {
        const modal = document.getElementById('configModal');
        if (modal) {
            modal.classList.add('hidden');
            console.log('Configuration modal hidden');
        }
    }

    skipConfiguration() {
        this.hideConfigurationModal();
        this.updateConnectionStatus('offline');
        this.showToast('Running in demo mode with sample data', 'info');
    }

    async saveConfiguration(url, anonKey) {
        try {
            if (!url || !anonKey) {
                this.showToast('Please enter both URL and API key', 'error');
                return;
            }
            
            this.config.url = url.trim();
            this.config.anonKey = anonKey.trim();
            
            // Test the connection first
            if (window.supabase) {
                const testClient = window.supabase.createClient(this.config.url, this.config.anonKey);
                
                try {
                    // Simple test query
                    await testClient.from('apks').select('count', { count: 'exact', head: true });
                    console.log('Supabase connection test successful');
                } catch (testError) {
                    console.warn('Supabase connection test failed:', testError);
                    // Continue anyway - the database might not be set up yet
                }
            }
            
            // Save configuration
            localStorage.setItem('modapk_supabase_config', JSON.stringify(this.config));
            this.isConfigured = true;
            
            // Initialize Supabase
            await this.initializeSupabase();
            
            // Hide modal
            this.hideConfigurationModal();
            
            // Continue initialization
            await this.loadInitialData();
            this.setupRealtimeSubscriptions();
            await this.checkAuthState();
            this.startActivityTracking();
            
            this.showToast('Supabase connected successfully!', 'success');
            
        } catch (error) {
            console.error('Configuration error:', error);
            this.showToast('Failed to connect to Supabase: ' + error.message, 'error');
        }
    }

    // Supabase Initialization
    async initializeSupabase() {
        try {
            if (!window.supabase) {
                throw new Error('Supabase client library not loaded');
            }
            
            this.supabase = window.supabase.createClient(this.config.url, this.config.anonKey);
            
            // Test connection
            const { data, error } = await this.supabase.from('apks').select('count', { count: 'exact', head: true });
            if (error && error.code !== 'PGRST116') { // PGRST116 is "relation does not exist"
                throw error;
            }
            
            this.updateConnectionStatus('online');
            console.log('Supabase client initialized successfully');
            
        } catch (error) {
            this.updateConnectionStatus('offline');
            console.warn('Supabase initialization failed:', error.message);
            // Don't throw error - continue with sample data
        }
    }

    updateConnectionStatus(status) {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            if (status === 'online') {
                statusElement.innerHTML = '<i class="fas fa-circle"></i> Online';
                statusElement.className = 'status status--success';
            } else {
                statusElement.innerHTML = '<i class="fas fa-circle"></i> Offline';
                statusElement.className = 'status status--error';
            }
        }
    }

    // Authentication
    async checkAuthState() {
        try {
            if (!this.supabase) return;
            
            const { data: { user } } = await this.supabase.auth.getUser();
            if (user) {
                await this.handleUserLogin(user);
            }
            
            // Listen for auth changes
            this.supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN') {
                    await this.handleUserLogin(session.user);
                } else if (event === 'SIGNED_OUT') {
                    this.handleUserLogout();
                }
            });
            
        } catch (error) {
            console.error('Auth state check error:', error);
        }
    }

    async handleUserLogin(user) {
        this.user = user;
        
        // Get or create user profile
        await this.ensureUserProfile();
        
        // Update UI
        this.updateAuthUI(true);
        
        // Update last login
        await this.updateUserActivity('login');
        
        this.showToast(`Welcome back, ${user.user_metadata?.full_name || user.email}!`, 'success');
    }

    handleUserLogout() {
        this.user = null;
        this.updateAuthUI(false);
        this.showToast('Logged out successfully', 'info');
    }

    async ensureUserProfile() {
        if (!this.user || !this.supabase) return;
        
        try {
            const { data: profile } = await this.supabase
                .from('users')
                .select('*')
                .eq('id', this.user.id)
                .single();
            
            if (!profile) {
                // Create user profile
                await this.supabase.from('users').insert({
                    id: this.user.id,
                    email: this.user.email,
                    username: this.user.user_metadata?.full_name || this.user.email.split('@')[0],
                    profile_avatar: this.user.user_metadata?.avatar_url,
                    role: 'user'
                });
            }
        } catch (error) {
            console.error('Error ensuring user profile:', error);
        }
    }

    updateAuthUI(isLoggedIn) {
        const authButtons = document.getElementById('authButtons');
        const userMenu = document.getElementById('userMenu');
        const adminBtn = document.getElementById('adminBtn');
        
        if (isLoggedIn && this.user) {
            if (authButtons) authButtons.classList.add('hidden');
            if (userMenu) {
                userMenu.classList.remove('hidden');
                
                const userName = document.getElementById('userName');
                const userAvatar = document.getElementById('userAvatar');
                
                if (userName) {
                    userName.textContent = this.user.user_metadata?.full_name || 
                                         this.user.email.split('@')[0];
                }
                
                if (userAvatar) {
                    userAvatar.src = this.user.user_metadata?.avatar_url || 
                                   `https://api.dicebear.com/7.x/initials/svg?seed=${this.user.email}`;
                }
            }
            
            // Check if user is admin
            this.checkAdminAccess();
            
        } else {
            if (authButtons) authButtons.classList.remove('hidden');
            if (userMenu) userMenu.classList.add('hidden');
            if (adminBtn) adminBtn.classList.add('hidden');
        }
    }

    async checkAdminAccess() {
        if (!this.user || !this.supabase) return;
        
        try {
            const { data: profile } = await this.supabase
                .from('users')
                .select('role')
                .eq('id', this.user.id)
                .single();
            
            const adminBtn = document.getElementById('adminBtn');
            if (adminBtn) {
                if (profile?.role === 'admin') {
                    adminBtn.classList.remove('hidden');
                } else {
                    adminBtn.classList.add('hidden');
                }
            }
        } catch (error) {
            console.error('Error checking admin access:', error);
        }
    }

    async signInWithProvider(provider) {
        try {
            if (!this.supabase) {
                this.showToast('Supabase not configured. Please configure connection first.', 'error');
                return;
            }
            
            const { error } = await this.supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: window.location.origin
                }
            });
            
            if (error) throw error;
            
        } catch (error) {
            console.error('Social sign-in error:', error);
            this.showToast('Sign-in failed: ' + error.message, 'error');
        }
    }

    async signInWithEmail(email, password) {
        try {
            if (!this.supabase) {
                this.showToast('Supabase not configured. Please configure connection first.', 'error');
                return;
            }
            
            const { error } = await this.supabase.auth.signInWithPassword({
                email,
                password
            });
            
            if (error) throw error;
            
            this.hideAuthModal();
            
        } catch (error) {
            console.error('Email sign-in error:', error);
            this.showToast('Sign-in failed: ' + error.message, 'error');
        }
    }

    async signUpWithEmail(email, password, username) {
        try {
            if (!this.supabase) {
                this.showToast('Supabase not configured. Please configure connection first.', 'error');
                return;
            }
            
            const { error } = await this.supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: username
                    }
                }
            });
            
            if (error) throw error;
            
            this.showToast('Please check your email to confirm your account', 'info');
            this.hideAuthModal();
            
        } catch (error) {
            console.error('Email sign-up error:', error);
            this.showToast('Sign-up failed: ' + error.message, 'error');
        }
    }

    async signOut() {
        try {
            if (this.supabase) {
                await this.supabase.auth.signOut();
            } else {
                this.handleUserLogout();
            }
        } catch (error) {
            console.error('Sign-out error:', error);
            this.showToast('Sign-out failed: ' + error.message, 'error');
        }
    }

    // Data Loading
    async loadInitialData() {
        try {
            this.showLoadingIndicator(true);
            
            // Load APKs
            await this.loadAPKs();
            
            // Load categories with counts
            await this.loadCategories();
            
            // Render UI
            this.renderCategories();
            this.renderAPKGrid();
            this.updateStats();
            
            this.showLoadingIndicator(false);
            
        } catch (error) {
            console.error('Error loading initial data:', error);
            this.showToast('Failed to load data: ' + error.message, 'error');
            this.loadSampleData();
        }
    }

    async loadAPKs() {
        try {
            if (!this.supabase) {
                throw new Error('Supabase not configured');
            }
            
            const { data: apks, error } = await this.supabase
                .from('apks')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            this.apks = apks || [];
            this.filteredAPKs = [...this.apks];
            
            console.log('Loaded APKs from database:', this.apks.length);
            
        } catch (error) {
            console.error('Error loading APKs:', error);
            // Use sample data as fallback
            this.apks = this.getSampleAPKs();
            this.filteredAPKs = [...this.apks];
            console.log('Using sample APK data:', this.apks.length);
        }
    }

    getSampleAPKs() {
        return [
            {
                id: '1',
                name: "WhatsApp Plus",
                version: "17.52.1",
                category: "Social",
                description: "Enhanced WhatsApp with advanced privacy features, custom themes, and extended media sharing capabilities",
                download_url: "https://example.com/whatsapp-plus-v17.52.1.apk",
                screenshot_urls: ["https://via.placeholder.com/400x700/4ECDC4/FFFFFF?text=WhatsApp+Plus"],
                icon_url: "https://via.placeholder.com/128x128/4ECDC4/FFFFFF?text=WA+",
                download_count: 125847,
                rating: 4.7,
                review_count: 3241,
                file_size: "58.3 MB",
                android_version: "5.0+",
                permissions: ["Camera", "Contacts", "Microphone", "Storage"],
                featured: true,
                verified: true,
                tags: ["messaging", "privacy", "themes", "social"],
                created_at: new Date().toISOString()
            },
            {
                id: '2',
                name: "Spotify Premium",
                version: "8.7.78.345",
                category: "Music",
                description: "Unlimited music streaming with premium features unlocked, ad-free listening, and offline downloads",
                download_url: "https://example.com/spotify-premium-v8.7.78.apk",
                screenshot_urls: ["https://via.placeholder.com/400x700/45B7D1/FFFFFF?text=Spotify+Premium"],
                icon_url: "https://via.placeholder.com/128x128/45B7D1/FFFFFF?text=SP",
                download_count: 234567,
                rating: 4.9,
                review_count: 5612,
                file_size: "31.2 MB",
                android_version: "5.0+",
                permissions: ["Storage", "Network", "Audio"],
                featured: true,
                verified: true,
                tags: ["music", "streaming", "premium", "offline"],
                created_at: new Date(Date.now() - 86400000).toISOString()
            },
            {
                id: '3',
                name: "Instagram Pro",
                version: "12.0.1",
                category: "Social",
                description: "Modified Instagram with download capabilities, ghost mode, and enhanced privacy settings",
                download_url: "https://example.com/instagram-pro.apk",
                screenshot_urls: ["https://via.placeholder.com/400x700/FF6B6B/FFFFFF?text=Instagram+Pro"],
                icon_url: "https://via.placeholder.com/128x128/FF6B6B/FFFFFF?text=IG",
                download_count: 89234,
                rating: 4.5,
                review_count: 2156,
                file_size: "45.8 MB",
                android_version: "6.0+",
                permissions: ["Camera", "Storage", "Contacts"],
                featured: false,
                verified: true,
                tags: ["social", "download", "privacy"],
                created_at: new Date(Date.now() - 172800000).toISOString()
            },
            {
                id: '4',
                name: "Minecraft PE Unlimited",
                version: "1.20.15",
                category: "Games",
                description: "Minecraft Pocket Edition with unlimited resources, all skins unlocked, and premium features",
                download_url: "https://example.com/minecraft-unlimited.apk",
                screenshot_urls: ["https://via.placeholder.com/400x700/96CEB4/FFFFFF?text=Minecraft+PE"],
                icon_url: "https://via.placeholder.com/128x128/96CEB4/FFFFFF?text=MC",
                download_count: 456789,
                rating: 4.8,
                review_count: 8934,
                file_size: "128.4 MB",
                android_version: "5.0+",
                permissions: ["Storage", "Network"],
                featured: true,
                verified: true,
                tags: ["games", "sandbox", "unlimited", "premium"],
                created_at: new Date(Date.now() - 259200000).toISOString()
            }
        ];
    }

    async loadCategories() {
        try {
            // Get category counts from APKs
            const categoryCounts = {};
            this.apks.forEach(apk => {
                categoryCounts[apk.category] = (categoryCounts[apk.category] || 0) + 1;
            });
            
            this.categories = this.defaultCategories.map(cat => ({
                ...cat,
                count: categoryCounts[cat.name] || 0
            }));
            
        } catch (error) {
            console.error('Error loading categories:', error);
            this.categories = [...this.defaultCategories];
        }
    }

    // Real-time Subscriptions
    setupRealtimeSubscriptions() {
        if (!this.supabase) {
            console.log('Skipping real-time subscriptions - Supabase not configured');
            return;
        }
        
        try {
            // Subscribe to APKs changes
            const apksSubscription = this.supabase
                .channel('apks-changes')
                .on('postgres_changes', 
                    { event: '*', schema: 'public', table: 'apks' },
                    (payload) => this.handleAPKsChange(payload)
                )
                .subscribe();
            
            this.realtimeSubscriptions.push(apksSubscription);
            
            // Subscribe to download events
            const downloadsSubscription = this.supabase
                .channel('downloads-live')
                .on('postgres_changes',
                    { event: 'INSERT', schema: 'public', table: 'downloads' },
                    (payload) => this.handleDownloadEvent(payload)
                )
                .subscribe();
            
            this.realtimeSubscriptions.push(downloadsSubscription);
            
            console.log('Real-time subscriptions established');
            
        } catch (error) {
            console.error('Error setting up real-time subscriptions:', error);
        }
    }

    async handleAPKsChange(payload) {
        console.log('APKs change detected:', payload);
        
        const { eventType, new: newRecord, old: oldRecord } = payload;
        
        switch (eventType) {
            case 'INSERT':
                this.apks.unshift(newRecord);
                this.filteredAPKs.unshift(newRecord);
                this.showUpdateBanner('New APK added: ' + newRecord.name);
                break;
                
            case 'UPDATE':
                const updateIndex = this.apks.findIndex(apk => apk.id === newRecord.id);
                if (updateIndex !== -1) {
                    this.apks[updateIndex] = newRecord;
                    const filteredIndex = this.filteredAPKs.findIndex(apk => apk.id === newRecord.id);
                    if (filteredIndex !== -1) {
                        this.filteredAPKs[filteredIndex] = newRecord;
                    }
                }
                this.showUpdateBanner('APK updated: ' + newRecord.name);
                break;
                
            case 'DELETE':
                this.apks = this.apks.filter(apk => apk.id !== oldRecord.id);
                this.filteredAPKs = this.filteredAPKs.filter(apk => apk.id !== oldRecord.id);
                this.showUpdateBanner('APK removed: ' + oldRecord.name);
                break;
        }
        
        // Re-render components
        await this.loadCategories();
        this.renderCategories();
        this.renderAPKGrid();
        this.updateStats();
    }

    async handleDownloadEvent(payload) {
        console.log('Download event detected:', payload);
        
        // Update download count for the APK
        const apkId = payload.new.apk_id;
        const apkIndex = this.apks.findIndex(apk => apk.id === apkId);
        
        if (apkIndex !== -1) {
            this.apks[apkIndex].download_count = (this.apks[apkIndex].download_count || 0) + 1;
            
            const filteredIndex = this.filteredAPKs.findIndex(apk => apk.id === apkId);
            if (filteredIndex !== -1) {
                this.filteredAPKs[filteredIndex].download_count = this.apks[apkIndex].download_count;
            }
            
            this.renderAPKGrid();
            this.updateStats();
        }
        
        // Update live stats
        this.updateLiveStats();
    }

    showUpdateBanner(message) {
        const banner = document.getElementById('updatesBanner');
        const text = document.getElementById('updatesText');
        
        if (banner && text) {
            text.textContent = message;
            banner.classList.remove('hidden');
            
            // Auto-hide after 5 seconds
            setTimeout(() => {
                banner.classList.add('hidden');
            }, 5000);
        }
    }

    // File Upload to Supabase Storage
    async uploadFile(file, bucket, path) {
        try {
            if (!this.supabase) {
                throw new Error('Supabase not configured');
            }
            
            const { data, error } = await this.supabase.storage
                .from(bucket)
                .upload(path, file);
            
            if (error) throw error;
            
            // Get public URL
            const { data: { publicUrl } } = this.supabase.storage
                .from(bucket)
                .getPublicUrl(path);
            
            return publicUrl;
            
        } catch (error) {
            console.error('File upload error:', error);
            throw error;
        }
    }

    async uploadAPKFiles(iconFile, screenshotFiles) {
        const uploadedFiles = {
            icon_url: null,
            screenshot_urls: []
        };
        
        try {
            const uploadModal = document.getElementById('uploadModal');
            const progressBar = document.getElementById('uploadProgress');
            const statusText = document.getElementById('uploadStatus');
            
            if (uploadModal) uploadModal.classList.remove('hidden');
            
            let progress = 0;
            const totalFiles = (iconFile ? 1 : 0) + (screenshotFiles ? screenshotFiles.length : 0);
            
            // Upload icon
            if (iconFile) {
                if (statusText) statusText.textContent = 'Uploading icon...';
                
                const iconPath = `icons/${Date.now()}_${iconFile.name}`;
                uploadedFiles.icon_url = await this.uploadFile(iconFile, 'icons', iconPath);
                
                progress++;
                if (progressBar) progressBar.style.width = `${(progress / totalFiles) * 100}%`;
            }
            
            // Upload screenshots
            if (screenshotFiles && screenshotFiles.length > 0) {
                for (let i = 0; i < screenshotFiles.length; i++) {
                    const file = screenshotFiles[i];
                    
                    if (statusText) statusText.textContent = `Uploading screenshot ${i + 1}/${screenshotFiles.length}...`;
                    
                    const screenshotPath = `screenshots/${Date.now()}_${i}_${file.name}`;
                    const url = await this.uploadFile(file, 'screenshots', screenshotPath);
                    uploadedFiles.screenshot_urls.push(url);
                    
                    progress++;
                    if (progressBar) progressBar.style.width = `${(progress / totalFiles) * 100}%`;
                }
            }
            
            if (uploadModal) uploadModal.classList.add('hidden');
            
            return uploadedFiles;
            
        } catch (error) {
            const uploadModal = document.getElementById('uploadModal');
            if (uploadModal) uploadModal.classList.add('hidden');
            throw error;
        }
    }

    // APK Management
    async addAPK(apkData) {
        try {
            if (!this.user) {
                this.showToast('Please login to add APKs', 'error');
                return;
            }
            
            if (!this.supabase) {
                this.showToast('Supabase not configured', 'error');
                return;
            }
            
            const { error } = await this.supabase
                .from('apks')
                .insert([apkData]);
            
            if (error) throw error;
            
            this.showToast('APK added successfully!', 'success');
            
            // Log admin action
            await this.logAdminAction('add_apk', { apk_name: apkData.name });
            
        } catch (error) {
            console.error('Error adding APK:', error);
            this.showToast('Failed to add APK: ' + error.message, 'error');
        }
    }

    async updateAPK(id, apkData) {
        try {
            if (!this.user) {
                this.showToast('Please login to update APKs', 'error');
                return;
            }
            
            if (!this.supabase) {
                this.showToast('Supabase not configured', 'error');
                return;
            }
            
            const { error } = await this.supabase
                .from('apks')
                .update(apkData)
                .eq('id', id);
            
            if (error) throw error;
            
            this.showToast('APK updated successfully!', 'success');
            
            // Log admin action
            await this.logAdminAction('update_apk', { apk_id: id, apk_name: apkData.name });
            
        } catch (error) {
            console.error('Error updating APK:', error);
            this.showToast('Failed to update APK: ' + error.message, 'error');
        }
    }

    async deleteAPK(id) {
        try {
            if (!this.user) {
                this.showToast('Please login to delete APKs', 'error');
                return;
            }
            
            if (!this.supabase) {
                // For demo mode, delete from local array
                const apk = this.apks.find(a => a.id === id);
                this.apks = this.apks.filter(a => a.id !== id);
                this.filteredAPKs = this.filteredAPKs.filter(a => a.id !== id);
                this.loadCategories();
                this.renderCategories();
                this.renderAPKGrid();
                this.renderAdminAPKList();
                this.updateStats();
                this.showToast('APK deleted successfully (demo mode)!', 'success');
                return;
            }
            
            const apk = this.apks.find(a => a.id === id);
            
            const { error } = await this.supabase
                .from('apks')
                .delete()
                .eq('id', id);
            
            if (error) throw error;
            
            this.showToast('APK deleted successfully!', 'success');
            
            // Log admin action
            await this.logAdminAction('delete_apk', { apk_id: id, apk_name: apk?.name });
            
        } catch (error) {
            console.error('Error deleting APK:', error);
            this.showToast('Failed to delete APK: ' + error.message, 'error');
        }
    }

    // Download Tracking
    async recordDownload(apkId) {
        try {
            if (!this.supabase) {
                console.log('Download tracking skipped - Supabase not configured');
                return;
            }
            
            const downloadData = {
                apk_id: apkId,
                user_id: this.user?.id || null,
                ip_address: await this.getClientIP(),
                downloaded_at: new Date().toISOString()
            };
            
            const { error } = await this.supabase
                .from('downloads')
                .insert([downloadData]);
            
            if (error) {
                console.error('Error recording download:', error);
                return;
            }
            
            // Update APK download count
            const { error: updateError } = await this.supabase
                .from('apks')
                .update({ 
                    download_count: this.supabase.raw('download_count + 1'),
                    updated_at: new Date().toISOString()
                })
                .eq('id', apkId);
            
            if (updateError) {
                console.error('Error updating download count:', updateError);
            }
            
        } catch (error) {
            console.error('Error in download tracking:', error);
        }
    }

    async getClientIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (error) {
            return 'unknown';
        }
    }

    // User Activity Tracking
    async updateUserActivity(action, details = {}) {
        if (!this.user || !this.supabase) return;
        
        try {
            await this.supabase
                .from('users')
                .update({ 
                    last_login: new Date().toISOString() 
                })
                .eq('id', this.user.id);
            
        } catch (error) {
            console.error('Error updating user activity:', error);
        }
    }

    async logAdminAction(action, details = {}) {
        if (!this.user || !this.supabase) return;
        
        try {
            await this.supabase
                .from('admin_logs')
                .insert([{
                    admin_id: this.user.id,
                    action,
                    details,
                    timestamp: new Date().toISOString()
                }]);
            
        } catch (error) {
            console.error('Error logging admin action:', error);
        }
    }

    startActivityTracking() {
        // Update live stats every 30 seconds
        this.activityInterval = setInterval(() => {
            this.updateLiveStats();
        }, 30000);
        
        // Track page visibility
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden && this.user) {
                this.updateUserActivity('page_view');
            }
        });
    }

    async updateLiveStats() {
        try {
            if (!this.supabase) {
                // Demo mode - show sample stats
                const liveDownloads = document.getElementById('liveDownloads');
                const activeUsersEl = document.getElementById('activeUsers');
                
                if (liveDownloads) liveDownloads.textContent = Math.floor(Math.random() * 100);
                if (activeUsersEl) activeUsersEl.textContent = Math.floor(Math.random() * 50);
                return;
            }
            
            // Get downloads today
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const { count: downloadsToday } = await this.supabase
                .from('downloads')
                .select('*', { count: 'exact', head: true })
                .gte('downloaded_at', today.toISOString());
            
            // Get active users (logged in within last hour)
            const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
            const { count: activeUsers } = await this.supabase
                .from('users')
                .select('*', { count: 'exact', head: true })
                .gte('last_login', hourAgo.toISOString());
            
            // Update UI
            const liveDownloads = document.getElementById('liveDownloads');
            const activeUsersEl = document.getElementById('activeUsers');
            
            if (liveDownloads) liveDownloads.textContent = downloadsToday || 0;
            if (activeUsersEl) activeUsersEl.textContent = activeUsers || 0;
            
        } catch (error) {
            console.error('Error updating live stats:', error);
        }
    }

    // Search with Real-time Suggestions
    async handleSearchWithSuggestions(query) {
        if (!query.trim()) {
            this.hideSuggestions();
            this.handleSearch();
            return;
        }
        
        try {
            // Search in APKs
            const suggestions = this.apks
                .filter(apk => 
                    apk.name.toLowerCase().includes(query.toLowerCase()) ||
                    apk.description.toLowerCase().includes(query.toLowerCase()) ||
                    (apk.tags && apk.tags.some(tag => tag.toLowerCase().includes(query.toLowerCase())))
                )
                .slice(0, 5)
                .map(apk => ({
                    type: 'apk',
                    text: apk.name,
                    category: apk.category,
                    id: apk.id
                }));
            
            // Add category suggestions
            const categoryMatches = this.categories
                .filter(cat => cat.name.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 2)
                .map(cat => ({
                    type: 'category',
                    text: cat.name,
                    count: cat.count
                }));
            
            this.showSuggestions([...suggestions, ...categoryMatches]);
            
        } catch (error) {
            console.error('Error in search suggestions:', error);
        }
    }

    showSuggestions(suggestions) {
        const suggestionsEl = document.getElementById('searchSuggestions');
        if (!suggestionsEl || suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        suggestionsEl.innerHTML = suggestions.map(suggestion => {
            if (suggestion.type === 'apk') {
                return `
                    <div class="search-suggestion" data-type="apk" data-id="${suggestion.id}">
                        <i class="fas fa-mobile-alt"></i>
                        <span><strong>${this.escapeHtml(suggestion.text)}</strong> in ${suggestion.category}</span>
                    </div>
                `;
            } else {
                return `
                    <div class="search-suggestion" data-type="category" data-category="${suggestion.text}">
                        <i class="fas fa-folder"></i>
                        <span><strong>${this.escapeHtml(suggestion.text)}</strong> (${suggestion.count} apps)</span>
                    </div>
                `;
            }
        }).join('');
        
        suggestionsEl.classList.remove('hidden');
        
        // Add click handlers
        suggestionsEl.querySelectorAll('.search-suggestion').forEach(el => {
            el.addEventListener('click', () => this.handleSuggestionClick(el));
        });
    }

    hideSuggestions() {
        const suggestionsEl = document.getElementById('searchSuggestions');
        if (suggestionsEl) {
            suggestionsEl.classList.add('hidden');
        }
    }

    handleSuggestionClick(element) {
        const type = element.dataset.type;
        
        if (type === 'apk') {
            const id = element.dataset.id;
            this.showAPKDetails(id);
        } else if (type === 'category') {
            const category = element.dataset.category;
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                categoryFilter.value = category;
                this.handleFilter();
            }
        }
        
        this.hideSuggestions();
    }

    // Event Listeners Setup
    setupEventListeners() {
        try {
            console.log('Setting up event listeners...');
            
            // Configuration
            const configForm = document.getElementById('configForm');
            if (configForm) {
                configForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    const url = document.getElementById('supabaseUrl')?.value;
                    const key = document.getElementById('supabaseKey')?.value;
                    this.saveConfiguration(url, key);
                });
            }
            
            const closeConfig = document.getElementById('closeConfig');
            if (closeConfig) {
                closeConfig.addEventListener('click', () => {
                    this.skipConfiguration();
                });
            }
            
            // Theme toggle
            const themeToggle = document.getElementById('themeToggle');
            if (themeToggle) {
                themeToggle.addEventListener('click', () => this.toggleTheme());
            }
            
            // Authentication buttons
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Login button clicked');
                    this.showAuthModal('login');
                });
            }
            
            const signupBtn = document.getElementById('signupBtn');
            if (signupBtn) {
                signupBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    console.log('Signup button clicked');
                    this.showAuthModal('signup');
                });
            }
            
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.signOut();
                });
            }
            
            // Auth modal
            const closeAuth = document.getElementById('closeAuth');
            if (closeAuth) {
                closeAuth.addEventListener('click', () => this.hideAuthModal());
            }
            
            const authForm = document.getElementById('authForm');
            if (authForm) {
                authForm.addEventListener('submit', (e) => this.handleAuthSubmit(e));
            }
            
            // Social authentication
            const googleAuth = document.getElementById('googleAuth');
            if (googleAuth) {
                googleAuth.addEventListener('click', () => this.signInWithProvider('google'));
            }
            
            const githubAuth = document.getElementById('githubAuth');
            if (githubAuth) {
                githubAuth.addEventListener('click', () => this.signInWithProvider('github'));
            }
            
            // Admin panel
            const adminBtn = document.getElementById('adminBtn');
            if (adminBtn) {
                adminBtn.addEventListener('click', () => this.showAdminModal());
            }
            
            const closeAdmin = document.getElementById('closeAdmin');
            if (closeAdmin) {
                closeAdmin.addEventListener('click', () => this.hideAdminModal());
            }
            
            // Admin tabs
            document.querySelectorAll('.admin-tab').forEach(tab => {
                tab.addEventListener('click', (e) => this.switchAdminTab(e.target.dataset.tab));
            });
            
            // Add APK form
            const addApkForm = document.getElementById('addApkForm');
            if (addApkForm) {
                addApkForm.addEventListener('submit', (e) => this.handleAddAPKSubmit(e));
            }
            
            // Cancel edit
            const cancelEdit = document.getElementById('cancelEdit');
            if (cancelEdit) {
                cancelEdit.addEventListener('click', () => this.cancelEdit());
            }
            
            // Search functionality
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                // Handle input with suggestions
                searchInput.addEventListener('input', (e) => {
                    clearTimeout(this.searchTimeout);
                    this.searchTimeout = setTimeout(() => {
                        this.handleSearchWithSuggestions(e.target.value);
                    }, 300);
                });
                
                // Handle enter key for immediate search
                searchInput.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        this.hideSuggestions();
                        this.handleSearch();
                    }
                });
                
                searchInput.addEventListener('blur', () => {
                    // Hide suggestions after a delay to allow clicks
                    setTimeout(() => this.hideSuggestions(), 200);
                });
            }
            
            // Filters and sorting
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                categoryFilter.addEventListener('change', (e) => {
                    console.log('Category filter changed:', e.target.value);
                    this.handleFilter();
                });
            }
            
            const sortBy = document.getElementById('sortBy');
            if (sortBy) {
                sortBy.addEventListener('change', (e) => {
                    console.log('Sort changed:', e.target.value);
                    this.handleSort();
                });
            }
            
            // APK modal
            const closeApkModal = document.getElementById('closeApkModal');
            if (closeApkModal) {
                closeApkModal.addEventListener('click', () => this.hideAPKModal());
            }
            
            // Updates banner
            const dismissUpdates = document.getElementById('dismissUpdates');
            if (dismissUpdates) {
                dismissUpdates.addEventListener('click', () => {
                    document.getElementById('updatesBanner')?.classList.add('hidden');
                });
            }
            
            // Click outside modal to close
            window.addEventListener('click', (e) => {
                if (e.target.classList.contains('modal')) {
                    e.target.classList.add('hidden');
                }
            });
            
            console.log('Event listeners set up successfully');
            
        } catch (error) {
            console.error('Error setting up event listeners:', error);
        }
    }

    // Theme Management
    initTheme() {
        try {
            const savedTheme = localStorage.getItem('modapk_theme') || 'light';
            document.documentElement.setAttribute('data-color-scheme', savedTheme);
            this.updateThemeButton(savedTheme);
        } catch (error) {
            console.error('Error initializing theme:', error);
        }
    }

    toggleTheme() {
        try {
            const currentTheme = document.documentElement.getAttribute('data-color-scheme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-color-scheme', newTheme);
            localStorage.setItem('modapk_theme', newTheme);
            this.updateThemeButton(newTheme);
        } catch (error) {
            console.error('Error toggling theme:', error);
        }
    }

    updateThemeButton(theme) {
        try {
            const button = document.getElementById('themeToggle');
            if (button) {
                const icon = button.querySelector('i');
                if (icon) {
                    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
                }
            }
        } catch (error) {
            console.error('Error updating theme button:', error);
        }
    }

    // Authentication Modal Management
    showAuthModal(mode = 'login') {
        try {
            console.log('Showing auth modal:', mode);
            const modal = document.getElementById('authModal');
            const title = document.getElementById('authModalTitle');
            const signupFields = document.getElementById('signupFields');
            const submitBtn = document.getElementById('authSubmitBtn');
            const toggleText = document.getElementById('authToggleText');
            
            if (modal) modal.classList.remove('hidden');
            
            if (mode === 'signup') {
                if (title) title.textContent = 'Sign Up';
                if (signupFields) signupFields.classList.remove('hidden');
                if (submitBtn) submitBtn.textContent = 'Sign Up';
                if (toggleText) toggleText.innerHTML = 'Already have an account? <button type="button" id="toggleAuthMode" class="auth-link">Sign in</button>';
            } else {
                if (title) title.textContent = 'Login';
                if (signupFields) signupFields.classList.add('hidden');
                if (submitBtn) submitBtn.textContent = 'Login';
                if (toggleText) toggleText.innerHTML = 'Don\'t have an account? <button type="button" id="toggleAuthMode" class="auth-link">Sign up</button>';
            }
            
            // Re-attach event listener for toggle button
            setTimeout(() => {
                const newToggleBtn = document.getElementById('toggleAuthMode');
                if (newToggleBtn) {
                    newToggleBtn.addEventListener('click', () => this.toggleAuthMode());
                }
            }, 100);
            
        } catch (error) {
            console.error('Error showing auth modal:', error);
        }
    }

    hideAuthModal() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.add('hidden');
            
            // Reset form
            const form = document.getElementById('authForm');
            if (form) form.reset();
        }
    }

    toggleAuthMode() {
        const title = document.getElementById('authModalTitle');
        const isLogin = title && title.textContent === 'Login';
        this.showAuthModal(isLogin ? 'signup' : 'login');
    }

    async handleAuthSubmit(e) {
        e.preventDefault();
        
        const email = document.getElementById('authEmail')?.value;
        const password = document.getElementById('authPassword')?.value;
        const title = document.getElementById('authModalTitle');
        const isLogin = title && title.textContent === 'Login';
        
        if (isLogin) {
            await this.signInWithEmail(email, password);
        } else {
            const confirmPassword = document.getElementById('authConfirmPassword')?.value;
            const username = document.getElementById('authUsername')?.value;
            
            if (password !== confirmPassword) {
                this.showToast('Passwords do not match', 'error');
                return;
            }
            
            await this.signUpWithEmail(email, password, username);
        }
    }

    // Admin Panel Management
    showAdminModal() {
        const modal = document.getElementById('adminModal');
        if (modal) {
            modal.classList.remove('hidden');
            this.loadAdminData();
        }
    }

    hideAdminModal() {
        const modal = document.getElementById('adminModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    switchAdminTab(tabName) {
        try {
            // Update tab buttons
            document.querySelectorAll('.admin-tab').forEach(tab => {
                tab.classList.remove('active');
            });
            const activeTab = document.querySelector(`[data-tab="${tabName}"]`);
            if (activeTab) activeTab.classList.add('active');
            
            // Update tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            const activeContent = document.getElementById(`${tabName}Tab`);
            if (activeContent) activeContent.classList.add('active');
            
            // Load tab-specific data
            switch (tabName) {
                case 'manage':
                    this.renderAdminAPKList();
                    break;
                case 'add':
                    this.renderAdminCategories();
                    break;
                case 'users':
                    this.loadUsersData();
                    break;
                case 'analytics':
                    this.loadAnalyticsData();
                    break;
            }
        } catch (error) {
            console.error('Error switching admin tab:', error);
        }
    }

    async loadAdminData() {
        try {
            this.renderAdminAPKList();
            this.renderAdminCategories();
        } catch (error) {
            console.error('Error loading admin data:', error);
        }
    }

    renderAdminCategories() {
        const categorySelect = document.getElementById('appCategory');
        const adminCategoryFilter = document.getElementById('adminCategoryFilter');
        
        if (categorySelect) {
            categorySelect.innerHTML = '<option value="">Select Category</option>' + 
                this.categories.map(cat => `<option value="${this.escapeHtml(cat.name)}">${this.escapeHtml(cat.name)}</option>`).join('');
        }
        
        if (adminCategoryFilter) {
            adminCategoryFilter.innerHTML = '<option value="">All Categories</option>' + 
                this.categories.map(cat => `<option value="${this.escapeHtml(cat.name)}">${this.escapeHtml(cat.name)}</option>`).join('');
        }
    }

    renderAdminAPKList() {
        const container = document.getElementById('adminApkList');
        if (!container) return;
        
        if (this.apks.length === 0) {
            container.innerHTML = '<p>No APKs found. Add some APKs to get started.</p>';
            return;
        }
        
        container.innerHTML = this.apks.map(apk => `
            <div class="admin-apk-item">
                <div class="admin-apk-info">
                    <h4>${this.escapeHtml(apk.name)} v${this.escapeHtml(apk.version)}</h4>
                    <p>${this.escapeHtml(apk.category)} • ${this.formatNumber(apk.download_count || 0)} downloads</p>
                    <div class="admin-apk-badges">
                        ${apk.featured ? '<span class="admin-badge featured">Featured</span>' : ''}
                        ${apk.verified ? '<span class="admin-badge verified">Verified</span>' : ''}
                    </div>
                </div>
                <div class="admin-apk-actions">
                    <button class="btn btn--outline btn--sm" onclick="window.app.editAPK('${apk.id}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn--outline btn--sm" onclick="window.app.confirmDeleteAPK('${apk.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    async handleAddAPKSubmit(e) {
        e.preventDefault();
        
        try {
            // Collect form data
            const formData = {
                name: document.getElementById('appName')?.value || '',
                version: document.getElementById('appVersion')?.value || '',
                category: document.getElementById('appCategory')?.value || '',
                description: document.getElementById('appDescription')?.value || '',
                download_url: document.getElementById('appDownloadLink')?.value || '',
                file_size: document.getElementById('appFileSize')?.value || '',
                android_version: document.getElementById('appAndroidVersion')?.value || '',
                featured: document.getElementById('appFeatured')?.checked || false,
                verified: document.getElementById('appVerified')?.checked || false,
                tags: document.getElementById('appTags')?.value.split(',').map(tag => tag.trim()).filter(tag => tag) || []
            };
            
            // Validation
            if (!formData.name || !formData.version || !formData.category || !formData.description || !formData.download_url) {
                this.showToast('Please fill in all required fields!', 'error');
                return;
            }
            
            // Handle file uploads
            const iconFile = document.getElementById('appIcon')?.files[0];
            const screenshotFiles = document.getElementById('appScreenshots')?.files;
            
            if (iconFile || (screenshotFiles && screenshotFiles.length > 0)) {
                try {
                    const uploadedFiles = await this.uploadAPKFiles(iconFile, screenshotFiles);
                    if (uploadedFiles.icon_url) formData.icon_url = uploadedFiles.icon_url;
                    if (uploadedFiles.screenshot_urls.length > 0) formData.screenshot_urls = uploadedFiles.screenshot_urls;
                } catch (uploadError) {
                    console.error('File upload failed:', uploadError);
                    this.showToast('File upload failed: ' + uploadError.message, 'error');
                    return;
                }
            }
            
            if (this.currentEditId) {
                if (this.supabase) {
                    await this.updateAPK(this.currentEditId, formData);
                } else {
                    // Demo mode - update local array
                    const index = this.apks.findIndex(a => a.id === this.currentEditId);
                    if (index !== -1) {
                        this.apks[index] = { ...this.apks[index], ...formData };
                        this.filteredAPKs = [...this.apks];
                        this.loadCategories();
                        this.renderCategories();
                        this.renderAPKGrid();
                        this.renderAdminAPKList();
                        this.updateStats();
                        this.showToast('APK updated successfully (demo mode)!', 'success');
                    }
                }
                this.cancelEdit();
            } else {
                if (this.supabase) {
                    await this.addAPK(formData);
                } else {
                    // Demo mode - add to local array
                    const newAPK = {
                        id: Date.now().toString(),
                        ...formData,
                        download_count: 0,
                        rating: 0,
                        review_count: 0,
                        created_at: new Date().toISOString()
                    };
                    this.apks.unshift(newAPK);
                    this.filteredAPKs = [...this.apks];
                    this.loadCategories();
                    this.renderCategories();
                    this.renderAPKGrid();
                    this.renderAdminAPKList();
                    this.updateStats();
                    this.showToast('APK added successfully (demo mode)!', 'success');
                }
            }
            
            // Reset form
            const form = document.getElementById('addApkForm');
            if (form) form.reset();
            
        } catch (error) {
            console.error('Error submitting APK form:', error);
            this.showToast('Error saving APK: ' + error.message, 'error');
        }
    }

    editAPK(id) {
        const apk = this.apks.find(a => a.id === id);
        if (!apk) return;
        
        this.currentEditId = id;
        
        // Switch to add tab
        this.switchAdminTab('add');
        
        // Populate form
        const fields = [
            ['appName', apk.name],
            ['appVersion', apk.version],
            ['appCategory', apk.category],
            ['appDescription', apk.description],
            ['appDownloadLink', apk.download_url],
            ['appFileSize', apk.file_size || ''],
            ['appAndroidVersion', apk.android_version || ''],
            ['appTags', (apk.tags || []).join(', ')]
        ];
        
        fields.forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.value = value;
        });
        
        const featuredCheckbox = document.getElementById('appFeatured');
        const verifiedCheckbox = document.getElementById('appVerified');
        if (featuredCheckbox) featuredCheckbox.checked = apk.featured || false;
        if (verifiedCheckbox) verifiedCheckbox.checked = apk.verified || false;
        
        // Update UI
        const title = document.querySelector('#addTab h3');
        const submitBtn = document.querySelector('#addApkForm button[type="submit"]');
        const cancelBtn = document.getElementById('cancelEdit');
        
        if (title) title.textContent = 'Edit APK';
        if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-save"></i> Update APK';
        if (cancelBtn) cancelBtn.classList.remove('hidden');
    }

    cancelEdit() {
        this.currentEditId = null;
        
        const form = document.getElementById('addApkForm');
        if (form) form.reset();
        
        const title = document.querySelector('#addTab h3');
        const submitBtn = document.querySelector('#addApkForm button[type="submit"]');
        const cancelBtn = document.getElementById('cancelEdit');
        
        if (title) title.textContent = 'Add New APK';
        if (submitBtn) submitBtn.innerHTML = '<i class="fas fa-plus"></i> Add APK';
        if (cancelBtn) cancelBtn.classList.add('hidden');
    }

    confirmDeleteAPK(id) {
        const apk = this.apks.find(a => a.id === id);
        if (apk && confirm(`Are you sure you want to delete "${apk.name}"?`)) {
            this.deleteAPK(id);
        }
    }

    async loadUsersData() {
        try {
            const container = document.getElementById('usersList');
            if (!container) return;
            
            if (!this.supabase) {
                container.innerHTML = '<p>User management requires Supabase configuration.</p>';
                return;
            }
            
            const { data: users, error } = await this.supabase
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            if (!users || users.length === 0) {
                container.innerHTML = '<p>No users found.</p>';
                return;
            }
            
            container.innerHTML = users.map(user => `
                <div class="user-item">
                    <div class="user-info-admin">
                        <img class="user-avatar-admin" src="${user.profile_avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}" alt="Avatar">
                        <div class="user-details">
                            <h4>${this.escapeHtml(user.username || user.email)}</h4>
                            <p>${this.escapeHtml(user.email)} • Joined ${this.formatDate(user.created_at)}</p>
                        </div>
                    </div>
                    <div class="user-actions">
                        <span class="user-role-badge ${user.role}">${user.role}</span>
                    </div>
                </div>
            `).join('');
            
        } catch (error) {
            console.error('Error loading users data:', error);
            const container = document.getElementById('usersList');
            if (container) {
                container.innerHTML = '<p>Error loading users data.</p>';
            }
        }
    }

    async loadAnalyticsData() {
        try {
            // Load recent activity
            const activityContainer = document.getElementById('realtimeActivity');
            if (activityContainer) {
                // This is a simplified version - in a real app, you'd have an activities table
                const recentDownloads = this.apks
                    .sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
                    .slice(0, 5);
                
                activityContainer.innerHTML = recentDownloads.map((apk, index) => `
                    <div class="activity-item">
                        <div class="activity-icon download">
                            <i class="fas fa-download"></i>
                        </div>
                        <span>${this.escapeHtml(apk.name)} was downloaded</span>
                    </div>
                `).join('');
            }
            
            // Load popular downloads
            const popularContainer = document.getElementById('popularDownloads');
            if (popularContainer) {
                const popular = this.apks
                    .sort((a, b) => (b.download_count || 0) - (a.download_count || 0))
                    .slice(0, 5);
                
                popularContainer.innerHTML = popular.map((apk, index) => `
                    <div class="popular-item">
                        <span>${index + 1}. ${this.escapeHtml(apk.name)}</span>
                        <span>${this.formatNumber(apk.download_count || 0)} downloads</span>
                    </div>
                `).join('');
            }
            
        } catch (error) {
            console.error('Error loading analytics data:', error);
        }
    }

    // UI Rendering Methods
    showLoadingIndicator(show) {
        const indicator = document.getElementById('loadingIndicator');
        if (indicator) {
            if (show) {
                indicator.classList.remove('hidden');
            } else {
                indicator.classList.add('hidden');
            }
        }
    }

    renderCategories() {
        try {
            const categoryFilter = document.getElementById('categoryFilter');
            const categoriesList = document.getElementById('categoriesList');
            
            const categoryOptions = this.categories.map(cat => 
                `<option value="${this.escapeHtml(cat.name)}">${this.escapeHtml(cat.name)}</option>`
            ).join('');
            
            if (categoryFilter) {
                categoryFilter.innerHTML = '<option value="">All Categories</option>' + categoryOptions;
            }
            
            if (categoriesList) {
                categoriesList.innerHTML = this.categories.map(cat => `
                    <div class="category-item" onclick="window.app.filterByCategory('${cat.name}')">
                        <div class="category-info">
                            <i class="${cat.icon}" style="color: ${cat.color}"></i>
                            <span>${this.escapeHtml(cat.name)}</span>
                        </div>
                        <span class="category-count">${cat.count}</span>
                    </div>
                `).join('');
            }
        } catch (error) {
            console.error('Error rendering categories:', error);
        }
    }

    filterByCategory(categoryName) {
        const categoryFilter = document.getElementById('categoryFilter');
        if (categoryFilter) {
            categoryFilter.value = categoryName;
            this.handleFilter();
        }
    }

    renderAPKGrid(apks = null) {
        try {
            const grid = document.getElementById('apkGrid');
            if (!grid) return;
            
            const apksToRender = apks || this.filteredAPKs || this.apks;
            
            if (!apksToRender || apksToRender.length === 0) {
                grid.innerHTML = `
                    <div class="no-results">
                        <i class="fas fa-search"></i>
                        <h3>No APKs Found</h3>
                        <p>Try adjusting your search or filter criteria.</p>
                    </div>
                `;
                return;
            }
            
            grid.innerHTML = apksToRender.map(apk => `
                <div class="apk-card ${apk.featured ? 'featured' : ''} ${apk.verified ? 'verified' : ''}" 
                     data-apk-id="${apk.id}"
                     tabindex="0" role="button" aria-label="View ${apk.name} details">
                    <div class="apk-card-image">
                        ${(apk.screenshot_urls && apk.screenshot_urls[0]) ? 
                            `<img src="${apk.screenshot_urls[0]}" alt="${this.escapeHtml(apk.name)}" onerror="this.parentElement.innerHTML='<i class=\\"fas fa-mobile-alt\\"></i>'">` :
                            '<i class="fas fa-mobile-alt"></i>'
                        }
                    </div>
                    <div class="apk-card-content">
                        <div class="apk-card-header">
                            <h3 class="apk-card-title">${this.escapeHtml(apk.name)}</h3>
                            <span class="apk-card-version">v${this.escapeHtml(apk.version)}</span>
                        </div>
                        <span class="apk-card-category">${this.escapeHtml(apk.category)}</span>
                        <p class="apk-card-description">${this.escapeHtml(apk.description)}</p>
                        <div class="apk-card-meta">
                            <span class="apk-card-downloads">
                                <i class="fas fa-download"></i>
                                ${this.formatNumber(apk.download_count || 0)}
                            </span>
                            ${apk.rating ? `
                                <span class="apk-card-rating">
                                    <i class="fas fa-star"></i>
                                    ${apk.rating.toFixed(1)}
                                </span>
                            ` : ''}
                        </div>
                        ${apk.tags && apk.tags.length > 0 ? `
                            <div class="apk-card-tags">
                                ${apk.tags.slice(0, 3).map(tag => `<span class="apk-card-tag">${this.escapeHtml(tag)}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('');
            
            // Add click listeners to APK cards
            this.attachAPKCardListeners();
            
        } catch (error) {
            console.error('Error rendering APK grid:', error);
        }
    }

    attachAPKCardListeners() {
        try {
            const apkCards = document.querySelectorAll('.apk-card');
            apkCards.forEach(card => {
                card.addEventListener('click', (e) => {
                    e.preventDefault();
                    const apkId = card.getAttribute('data-apk-id');
                    console.log('APK card clicked:', apkId);
                    if (apkId) {
                        this.showAPKDetails(apkId);
                    }
                });
                
                // Add keyboard support
                card.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        const apkId = card.getAttribute('data-apk-id');
                        if (apkId) {
                            this.showAPKDetails(apkId);
                        }
                    }
                });
            });
        } catch (error) {
            console.error('Error attaching APK card listeners:', error);
        }
    }

    // Search and Filter
    handleSearch() {
        try {
            console.log('Handling search...');
            const searchInput = document.getElementById('searchInput');
            const categoryFilter = document.getElementById('categoryFilter');
            
            const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
            const category = categoryFilter ? categoryFilter.value : '';
            
            console.log('Search query:', query, 'Category:', category);
            
            let filtered = [...this.apks];
            
            if (query) {
                filtered = filtered.filter(apk => 
                    apk.name.toLowerCase().includes(query) ||
                    apk.description.toLowerCase().includes(query) ||
                    (apk.tags && apk.tags.some(tag => tag.toLowerCase().includes(query)))
                );
            }
            
            if (category) {
                filtered = filtered.filter(apk => apk.category === category);
            }
            
            console.log('Filtered results:', filtered.length);
            this.filteredAPKs = filtered;
            this.renderAPKGrid(filtered);
            
        } catch (error) {
            console.error('Error in search:', error);
        }
    }

    handleFilter() {
        console.log('Handling filter...');
        this.handleSearch(); // Filter is combined with search
    }

    handleSort() {
        try {
            const sortBy = document.getElementById('sortBy');
            if (!sortBy) return;
            
            const sortValue = sortBy.value;
            console.log('Sorting by:', sortValue);
            const sortedAPKs = [...this.filteredAPKs];
            
            switch (sortValue) {
                case 'name':
                    sortedAPKs.sort((a, b) => a.name.localeCompare(b.name));
                    break;
                case 'date':
                    sortedAPKs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                    break;
                case 'downloads':
                    sortedAPKs.sort((a, b) => (b.download_count || 0) - (a.download_count || 0));
                    break;
                case 'rating':
                    sortedAPKs.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                    break;
            }
            
            console.log('Sorted results:', sortedAPKs.length);
            this.renderAPKGrid(sortedAPKs);
        } catch (error) {
            console.error('Error in sort:', error);
        }
    }

    // APK Details Modal
    showAPKDetails(id) {
        try {
            console.log('Showing APK details for ID:', id);
            const apk = this.apks.find(a => a.id === id || a.id === String(id));
            if (!apk) {
                console.error('APK not found with ID:', id);
                this.showToast('APK not found', 'error');
                return;
            }
            
            const modal = document.getElementById('apkModal');
            const title = document.getElementById('apkModalTitle');
            const content = document.getElementById('apkModalContent');
            
            if (!modal || !title || !content) {
                console.error('Modal elements not found');
                return;
            }
            
            title.textContent = apk.name;
            content.innerHTML = `
                <div class="apk-modal-content">
                    <div class="apk-modal-header">
                        <div class="apk-modal-image">
                            ${(apk.screenshot_urls && apk.screenshot_urls[0]) ? 
                                `<img src="${apk.screenshot_urls[0]}" alt="${this.escapeHtml(apk.name)}" onerror="this.parentElement.innerHTML='<i class=\\"fas fa-mobile-alt\\"></i>'">` :
                                '<i class="fas fa-mobile-alt"></i>'
                            }
                        </div>
                        <div class="apk-modal-info">
                            <h3>${this.escapeHtml(apk.name)}</h3>
                            <div class="apk-modal-meta">
                                <div class="apk-modal-meta-item"><strong>Version:</strong> ${this.escapeHtml(apk.version)}</div>
                                <div class="apk-modal-meta-item"><strong>Category:</strong> ${this.escapeHtml(apk.category)}</div>
                                <div class="apk-modal-meta-item"><strong>Downloads:</strong> ${this.formatNumber(apk.download_count || 0)}</div>
                                <div class="apk-modal-meta-item"><strong>File Size:</strong> ${this.escapeHtml(apk.file_size || 'Unknown')}</div>
                                ${apk.rating ? `<div class="apk-modal-meta-item"><strong>Rating:</strong> ${apk.rating.toFixed(1)}/5.0</div>` : ''}
                                ${apk.android_version ? `<div class="apk-modal-meta-item"><strong>Android:</strong> ${this.escapeHtml(apk.android_version)}</div>` : ''}
                            </div>
                        </div>
                    </div>
                    <div class="apk-modal-description">
                        <h4>Description</h4>
                        <p>${this.escapeHtml(apk.description)}</p>
                        ${apk.tags && apk.tags.length > 0 ? `
                            <div class="apk-modal-tags">
                                <strong>Tags:</strong>
                                ${apk.tags.map(tag => `<span class="apk-card-tag">${this.escapeHtml(tag)}</span>`).join('')}
                            </div>
                        ` : ''}
                    </div>
                    <div class="apk-modal-download">
                        <button class="btn btn--primary btn--lg" onclick="window.app.initiateDownload('${id}')">
                            <i class="fas fa-download"></i> Download APK
                        </button>
                        <p style="margin-top: var(--space-8); font-size: var(--font-size-sm); color: var(--color-text-secondary);">
                            <i class="fas fa-exclamation-triangle"></i>
                            Download at your own risk. Ensure you trust the source.
                        </p>
                    </div>
                </div>
            `;
            
            modal.classList.remove('hidden');
            console.log('APK modal shown successfully');
        } catch (error) {
            console.error('Error showing APK details:', error);
            this.showToast('Error loading APK details', 'error');
        }
    }

    hideAPKModal() {
        const modal = document.getElementById('apkModal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    async initiateDownload(id) {
        try {
            console.log('Initiating download for APK ID:', id);
            const apk = this.apks.find(a => a.id === id || a.id === String(id));
            if (!apk) {
                this.showToast('APK not found', 'error');
                return;
            }
            
            // Record download in database
            await this.recordDownload(id);
            
            // Update local download count for immediate UI feedback
            const apkIndex = this.apks.findIndex(a => a.id === id || a.id === String(id));
            if (apkIndex !== -1) {
                this.apks[apkIndex].download_count = (this.apks[apkIndex].download_count || 0) + 1;
                const filteredIndex = this.filteredAPKs.findIndex(a => a.id === id || a.id === String(id));
                if (filteredIndex !== -1) {
                    this.filteredAPKs[filteredIndex].download_count = this.apks[apkIndex].download_count;
                }
                this.renderAPKGrid();
                this.updateStats();
            }
            
            this.hideAPKModal();
            this.showToast('Download started! Opening link...', 'success');
            
            // Open download link
            setTimeout(() => {
                window.open(apk.download_url, '_blank');
            }, 500);
            
        } catch (error) {
            console.error('Error initiating download:', error);
            this.showToast('Error processing download: ' + error.message, 'error');
        }
    }

    // Statistics
    async updateStats() {
        try {
            const totalApks = this.apks.length;
            const totalDownloads = this.apks.reduce((sum, apk) => sum + (apk.download_count || 0), 0);
            const ratingsData = this.apks.filter(apk => apk.rating);
            const avgRating = ratingsData.length > 0 ? 
                ratingsData.reduce((sum, apk) => sum + apk.rating, 0) / ratingsData.length : 0;
            
            // Get total users count from Supabase
            let totalUsers = 0;
            if (this.supabase) {
                try {
                    const { count } = await this.supabase
                        .from('users')
                        .select('*', { count: 'exact', head: true });
                    totalUsers = count || 0;
                } catch (error) {
                    console.log('Could not fetch users count:', error);
                }
            }
            
            // Update UI elements
            const elements = [
                ['totalApks', totalApks],
                ['totalDownloads', this.formatNumber(totalDownloads)],
                ['totalUsers', totalUsers],
                ['avgRating', avgRating.toFixed(1)]
            ];
            
            elements.forEach(([id, value]) => {
                const element = document.getElementById(id);
                if (element) element.textContent = value;
            });
            
        } catch (error) {
            console.error('Error updating stats:', error);
        }
    }

    // Toast Notifications
    showToast(message, type = 'info') {
        try {
            const container = document.getElementById('toastContainer');
            if (!container) {
                console.log('Toast:', message, `(${type})`);
                return;
            }
            
            const toast = document.createElement('div');
            toast.className = `toast toast--${type}`;
            
            const icon = {
                success: 'fas fa-check-circle',
                error: 'fas fa-exclamation-circle',
                info: 'fas fa-info-circle',
                warning: 'fas fa-exclamation-triangle'
            }[type] || 'fas fa-info-circle';
            
            toast.innerHTML = `
                <i class="${icon}"></i>
                <span>${this.escapeHtml(message)}</span>
            `;
            
            container.appendChild(toast);
            
            // Auto remove after 5 seconds
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 5000);
            
            // Click to remove
            toast.addEventListener('click', () => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            });
        } catch (error) {
            console.error('Error showing toast:', error);
        }
    }

    // Utility Functions
    formatNumber(num) {
        if (!num || num === 0) return '0';
        if (num >= 1000000) {
            return (num / 1000000).toFixed(1) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'K';
        }
        return num.toString();
    }

    formatDate(dateString) {
        try {
            if (!dateString) return 'Unknown';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
            });
        } catch (error) {
            return 'Invalid Date';
        }
    }

    escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Cleanup
    destroy() {
        // Unsubscribe from real-time subscriptions
        this.realtimeSubscriptions.forEach(subscription => {
            subscription.unsubscribe();
        });
        
        // Clear intervals
        if (this.activityInterval) {
            clearInterval(this.activityInterval);
        }
        
        // Clear timeouts
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
        }
    }
}

// Initialize the application
console.log('Creating ModAPK Hub instance with Supabase...');
window.app = new ModAPKHub();

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.destroy();
    }
});

console.log('ModAPK Hub with Supabase integration loaded successfully!');
console.log('Configure Supabase credentials to get started, or close the modal to try demo mode.');