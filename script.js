  // === SUPABASE CONFIGURATION ===
        const SUPABASE_URL = 'https://notwlzblvoxrrjwehudt.supabase.co';
        const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5vdHdsemJsdm94cnJqd2VodWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMwMjA1MDEsImV4cCI6MjA3ODU5NjUwMX0.fQFJl2yvd_oc3-3X8bOAuomfNHRkt3Nj5kat8cL-KuQ';

        // Global Variables
        let supabaseClient = null;

        // === INITIALIZE ===
        document.addEventListener('DOMContentLoaded', function () {
            // Remove loading screen
            setTimeout(() => {
                document.getElementById('loadingScreen').style.opacity = '0';
                document.getElementById('loadingScreen').style.visibility = 'hidden';
            }, 1000);

            // Initialize AOS
            AOS.init({
                duration: 1000,
                once: true,
                offset: 100
            });

            // Initialize Supabase
            initializeSupabase();

            // Initialize testimonials carousel only (medicines carousel removed)
            initializeTestimonialsCarousel();

            // Initialize custom cursor
            initCustomCursor();

            // Initialize scroll animations
            initScrollAnimations();

            // Initialize counter animation
            initCounterAnimation();

            // Setup event listeners
            setupEventListeners();
        });

        // === SUPABASE INITIALIZATION ===
        function initializeSupabase() {
            if (typeof window.supabase === 'undefined') {
                console.error('Supabase CDN not loaded');
                showDefaultMedicinesGrid();
                return;
            }

            try {
                supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
                console.log('✅ Supabase client initialized');

                // Load medicines from Supabase
                loadMedicinesFromSupabase();

            } catch (error) {
                console.error('❌ Supabase initialization error:', error);
                showDefaultMedicinesGrid();
            }
        }

        // === LOAD MEDICINES FROM SUPABASE ===
        async function loadMedicinesFromSupabase() {
            try {
                const { data: medicines, error } = await supabaseClient
                    .from('medicines')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (error) throw error;

                displayMedicinesGrid(medicines);

            } catch (error) {
                console.error('Error loading medicines:', error);
                showDefaultMedicinesGrid();
            }
        }

        function displayMedicinesGrid(medicines) {
            const container = document.getElementById('medicinesGrid');

            if (!medicines || medicines.length === 0) {
                container.innerHTML = `
                    <div class="medicine-card" style="text-align: center; padding: 50px; color: var(--text-light); grid-column: 1/-1;">
                        <i class="fas fa-capsules" style="font-size: 48px; margin-bottom: 20px;"></i>
                        <p>No medicines available yet</p>
                        <p style="font-size: 14px; margin-top: 10px;">Admin panel se medicines add karein</p>
                    </div>
                `;
                return;
            }

            let html = '';
            medicines.forEach((medicine, index) => {
                const imageUrl = medicine.image_url ||
                    'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80';

                html += `
                    <div class="medicine-card" data-aos="fade-up" data-aos-delay="${index * 100}">
                        <div class="medicine-image">
                            <img src="${imageUrl}" alt="${medicine.name}" 
                                 onerror="this.src='https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'">
                            <div class="medicine-badge">Premium</div>
                        </div>
                        <div class="medicine-content">
                            <h3 class="medicine-title">${medicine.name}</h3>
                            <p class="medicine-description">${medicine.description || 'Pure herbal formulation with natural ingredients'}</p>
                            <div class="medicine-price">Rs. ${medicine.price} <span>✔️</span></div>
                            <button class="btn btn-outline" onclick="orderMedicineWhatsApp('${medicine.name.replace(/'/g, "\\'")}', ${medicine.price})">
                                <i class="fas fa-shopping-cart"></i> Order Now
                            </button>
                        </div>
                    </div>
                `;
            });

            container.innerHTML = html;

            // Refresh animations
            if (window.AOS) {
                AOS.refresh();
            }
        }

        function showDefaultMedicinesGrid() {
            const container = document.getElementById('medicinesGrid');

            container.innerHTML = `
                <div class="medicine-card">
                    <div class="medicine-image">
                        <img src="https://images.unsplash.com/photo-1559757148-5c350d0d3c56?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Digestive Tonic">
                        <div class="medicine-badge">Best Seller</div>
                    </div>
                    <div class="medicine-content">
                        <h3 class="medicine-title">Digestive Tonic</h3>
                        <p class="medicine-description">Natural herbal formulation for improved digestion and gut health</p>
                        <div class="medicine-price">Rs. 1200 <span>✔️</span></div>
                        <button class="btn btn-outline" onclick="orderMedicineWhatsApp('Digestive Tonic', 1200)">
                            <i class="fas fa-shopping-cart"></i> Order Now
                        </button>
                    </div>
                </div>
                <div class="medicine-card">
                    <div class="medicine-image">
                        <img src="https://images.unsplash.com/photo-1584302179602-e9e5f10d7c1f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Joint Pain Relief">
                        <div class="medicine-badge">Popular</div>
                    </div>
                    <div class="medicine-content">
                        <h3 class="medicine-title">Joint Pain Relief</h3>
                        <p class="medicine-description">Herbal oil for arthritis and joint pain relief</p>
                        <div class="medicine-price">Rs. 1500 <span>✔️</span></div>
                        <button class="btn btn-outline" onclick="orderMedicineWhatsApp('Joint Pain Relief', 1500)">
                            <i class="fas fa-shopping-cart"></i> Order Now
                        </button>
                    </div>
                </div>
                <div class="medicine-card">
                    <div class="medicine-image">
                        <img src="https://images.unsplash.com/photo-1559757175-0eb30cd8c063?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Immunity Booster">
                        <div class="medicine-badge">New</div>
                    </div>
                    <div class="medicine-content">
                        <h3 class="medicine-title">Immunity Booster</h3>
                        <p class="medicine-description">Strengthen your immune system naturally</p>
                        <div class="medicine-price">Rs. 1000 <span>✔️</span></div>
                        <button class="btn btn-outline" onclick="orderMedicineWhatsApp('Immunity Booster', 1000)">
                            <i class="fas fa-shopping-cart"></i> Order Now
                        </button>
                    </div>
                </div>
            `;
        }

        function orderMedicineWhatsApp(medicineName, price) {
            // WhatsApp number (without country code for Pakistan)
            const phoneNumber = "923013404512"; // With country code

            // Create the message
            const text =
                `Assalam-o-Alaikum!

I want to order medicine from Hakim Abdul Razzaq website:

🏥 *Medicine:* ${medicineName}
💰 *Price:* Rs. ${price}

Please contact me for delivery details.

Thank you!
_Ordered via Website_`;

            // Encode the message
            const encodedText = encodeURIComponent(text);

            // Create the WhatsApp URL
            const url = `https://wa.me/${phoneNumber}?text=${encodedText}`;

            // Open WhatsApp
            window.open(url, '_blank');
        }

        // === CAROUSEL FUNCTIONS === (Only for testimonials)
        function initializeTestimonialsCarousel() {
            if (document.getElementById('testimonialsCarousel')) {
                new Glide('#testimonialsCarousel', {
                    type: 'carousel',
                    perView: 2,
                    gap: 30,
                    autoplay: 3000,
                    hoverpause: true,
                    breakpoints: {
                        992: { perView: 2 },
                        768: { perView: 1 }
                    }
                }).mount();
            }
        }
