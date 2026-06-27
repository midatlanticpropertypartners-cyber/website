document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       STICKY HEADER & ACTIVE LINKS ON SCROLL
       ========================================================================== */
    const header = document.getElementById('site-header');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');

    const handleScroll = () => {
        // Sticky Header Toggle
        if (window.scrollY > 20) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }

        // Active Link Indicator on Scroll
        let currentSectionId = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                currentSectionId = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSectionId}` || 
                (link.getAttribute('href') === '#' && currentSectionId === 'hero')) {
                link.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Trigger initial checks

    /* ==========================================================================
       MOBILE NAVIGATION HAMBURGER MENU
       ========================================================================== */
    const mobileNavToggle = document.getElementById('mobile-nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    mobileNavToggle.addEventListener('click', () => {
        mobileNavToggle.classList.toggle('active');
        navMenu.classList.toggle('active');
        
        // Animated hamburger bar transition
        const bars = mobileNavToggle.querySelectorAll('.bar');
        if (mobileNavToggle.classList.contains('active')) {
            bars[0].style.transform = 'rotate(45deg) translate(5px, 6px)';
            bars[1].style.opacity = '0';
            bars[2].style.transform = 'rotate(-45deg) translate(5px, -6px)';
        } else {
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        }
    });

    // Close menu when links are clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileNavToggle.classList.remove('active');
            navMenu.classList.remove('active');
            const bars = mobileNavToggle.querySelectorAll('.bar');
            bars[0].style.transform = 'none';
            bars[1].style.opacity = '1';
            bars[2].style.transform = 'none';
        });
    });

    /* ==========================================================================
       STATS VIEWPORT COUNTING ANIMATION
       ========================================================================== */
    const statNumbers = document.querySelectorAll('.stat-number');
    let animatedStats = false;

    const animateCounters = () => {
        statNumbers.forEach(stat => {
            const target = parseInt(stat.getAttribute('data-target'), 10);
            let count = 0;
            const duration = 2000; // 2 seconds
            const increment = target / (duration / 16); // ~60fps

            const updateCount = () => {
                count += increment;
                if (count < target) {
                    if (target === 5) {
                        stat.textContent = count.toFixed(1);
                    } else {
                        stat.textContent = Math.floor(count).toLocaleString();
                    }
                    requestAnimationFrame(updateCount);
                } else {
                    if (target === 5) {
                        stat.textContent = target.toFixed(1) + '/5';
                    } else if (target === 82) {
                        stat.textContent = target + '%';
                    } else {
                        stat.textContent = target.toLocaleString() + '+';
                    }
                }
            };
            updateCount();
        });
    };

    const statsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !animatedStats) {
                animateCounters();
                animatedStats = true;
                statsObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 });

    const statsSection = document.getElementById('stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }

    /* ==========================================================================
       INTERACTIVE SERVICES TABS
       ========================================================================== */
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetPanelId = btn.getAttribute('aria-controls');

            // Set buttons active state
            tabButtons.forEach(b => {
                b.classList.remove('active');
                b.setAttribute('aria-selected', 'false');
            });
            btn.classList.add('active');
            btn.setAttribute('aria-selected', 'true');

            // Display active panel
            tabPanels.forEach(panel => {
                if (panel.getAttribute('id') === targetPanelId) {
                    panel.classList.add('active');
                } else {
                    panel.classList.remove('active');
                }
            });
        });
    });

    /* ==========================================================================
       REACTIVE JUNK PRICE ESTIMATOR
       ========================================================================== */
    const calcItems = document.querySelectorAll('.calc-item');
    const volumeSlider = document.getElementById('truck-volume');
    const sliderPercentageVal = document.getElementById('slider-percentage-val');
    const totalEstimatePrice = document.getElementById('total-estimate-price');
    const priceBreakdownText = document.getElementById('price-breakdown-text');
    const truckFillLevel = document.getElementById('truck-fill-level');
    const truckFillText = document.getElementById('truck-fill-text');
    const calcApplyBtn = document.getElementById('calc-apply-btn');

    // Itemized loads setup
    const itemQuantities = {
        couch: 0,
        mattress: 0,
        fridge: 0,
        tv: 0,
        yard: 0,
        table: 0
    };

    // Calculate total price based on items & slider
    const calculatePrice = () => {
        let totalItemsVolume = 0;
        let totalItemsPrice = 0;
        const selectedItemsSummary = [];

        // Sum items
        calcItems.forEach(item => {
            const itemId = item.getAttribute('data-id');
            const qty = itemQuantities[itemId];
            const price = parseInt(item.getAttribute('data-price'), 10);
            const volume = parseInt(item.getAttribute('data-volume'), 10);
            const name = item.querySelector('.item-name').textContent;

            if (qty > 0) {
                totalItemsVolume += volume * qty;
                totalItemsPrice += price * qty;
                selectedItemsSummary.push(`${qty}x ${name}`);
            }
        });

        let finalVolumePercentage = 0;
        let finalPrice = 0;
        let breakdownText = "";

        if (totalItemsVolume > 0) {
            // Volume representation based on total capacity (let's say full truck = 80 volume units)
            const truckCapacityUnits = 60;
            finalVolumePercentage = Math.min(Math.round((totalItemsVolume / truckCapacityUnits) * 100), 100);
            
            // Set slider to reflect current volume percentage without triggering listeners
            volumeSlider.value = finalVolumePercentage;
            sliderPercentageVal.textContent = finalVolumePercentage + '%';
            
            finalPrice = totalItemsPrice;
            breakdownText = selectedItemsSummary.join(', ');
        } else {
            // Calculate strictly by slider value
            const percent = parseInt(volumeSlider.value, 10);
            finalVolumePercentage = percent;
            sliderPercentageVal.textContent = percent + '%';

            // Scale pricing model: $75 minimum loading rate, up to $595 full truck
            if (percent === 0) {
                finalPrice = 0;
                breakdownText = "Select items above to calculate";
            } else if (percent <= 15) {
                finalPrice = 95; // Single Item Rate
                breakdownText = "Single Item Load Estimate";
            } else {
                // Linear pricing scaling from $150 (16% truckload) to $595 (100% truckload)
                const minPrice = 150;
                const maxPrice = 595;
                const ratio = (percent - 16) / (100 - 16);
                finalPrice = Math.round(minPrice + ratio * (maxPrice - minPrice));
                
                if (percent <= 35) breakdownText = "~1/4 Truckload Estimate";
                else if (percent <= 60) breakdownText = "~1/2 Truckload Estimate";
                else if (percent <= 85) breakdownText = "~3/4 Truckload Estimate";
                else breakdownText = "Full Truckload Estimate";
            }
        }

        // Update Price Counter
        totalEstimatePrice.textContent = finalPrice === 0 ? '$0' : `$${finalPrice}`;
        priceBreakdownText.textContent = breakdownText;

        // Update Truck Graphic Fill Width
        truckFillLevel.style.width = `${finalVolumePercentage}%`;

        // Update Truck Graphic Text State
        if (finalVolumePercentage === 0) {
            truckFillText.textContent = "Empty Truck";
        } else if (finalVolumePercentage <= 15) {
            truckFillText.textContent = "Single Item";
        } else if (finalVolumePercentage <= 35) {
            truckFillText.textContent = "1/4 Loaded";
        } else if (finalVolumePercentage <= 65) {
            truckFillText.textContent = "1/2 Loaded";
        } else if (finalVolumePercentage <= 85) {
            truckFillText.textContent = "3/4 Loaded";
        } else {
            truckFillText.textContent = "Fully Loaded";
        }
    };

    // Itemized click listeners
    calcItems.forEach(item => {
        const itemId = item.getAttribute('data-id');
        const qtyVal = item.querySelector('.qty-val');
        const decBtn = item.querySelector('.dec');
        const incBtn = item.querySelector('.inc');

        // Clicking card increments value
        item.addEventListener('click', (e) => {
            // Prevent triggers when clicking quantity change buttons directly
            if (e.target.closest('.quantity-controls')) return;

            itemQuantities[itemId]++;
            qtyVal.textContent = itemQuantities[itemId];
            item.classList.add('selected');
            calculatePrice();
        });

        incBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            itemQuantities[itemId]++;
            qtyVal.textContent = itemQuantities[itemId];
            item.classList.add('selected');
            calculatePrice();
        });

        decBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (itemQuantities[itemId] > 0) {
                itemQuantities[itemId]--;
                qtyVal.textContent = itemQuantities[itemId];
                if (itemQuantities[itemId] === 0) {
                    item.classList.remove('selected');
                }
            }
            calculatePrice();
        });
    });

    // Slider slide listener
    volumeSlider.addEventListener('input', () => {
        // Reset item quantities if slider is dragged manually to represent bulk loading
        calcItems.forEach(item => {
            const itemId = item.getAttribute('data-id');
            itemQuantities[itemId] = 0;
            item.querySelector('.qty-val').textContent = 0;
            item.classList.remove('selected');
        });
        calculatePrice();
    });

    // Apply Quote Estimate to Contact Booking Form
    calcApplyBtn.addEventListener('click', () => {
        const price = totalEstimatePrice.textContent;
        const details = priceBreakdownText.textContent;
        
        if (price === '$0') {
            alert('Please select items or adjust the truck volume to generate a price estimate first!');
            return;
        }

        const detailsTextarea = document.getElementById('form-details');
        const selectService = document.getElementById('form-service');

        selectService.value = 'residential'; // Default to residential
        detailsTextarea.value = `Estimated Quote: ${price}\nScope of Work: ${details}\n\nList of items: `;
        
        // Scroll smoothly to contact form
        const contactSection = document.getElementById('contact');
        window.scrollTo({
            top: contactSection.offsetTop - 80,
            behavior: 'smooth'
        });
        
        // Visual focus highlight effect on contact form text area
        setTimeout(() => {
            detailsTextarea.focus();
        }, 800);
    });

    /* ==========================================================================
       ACCORDION TOGGLES FOR FAQ SECTION
       ========================================================================== */
    const accordionTriggers = document.querySelectorAll('.accordion-trigger');

    accordionTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const parent = trigger.parentElement;
            const isOpen = parent.classList.contains('active');

            // Close all items
            document.querySelectorAll('.accordion-item').forEach(item => {
                item.classList.remove('active');
                item.querySelector('.accordion-trigger').setAttribute('aria-expanded', 'false');
            });

            // If it wasn't open, open it
            if (!isOpen) {
                parent.classList.add('active');
                trigger.setAttribute('aria-expanded', 'true');
            }
        });
    });

    /* ==========================================================================
       CONTACT FORM UPLOAD FILE PREVIEW
       ========================================================================== */
    const fileInput = document.getElementById('form-file');
    const uploadZone = document.getElementById('file-upload-zone');
    const previewContainer = document.getElementById('file-preview-container');
    const previewImg = document.getElementById('file-preview-img');
    const fileNameText = document.getElementById('file-name-text');
    const removeFileBtn = document.getElementById('remove-file-btn');
    const uploadContent = uploadZone.querySelector('.upload-content');

    const showFilePreview = (file) => {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                previewImg.src = e.target.result;
                fileNameText.textContent = file.name;
                
                // Toggle display overlays
                uploadContent.style.display = 'none';
                previewContainer.style.display = 'flex';
            };
            reader.readAsDataURL(file);
        }
    };

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        showFilePreview(file);
    });

    // Drag-and-drop mechanics
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--primary)';
            uploadZone.style.backgroundColor = 'var(--primary-light)';
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--border-color)';
            uploadZone.style.backgroundColor = 'var(--bg-light)';
        }, false);
    });

    uploadZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const file = dt.files[0];
        
        fileInput.files = dt.files;
        showFilePreview(file);
    });

    // Remove file selection
    removeFileBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        fileInput.value = '';
        previewImg.src = '';
        fileNameText.textContent = '';
        
        uploadContent.style.display = 'block';
        previewContainer.style.display = 'none';
    });

    /* ==========================================================================
       CONTACT FORM VALIDATION & SIMULATION
       ========================================================================== */
    const quoteForm = document.getElementById('quote-form');
    const submitBtn = document.getElementById('form-submit-btn');
    const loader = document.getElementById('form-loader');
    const feedbackError = document.getElementById('form-feedback-error');
    const feedbackSuccess = document.getElementById('form-feedback-success');

    // Validation patterns
    const validateEmail = (email) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    };

    const validatePhone = (phone) => {
        // Strip non-digits and verify digit count
        const cleanPhone = phone.replace(/\D/g, '');
        return cleanPhone.length >= 10;
    };

    const validateField = (input, errorSpanId, validationFn) => {
        const value = input.value.trim();
        const isValid = validationFn ? validationFn(value) : value !== '';
        const parent = input.closest('.form-group');

        if (!isValid) {
            parent.classList.add('invalid');
            return false;
        } else {
            parent.classList.remove('invalid');
            return true;
        }
    };

    // Remove validation warning classes on focus/input
    const textInputs = quoteForm.querySelectorAll('input, textarea');
    textInputs.forEach(input => {
        input.addEventListener('input', () => {
            input.closest('.form-group').classList.remove('invalid');
            feedbackError.style.display = 'none';
        });
    });

    quoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Fetch inputs
        const nameInput = document.getElementById('form-name');
        const phoneInput = document.getElementById('form-phone');
        const emailInput = document.getElementById('form-email');
        const addressInput = document.getElementById('form-address');
        const detailsInput = document.getElementById('form-details');

        // Validate all
        const isNameValid = validateField(nameInput, 'error-name');
        const isPhoneValid = validateField(phoneInput, 'error-phone', validatePhone);
        const isEmailValid = validateField(emailInput, 'error-email', validateEmail);
        const isAddressValid = validateField(addressInput, 'error-address');
        const isDetailsValid = validateField(detailsInput, 'error-details');

        if (!isNameValid || !isPhoneValid || !isEmailValid || !isAddressValid || !isDetailsValid) {
            feedbackError.style.display = 'flex';
            feedbackError.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            return;
        }

        // If form checks out, simulate submission loader
        feedbackError.style.display = 'none';
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        // Mocking API delay
        setTimeout(() => {
            // Hide submit button loader & reset states
            submitBtn.classList.remove('loading');
            
            // Hide form inputs and elements to show nice success block
            quoteForm.querySelectorAll('.form-row, .form-group').forEach(el => {
                el.style.display = 'none';
            });
            submitBtn.style.display = 'none';
            
            // Display success details
            feedbackSuccess.style.display = 'flex';
            feedbackSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 1800);
    });
});
