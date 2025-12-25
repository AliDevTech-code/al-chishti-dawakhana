  // === SUPABASE CONFIGURATION ===
        const SUPABASE_URL = 'https://notwlzblvoxrrjwehudt.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdHdsemJsdm94cnJqd2VodWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjA1MDEsImV4cCI6MjA3ODU5NjUwMX0.fQFJl2yvd_oc3-3X8bOAuomfNHRkt3Nj5kat8cL-KuQ';
        
        // Global Variables
       
        let currentUser = null;
        let currentOrderId = null;
        let currentEditMedicineId = null;
        
        // === INITIALIZE APPLICATION ===
        document.addEventListener('DOMContentLoaded', function() {
            initApp();
        });
        
        function initApp() {
            // Check if Supabase is available
            if (typeof window.supabase === 'undefined') {
                showAlert('loginAlert', 'Error: Supabase not loaded. Please check internet connection.', 'error');
                return;
            }
            
            // Initialize Supabase client
            try {
                supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('Supabase initialized successfully');
            } catch (error) {
                showAlert('loginAlert', 'Failed to initialize Supabase: ' + error.message, 'error');
                return;
            }
            
            // Setup event listeners
            setupEventListeners();
            
            // Check authentication state
            checkAuthState();
            
            // Update current date
            updateCurrentDate();
            
            // Auto-fill credentials for testing (remove in production)
            document.getElementById('loginEmail').value = 'abdulrazzaq786@gmail.com';
            document.getElementById('loginPassword').value = 'abdulrazzaq786@gmail';
        }
        
        function setupEventListeners() {
            // Login form
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', handleLogin);
            }
            
            // Add medicine form
            const addMedicineForm = document.getElementById('addMedicineForm');
            if (addMedicineForm) {
                addMedicineForm.addEventListener('submit', handleAddMedicine);
            }
        }
        
        async function checkAuthState() {
            try {
                const { data: { session } } = await supabase.auth.getSession();
                
                if (session) {
                    currentUser = session.user;
                    showDashboard();
                    loadDashboardData();
                } else {
                    showLogin();
                }
                
                // Listen for auth state changes
                supabase.auth.onAuthStateChange((event, session) => {
                    console.log('Auth event:', event);
                    
                    if (event === 'SIGNED_IN') {
                        currentUser = session.user;
                        showDashboard();
                        loadDashboardData();
                    } else if (event === 'SIGNED_OUT') {
                        currentUser = null;
                        showLogin();
                    }
                });
                
            } catch (error) {
                console.error('Auth check error:', error);
                showLogin();
            }
        }
        
        // === AUTHENTICATION FUNCTIONS ===
        async function handleLogin(event) {
            event.preventDefault();
            
            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;
            
            if (!email || !password) {
                showAlert('loginAlert', 'Please enter email and password', 'error');
                return;
            }
            
            // Show loading
            document.getElementById('loginLoading').style.display = 'block';
            hideAlert('loginAlert');
            
            try {
                const { data, error } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: password
                });
                
                if (error) {
                    throw error;
                }
                
                // Success - Auth state change will handle redirection
                showAlert('loginAlert', 'Login successful! Redirecting...', 'success');
                
            } catch (error) {
                document.getElementById('loginLoading').style.display = 'none';
                
                let errorMessage = 'Login failed. ';
                if (error.message.includes('Invalid login credentials')) {
                    errorMessage = 'Invalid email or password.';
                } else {
                    errorMessage += error.message;
                }
                
                showAlert('loginAlert', errorMessage, 'error');
            }
        }
        
        async function logout() {
            try {
                const { error } = await supabase.auth.signOut();
                if (error) throw error;
                
                showAlert('loginAlert', 'Logged out successfully', 'success');
                setTimeout(() => location.reload(), 1000);
                
            } catch (error) {
                console.error('Logout error:', error);
                showAlert('loginAlert', 'Logout failed', 'error');
            }
        }
        
        // === UI FUNCTIONS ===
        function showLogin() {
            document.getElementById('loginPage').style.display = 'flex';
            document.getElementById('adminDashboard').style.display = 'none';
        }
        
        function showDashboard() {
            document.getElementById('loginPage').style.display = 'none';
            document.getElementById('adminDashboard').style.display = 'flex';
            
            // Update user info
            if (currentUser) {
                document.getElementById('adminEmail').textContent = currentUser.email;
                document.getElementById('profileEmail').value = currentUser.email;
                
                // Set display name
                const displayName = currentUser.email === 'abdulrazzaq786@gmail.com' 
                    ? 'Hakim Abdul Razzaq' 
                    : 'Admin User';
                
                document.getElementById('adminName').textContent = displayName;
                document.getElementById('pageTitle').textContent = `Welcome, ${displayName}`;
                
                // Set admin since date
                const adminSince = new Date(currentUser.created_at).toLocaleDateString();
                document.getElementById('adminSince').value = adminSince;
                document.getElementById('lastLogin').textContent = new Date().toLocaleString();
            }
        }
        
        function showSection(sectionId) {
            // Hide all sections
            const sections = ['dashboard', 'medicines', 'orders', 'add-medicine', 'profile'];
            sections.forEach(id => {
                const section = document.getElementById(id);
                if (section) {
                    section.classList.remove('active');
                }
            });
            
            // Show selected section
            const selectedSection = document.getElementById(sectionId);
            if (selectedSection) {
                selectedSection.classList.add('active');
            }
            
            // Update active nav link
            document.querySelectorAll('.nav-link').forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
            
            // Update page title
            const titles = {
                'dashboard': 'Dashboard Overview',
                'medicines': 'Manage Medicines',
                'orders': 'All Orders',
                'add-medicine': 'Add New Medicine',
                'profile': 'Admin Profile'
            };
            
            document.getElementById('pageTitle').textContent = titles[sectionId] || 'Dashboard';
            
            // Load data if needed
            if (sectionId === 'medicines') {
                loadMedicines();
            } else if (sectionId === 'orders') {
                loadOrders();
            } else if (sectionId === 'profile') {
                updateProfileStats();
            }
        }
        
        function toggleSidebar() {
            document.getElementById('sidebar').classList.toggle('active');
        }
        
        function updateCurrentDate() {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const dateStr = now.toLocaleDateString('en-US', options);
            document.getElementById('currentDate').textContent = dateStr;
        }
        
        // === DASHBOARD FUNCTIONS ===
        async function loadDashboardData() {
            try {
                // Load medicines count
                const { data: medicines, error: medError } = await supabase
                    .from('medicines')
                    .select('id');
                
                if (!medError) {
                    const totalMedicines = medicines ? medicines.length : 0;
                    document.getElementById('totalMedicines').textContent = totalMedicines;
                    document.getElementById('profileMedicines').textContent = totalMedicines;
                }
                
                // Load orders data
                const { data: orders, error: orderError } = await supabase
                    .from('orders')
                    .select('*');
                
                if (!orderError && orders) {
                    const totalOrders = orders.length;
                    const pendingOrders = orders.filter(o => o.status === 'pending').length;
                    const completedOrders = orders.filter(o => o.status === 'completed').length;
                    
                    // Update stats
                    document.getElementById('totalOrders').textContent = totalOrders;
                    document.getElementById('pendingOrders').textContent = pendingOrders;
                    document.getElementById('completedOrders').textContent = completedOrders;
                    document.getElementById('profileOrders').textContent = totalOrders;
                    
                    // Update recent orders table
                    updateRecentOrdersTable(orders);
                }
                
            } catch (error) {
                console.error('Error loading dashboard data:', error);
            }
        }
        
        function updateRecentOrdersTable(orders) {
            const tbody = document.getElementById('recentOrdersTable');
            
            if (!orders || orders.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="6" class="empty-state">
                            <i class="fas fa-shopping-cart"></i>
                            <p>No orders yet</p>
                        </td>
                    </tr>
                `;
                return;
            }
            
            // Sort by date (newest first) and take first 10
            const recentOrders = orders
                .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
                .slice(0, 10);
            
            tbody.innerHTML = recentOrders.map(order => `
                <tr>
                    <td><code>${order.id.substring(0, 8)}...</code></td>
                    <td><strong>${order.customer_name}</strong></td>
                    <td>${order.medicine_name}</td>
                    <td>Rs. ${order.total_price}</td>
                    <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                    <td>${new Date(order.created_at).toLocaleDateString()}</td>
                </tr>
            `).join('');
        }
        
        // === MEDICINES MANAGEMENT ===
        async function loadMedicines() {
            const tbody = document.getElementById('medicinesTable');
            
            // Show loading state
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <i class="fas fa-spinner fa-spin"></i> Loading medicines...
                    </td>
                </tr>
            `;
            
            try {
                const { data: medicines, error } = await supabase
                    .from('medicines')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (error) {
                    throw error;
                }
                
                if (!medicines || medicines.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="5" class="empty-state">
                                <i class="fas fa-capsules"></i>
                                <p>No medicines found</p>
                                <button class="btn btn-primary btn-small" onclick="showSection('add-medicine')" style="margin-top: 10px;">
                                    <i class="fas fa-plus"></i> Add First Medicine
                                </button>
                            </td>
                        </tr>
                    `;
                    return;
                }
                
                tbody.innerHTML = medicines.map(medicine => `
                    <tr>
                        <td>
                            <img src="${medicine.image_url || 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&q=80'}" 
                                 alt="${medicine.name}" 
                                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                        </td>
                        <td><strong>${medicine.name}</strong></td>
                        <td style="max-width: 300px; font-size: 13px;">${medicine.description || 'No description available'}</td>
                        <td><strong>Rs. ${medicine.price}</strong></td>
                        <td>
                            <div class="action-buttons">
                                <button class="btn btn-warning btn-small" onclick="editMedicine('${medicine.id}')">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                                <button class="btn btn-danger btn-small" onclick="deleteMedicine('${medicine.id}')">
                                    <i class="fas fa-trash"></i> Delete
                                </button>
                            </div>
                        </td>
                    </tr>
                `).join('');
                
            } catch (error) {
                console.error('Error loading medicines:', error);
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="empty-state">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Failed to load medicines</p>
                        </td>
                    </tr>
                `;
            }
        }
        
        // === ADD MEDICINE FUNCTIONS ===
        function previewImage(event) {
            const file = event.target.files[0];
            if (!file) return;
            
            // Check file size (max 2MB)
            if (file.size > 2 * 1024 * 1024) {
                showAlert('addMedicineAlert', 'Image size must be less than 2MB', 'error');
                return;
            }
            
            // Check file type
            if (!file.type.match('image.*')) {
                showAlert('addMedicineAlert', 'Please select an image file', 'error');
                return;
            }
            
            // Preview image
            const reader = new FileReader();
            reader.onload = function(e) {
                document.getElementById('previewImg').src = e.target.result;
                document.getElementById('imagePreview').style.display = 'block';
                document.getElementById('uploadArea').style.display = 'none';
            };
            reader.readAsDataURL(file);
        }
        
        function removeImage() {
            document.getElementById('medicineImage').value = '';
            document.getElementById('imagePreview').style.display = 'none';
            document.getElementById('uploadArea').style.display = 'block';
        }
        
        function resetMedicineForm() {
            document.getElementById('addMedicineForm').reset();
            removeImage();
            hideAlert('addMedicineAlert');
        }
        
        async function handleAddMedicine(event) {
            event.preventDefault();
            
            const name = document.getElementById('medicineName').value.trim();
            const price = document.getElementById('medicinePrice').value;
            const description = document.getElementById('medicineDescription').value.trim();
            const imageFile = document.getElementById('medicineImage').files[0];
            
            // Validation
            if (!name) {
                showAlert('addMedicineAlert', 'Please enter medicine name', 'error');
                return;
            }
            
            if (!price || parseFloat(price) <= 0) {
                showAlert('addMedicineAlert', 'Please enter a valid price', 'error');
                return;
            }
            
            try {
                showAlert('addMedicineAlert', 'Saving medicine...', 'success');
                
                let imageUrl = null;
                
                // Handle image upload
                if (imageFile) {
                    // Convert image to base64 (no storage bucket needed)
                    imageUrl = await fileToBase64(imageFile);
                } else {
                    // Default herbal medicine image
                    imageUrl = 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=500&q=80';
                }
                
                // Save to database
                const { data, error } = await supabase
                    .from('medicines')
                    .insert([{
                        name: name,
                        price: parseFloat(price),
                        description: description,
                        image_url: imageUrl,
                        created_at: new Date().toISOString()
                    }]);
                
                if (error) {
                    throw error;
                }
                
                showAlert('addMedicineAlert', '✅ Medicine added successfully!', 'success');
                
                // Reset form
                resetMedicineForm();
                
                // Refresh data and show medicines section
                setTimeout(() => {
                    showSection('medicines');
                    loadMedicines();
                    loadDashboardData();
                }, 1500);
                
            } catch (error) {
                console.error('Error adding medicine:', error);
                showAlert('addMedicineAlert', '❌ Failed to add medicine: ' + error.message, 'error');
            }
        }
        
        function fileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => resolve(reader.result);
                reader.onerror = error => reject(error);
            });
        }
        
        async function deleteMedicine(medicineId) {
            if (!confirm('Are you sure you want to delete this medicine? This action cannot be undone.')) {
                return;
            }
            
            try {
                const { error } = await supabase
                    .from('medicines')
                    .delete()
                    .eq('id', medicineId);
                
                if (error) {
                    throw error;
                }
                
                showAlert('medicineAlert', '✅ Medicine deleted successfully!', 'success');
                
                // Refresh medicines list
                setTimeout(() => {
                    loadMedicines();
                    loadDashboardData();
                }, 500);
                
            } catch (error) {
                console.error('Error deleting medicine:', error);
                showAlert('medicineAlert', '❌ Failed to delete medicine', 'error');
            }
        }
        
        function editMedicine(medicineId) {
            // Store medicine ID for editing
            currentEditMedicineId = medicineId;
            
            // You can implement edit functionality here
            alert('Edit functionality will be implemented in next version');
            // For now, redirect to add medicine section with edit mode
            showSection('add-medicine');
        }
        
        // === ORDERS MANAGEMENT ===
        async function loadOrders() {
            const tbody = document.getElementById('ordersTable');
            const statusFilter = document.getElementById('statusFilter').value;
            
            // Show loading state
            tbody.innerHTML = `
                <tr>
                    <td colspan="10" class="empty-state">
                        <i class="fas fa-spinner fa-spin"></i> Loading orders...
                    </td>
                </tr>
            `;
            
            try {
                let query = supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false });
                
                if (statusFilter) {
                    query = query.eq('status', statusFilter);
                }
                
                const { data: orders, error } = await query;
                
                if (error) {
                    throw error;
                }
                
                if (!orders || orders.length === 0) {
                    tbody.innerHTML = `
                        <tr>
                            <td colspan="10" class="empty-state">
                                <i class="fas fa-shopping-cart"></i>
                                <p>No orders found</p>
                            </td>
                        </tr>
                    `;
                    return;
                }
                
                tbody.innerHTML = orders.map(order => `
                    <tr>
                        <td><code>${order.id.substring(0, 8)}...</code></td>
                        <td><strong>${order.customer_name}</strong></td>
                        <td>${order.phone}</td>
                        <td>${order.medicine_name}</td>
                        <td>${order.quantity}</td>
                        <td><strong>Rs. ${order.total_price}</strong></td>
                        <td>${order.payment_method || 'N/A'}</td>
                        <td><span class="status-badge status-${order.status}">${order.status}</span></td>
                        <td>${new Date(order.created_at).toLocaleDateString()}</td>
                        <td>
                            <button class="btn btn-primary btn-small" onclick="openEditModal('${order.id}')">
                                <i class="fas fa-edit"></i> Update
                            </button>
                        </td>
                    </tr>
                `).join('');
                
            } catch (error) {
                console.error('Error loading orders:', error);
                tbody.innerHTML = `
                    <tr>
                        <td colspan="10" class="empty-state">
                            <i class="fas fa-exclamation-triangle"></i>
                            <p>Failed to load orders</p>
                        </td>
                    </tr>
                `;
            }
        }
        
        async function openEditModal(orderId) {
            currentOrderId = orderId;
            
            try {
                const { data: order, error } = await supabase
                    .from('orders')
                    .select('*')
                    .eq('id', orderId)
                    .single();
                
                if (error) {
                    throw error;
                }
                
                // Fill modal fields
                document.getElementById('editOrderId').value = order.id.substring(0, 12) + '...';
                document.getElementById('editCustomerName').value = order.customer_name;
                document.getElementById('editMedicineName').value = order.medicine_name;
                document.getElementById('orderStatus').value = order.status;
                document.getElementById('adminNotes').value = order.admin_notes || '';
                
                // Show modal
                document.getElementById('editOrderModal').style.display = 'flex';
                
            } catch (error) {
                console.error('Error loading order:', error);
                showAlert('loginAlert', 'Failed to load order details', 'error');
            }
        }
        
        function closeEditModal() {
            document.getElementById('editOrderModal').style.display = 'none';
            currentOrderId = null;
        }
        
        async function updateOrderStatus() {
            if (!currentOrderId) return;
            
            const status = document.getElementById('orderStatus').value;
            const notes = document.getElementById('adminNotes').value;
            
            try {
                const { error } = await supabase
                    .from('orders')
                    .update({
                        status: status,
                        admin_notes: notes,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', currentOrderId);
                
                if (error) {
                    throw error;
                }
                
                showAlert('loginAlert', '✅ Order status updated successfully!', 'success');
                closeEditModal();
                
                // Refresh data
                setTimeout(() => {
                    loadOrders();
                    loadDashboardData();
                }, 500);
                
            } catch (error) {
                console.error('Error updating order:', error);
                showAlert('loginAlert', '❌ Failed to update order status', 'error');
            }
        }
        
        // === UTILITY FUNCTIONS ===
        function updateProfileStats() {
            // This will be populated by loadDashboardData
        }
        
        function showAlert(elementId, message, type) {
            const alertDiv = document.getElementById(elementId);
            if (alertDiv) {
                alertDiv.textContent = message;
                alertDiv.className = `alert alert-${type}`;
                alertDiv.style.display = 'block';
                
                // Auto hide after 5 seconds
                setTimeout(() => {
                    alertDiv.style.display = 'none';
                }, 5000);
            } else {
                // Fallback to alert
                alert(`${type.toUpperCase()}: ${message}`);
            }
        }
        
        function hideAlert(elementId) {
            const alertDiv = document.getElementById(elementId);
            if (alertDiv) {
                alertDiv.style.display = 'none';
            }
        }
        
        // Close modal when clicking outside
        window.addEventListener('click', function(event) {
            if (event.target === document.getElementById('editOrderModal')) {
                closeEditModal();
            }
        });
        
        // Close modal with Escape key
        document.addEventListener('keydown', function(event) {
            if (event.key === 'Escape') {
                closeEditModal();
            }
        });
        
        // Auto-refresh data every 30 seconds
        setInterval(() => {
            if (currentUser) {
                loadDashboardData();
            }
        }, 30000);