// Complete typing animation with loop control
function createTypingAnimation(config = {}) {
    const {
        elementId = 'typingName',
        text = "Hakim Abdul Razzaq",
        typingSpeed = 100,
        pauseAfterType = 2000,
        deleteSpeed = 50,
        pauseAfterDelete = 500,
        loop = true,
        startDelay = 2000
    } = config;
    
    const typingElement = document.getElementById(elementId);
    if (!typingElement) return null;
    
    let isRunning = true;
    let currentAnimation = null;
    
    function startAnimation() {
        isRunning = true;
        let i = 0;
        currentText = '';
        
        function typeChar() {
            if (!isRunning) return;
            
            if (i < text.length) {
                currentText = text.substring(0, i + 1);
                typingElement.innerHTML = currentText + 
                    '<span class="typing-cursor">|</span>';
                i++;
                currentAnimation = setTimeout(typeChar, typingSpeed);
            } else {
                // Typing complete
                if (loop) {
                    typingElement.innerHTML = currentText;
                    setTimeout(() => {
                        deleteChar();
                    }, pauseAfterType);
                } else {
                    typingElement.innerHTML = currentText;
                }
            }
        }
        
        function deleteChar() {
            if (!isRunning) return;
            
            if (currentText.length > 0) {
                currentText = currentText.substring(0, currentText.length - 1);
                typingElement.innerHTML = currentText + 
                    '<span class="typing-cursor">|</span>';
                currentAnimation = setTimeout(deleteChar, deleteSpeed);
            } else {
                // Deletion complete, restart
                setTimeout(() => {
                    i = 0;
                    typeChar();
                }, pauseAfterDelete);
            }
        }
        
        typeChar();
    }
    
    function stopAnimation() {
        isRunning = false;
        if (currentAnimation) {
            clearTimeout(currentAnimation);
        }
    }
    
    // Start animation
    setTimeout(startAnimation, startDelay);
    
    // Return controls
    return {
        start: startAnimation,
        stop: stopAnimation,
        restart: () => {
            stopAnimation();
            setTimeout(startAnimation, 500);
        }
    };
}

// Usage
document.addEventListener('DOMContentLoaded', function() {
    const typingAnimation = createTypingAnimation({
        elementId: 'typingName',
        text: "Hakim Abdul Razzaq",
        typingSpeed: 100,
        pauseAfterType: 2000,
        deleteSpeed: 50,
        pauseAfterDelete: 500,
        loop: true,
        startDelay: 2000
    });
    
    // Optionally expose controls to window
    window.typingAnimation = typingAnimation;
});
        // === CUSTOM CURSOR ===
        function initCustomCursor() {
            const cursorDot = document.getElementById('cursorDot');
            const cursorRing = document.getElementById('cursorRing');

            if (!cursorDot || !cursorRing) return;

            document.addEventListener('mousemove', (e) => {
                cursorDot.style.left = `${e.clientX}px`;
                cursorDot.style.top = `${e.clientY}px`;

                setTimeout(() => {
                    cursorRing.style.left = `${e.clientX}px`;
                    cursorRing.style.top = `${e.clientY}px`;
                }, 50);
            });

            // Hover effects
            document.querySelectorAll('a, button, .medicine-card, .contact-card').forEach(el => {
                el.addEventListener('mouseenter', () => {
                    cursorDot.style.transform = 'translate(-50%, -50%) scale(1.5)';
                    cursorRing.style.transform = 'translate(-50%, -50%) scale(1.5)';
                });

                el.addEventListener('mouseleave', () => {
                    cursorDot.style.transform = 'translate(-50%, -50%) scale(1)';
                    cursorRing.style.transform = 'translate(-50%, -50%) scale(1)';
                });
            });
        }
        function openWhatsAppOrder() {
            const phone = "923013404512"; // یہ number add کرو
            const text = "Assalam-o-Alaikum! I need consultation/medicine from Hakim Abdul Razzaq.";
            window.open(`https://wa.me/${phone}?text=${encodeURIComponent(text)}`, '_blank');
        }
        // === SCROLL ANIMATIONS ===
        function initScrollAnimations() {
            // Navbar scroll effect
            window.addEventListener('scroll', () => {
                const navbar = document.getElementById('navbar');
                const scrollTop = document.getElementById('scrollTop');

                if (window.scrollY > 100) {
                    navbar.classList.add('scrolled');
                    scrollTop.classList.add('active');
                } else {
                    navbar.classList.remove('scrolled');
                    scrollTop.classList.remove('active');
                }

                updateActiveNavLink();
            });
        }

        function updateActiveNavLink() {
            const sections = document.querySelectorAll('section');
            const navLinks = document.querySelectorAll('.nav-link');

            let current = '';
            sections.forEach(section => {
                const sectionTop = section.offsetTop;
                const sectionHeight = section.clientHeight;
                if (window.scrollY >= (sectionTop - 100)) {
                    current = section.getAttribute('id');
                }
            });

            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${current}`) {
                    link.classList.add('active');
                }
            });
        }

        // === COUNTER ANIMATION ===
        function initCounterAnimation() {
            const counters = document.querySelectorAll('.stat-number');

            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const counter = entry.target;
                        const target = parseInt(counter.getAttribute('data-count'));
                        animateCounter(counter, target);
                        observer.unobserve(counter);
                    }
                });
            }, { threshold: 0.5 });

            counters.forEach(counter => observer.observe(counter));
        }

        function animateCounter(element, target) {
            let current = 0;
            const increment = target / 100;
            const duration = 2000; // 2 seconds
            const interval = duration / 100;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    element.textContent = target + '+';
                    clearInterval(timer);
                } else {
                    element.textContent = Math.floor(current) + '+';
                }
            }, interval);
        }

        // === EVENT LISTENERS ===
        function setupEventListeners() {
            // Mobile menu toggle
            const mobileMenuBtn = document.getElementById('mobileMenuBtn');
            if (mobileMenuBtn) {
                mobileMenuBtn.addEventListener('click', toggleMobileMenu);
            }

            // Close mobile menu on link click
            document.querySelectorAll('.nav-link').forEach(link => {
                link.addEventListener('click', closeMobileMenu);
            });

            // Scroll to top
            const scrollTop = document.getElementById('scrollTop');
            if (scrollTop) {
                scrollTop.addEventListener('click', (e) => {
                    e.preventDefault();
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                });
            }

            // Order form submission
            const orderForm = document.getElementById('orderForm');
            if (orderForm) {
                orderForm.addEventListener('submit', handleOrderSubmit);
            }

            // Modal close buttons
            document.querySelectorAll('.order-modal-close, .modal-close').forEach(btn => {
                btn.addEventListener('click', closeModal);
            });
        }

        function toggleMobileMenu() {
            const navMenu = document.getElementById('navMenu');
            if (navMenu) {
                navMenu.classList.toggle('active');
            }
        }

        function closeMobileMenu() {
            const navMenu = document.getElementById('navMenu');
            if (navMenu) {
                navMenu.classList.remove('active');
            }
        }

        // === OLD ORDER FUNCTIONS (kept for form submission) ===
        function orderMedicine(medicineName) {
            const orderType = document.getElementById('orderType');
            const orderDetails = document.getElementById('orderDetails');

            if (orderType && orderDetails) {
                orderType.value = 'medicine';
                orderDetails.value = `I would like to order: ${medicineName}`;
                orderDetails.focus();

                // Scroll to contact form
                document.getElementById('contact').scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        }

        // === ORDER FORM SUBMISSION ===
        async function handleOrderSubmit(e) {
            e.preventDefault();

            const name = document.getElementById('customerName').value.trim();
            const phone = document.getElementById('customerPhone').value.trim();
            const email = document.getElementById('customerEmail').value.trim();
            const type = document.getElementById('orderType').value;
            const details = document.getElementById('orderDetails').value.trim();
            const submitBtn = document.getElementById('submitBtn');

            // Validation
            if (!name || !phone || !type) {
                showFormMessage('Please fill all required fields', 'error');
                return;
            }

            // Phone validation
            const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
            if (!phoneRegex.test(phone)) {
                showFormMessage('Please enter a valid phone number', 'error');
                return;
            }

            // Show loading
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
            submitBtn.disabled = true;

            try {
                // 1. FIRST: Send to WhatsApp
                sendFormToWhatsApp(name, phone, email, type, details);

                // 2. THEN: Save to Supabase (optional)
                const { data, error } = await supabaseClient
                    .from('orders')
                    .insert([{
                        customer_name: name,
                        phone: phone,
                        email: email || null,
                        order_type: type,
                        order_details: details,
                        medicine_name: type === 'medicine' ? details : 'Consultation',
                        total_price: 0,
                        payment_method: 'pending',
                        status: 'pending',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    }]);

                if (error) {
                    console.log('Supabase save failed, but WhatsApp sent successfully');
                }

                // Show success message
                showModal(
                    `✅ Your request has been sent to WhatsApp!\n\n` +
                    `<strong>${name}</strong>, check your WhatsApp now.\n` +
                    `If WhatsApp doesn't open automatically:\n` +
                    `1. Open WhatsApp manually\n` +
                    `2. Find "Hakim Abdul Razzaq"\n` +
                    `3. Send your request there\n\n` +
                    `We'll contact you shortly at <strong>${phone}</strong>`
                );

                // Reset form
                e.target.reset();

                // Reset button
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;

            } catch (error) {
                console.error('❌ Error:', error);

                // Even if Supabase fails, WhatsApp was sent
                showModal(
                    `✅ Request sent to WhatsApp!\n\n` +
                    `Thank you <strong>${name}</strong>!\n` +
                    `Please check WhatsApp for confirmation.\n\n` +
                    `For immediate assistance:\n` +
                    `<strong>+92 300 123 4567</strong>`
                );

                // Reset form and button
                e.target.reset();
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        }

        // === SEND FORM DATA TO WHATSAPP ===
        function sendFormToWhatsApp(name, phone, email, type, details) {
            // WhatsApp number (with country code)
            const whatsappNumber = "923013404512";

            // Format service type
            let serviceType = '';
            switch (type) {
                case 'consultation': serviceType = 'Personal Consultation'; break;
                case 'medicine': serviceType = 'Medicine Order'; break;
                case 'both': serviceType = 'Both Consultation & Medicine'; break;
                default: serviceType = type;
            }

            // Create formatted message
            const message =
                `*NEW ORDER REQUEST - HAKIM ABDUL RAZZAQ*%0A` +
                `═══════════════════════════════%0A%0A` +
                `👤 *Customer Information*%0A` +
                `• Name: ${encodeURIComponent(name)}%0A` +
                `• Phone: ${encodeURIComponent(phone)}%0A` +
                `${email ? `• Email: ${encodeURIComponent(email)}%0A` : ''}` +
                `%0A` +
                `📋 *Service Requested*%0A` +
                `• Type: ${encodeURIComponent(serviceType)}%0A` +
                `%0A` +
                `📝 *Details / Symptoms*%0A` +
                `${details ? encodeURIComponent(details) : 'No details provided'}%0A` +
                `%0A` +
                `⏰ *Submitted*: ${new Date().toLocaleString()}%0A` +
                `🌐 *Source*: Website Form%0A` +
                `%0A` +
                `═══════════════════════════════%0A` +
                `*Please contact customer for follow-up*`;

            // Create WhatsApp URL
            const whatsappURL = `https://wa.me/${whatsappNumber}?text=${message}`;

            // Open WhatsApp in new tab
            window.open(whatsappURL, '_blank');

            // Also open in same tab after a delay (for mobile)
            setTimeout(() => {
                window.location.href = whatsappURL;
            }, 1000);
        }

        // === UI UTILITY FUNCTIONS ===
        function showModal(message) {
            const modal = document.getElementById('orderModal');
            const modalMessage = document.getElementById('modalMessage');

            if (modal && modalMessage) {
                modalMessage.innerHTML = message.replace(/\n/g, '<br>');
                modal.style.display = 'flex';
            }
        }

        function closeModal() {
            const modal = document.getElementById('orderModal');
            if (modal) {
                modal.style.display = 'none';
            }
        }

        function showFormMessage(message, type) {
            const messageDiv = document.getElementById('formMessage');
            if (!messageDiv) return;

            messageDiv.textContent = message;
            messageDiv.style.display = 'block';
            messageDiv.style.background = type === 'error' ? '#f8d7da' : '#d4edda';
            messageDiv.style.color = type === 'error' ? '#721c24' : '#155724';
            messageDiv.style.border = type === 'error' ? '1px solid #f5c6cb' : '1px solid #c3e6cb';
            messageDiv.style.padding = '15px';
            messageDiv.style.borderRadius = '8px';
            messageDiv.style.marginBottom = '20px';

            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 5000);
        }

        // === AUTO-REFRESH ===
        // Refresh medicines every 5 minutes
        setInterval(() => {
            if (supabaseClient) {
                console.log('🔄 Auto-refreshing medicines...');
                loadMedicinesFromSupabase();
            }
        }, 300000); // 5 minutes

        // Close modal when clicking outside
        window.addEventListener('click', (e) => {
            const modal = document.getElementById('orderModal');
            if (e.target === modal) {
                closeModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });

        // Listen for Supabase real-time updates
        if (supabaseClient) {
            supabaseClient
                .channel('public:medicines')
                .on('postgres_changes',
                    { event: '*', schema: 'public', table: 'medicines' },
                    () => {
                        console.log('📥 Medicine change detected, refreshing...');
                        setTimeout(() => loadMedicinesFromSupabase(), 2000);
                    }
                )
                .subscribe();
        }

        // === EXPORT FUNCTIONS FOR HTML ===
        // Make functions available globally for onclick attributes
        window.orderMedicine = orderMedicine;
        window.orderMedicineWhatsApp = orderMedicineWhatsApp;
        window.closeModal = closeModal;