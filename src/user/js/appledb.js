// src/user/js/appledb.js

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

window.loadAppleDBDevices = async function(gridSelector, hideOutOfStock = false, statusFilter = 'available') {
    const grid = document.querySelector(gridSelector);
    if (!grid) return;

    grid.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--g500); width: 100%; grid-column: 1/-1;">Loading devices...</p>';
    
    try {
        const res = await fetch('/api/devices');
        if (!res.ok) throw new Error("Failed to fetch devices from database");
        const dbDevices = await res.json();
        window._loadedDevices = dbDevices;
        
        // Fetch SOC from appledb if appledb_id is present
        const fetchPromises = dbDevices.map(device => {
            if (!device.appledb_id) return Promise.resolve(null);
            return fetch(`https://api.appledb.dev/device/${device.appledb_id}.json`)
                .then(r => r.ok ? r.json() : null)
                .catch(() => null);
        });
        
        const appledbData = await Promise.all(fetchPromises);
        
        grid.innerHTML = '';
        
        let count = 0;
        
        dbDevices.forEach((device, index) => {
            if (statusFilter && device.status !== statusFilter) return;
            const isOutOfStock = parseInt(device.stock || 0, 10) <= 0;
            if (hideOutOfStock && isOutOfStock && device.status !== 'upcoming') return; 

            const adb = appledbData[index];
            const soc = adb && adb.soc ? adb.soc : "Apple";
            const isNew = index === 0;
            
            // Format price with commas
            const calculatedMonthly = Math.ceil(parseFloat(device.srp) / 24);
            const formattedMonthly = calculatedMonthly.toLocaleString('en-PH');
            const formattedSrp = parseFloat(device.srp).toLocaleString('en-PH');
            
            // Out of stock styles
            let badgeText = isOutOfStock ? 'Out of Stock' : (isNew ? 'New' : 'Available');
            let badgeStyle = isOutOfStock 
                ? 'background:rgba(239,68,68,0.1);color:#ef4444;border:none;' 
                : (isNew ? 'background:var(--primary);color:#fff;border:none;' : 'background:rgba(0,0,0,0.06);color:var(--g500);border:none;');
                
            if (device.status === 'upcoming') {
                badgeText = 'Coming Soon';
                badgeStyle = 'background:var(--yellow);color:var(--black);border:none;';
            }
                
            const cardStyle = isOutOfStock ? 'opacity: 0.65; filter: grayscale(80%); pointer-events: none;' : '';
            const btnText = isOutOfStock ? 'Sold Out' : 'View';
            
            const imgPath = device.image && device.image.includes('/') ? device.image : `../../images/phones/${device.image}`;

            const specsAttr = device.specs ? JSON.stringify(device.specs).replace(/"/g, '&quot;') : '';
            const cardHTML = `
                <a href="devices.html" class="p-card scroll-reveal" data-device-id="${device.id}" data-appledb-id="${device.appledb_id || ''}" data-soc="${soc}" data-specs="${specsAttr}" data-original-price="₱${formattedSrp}" style="${cardStyle}">
                    <span class="p-badge" style="z-index: 10; ${badgeStyle}">${badgeText}</span>
                    <div class="p-img-wrap">
                        <img src="${imgPath}" alt="${device.name}" class="p-img">
                    </div>
                    <div class="p-info">
                        <h3 class="p-title">${device.name}</h3>
                        <p class="p-specs">${soc} Chip · ${device.storage}</p>
                        <div class="p-foot">
                            <div>
                                <p class="p-price-label">${device.status === 'upcoming' ? 'Estimated From' : 'From'}</p>
                                <p class="p-price">₱ ${formattedMonthly}/mo</p>
                            </div>
                            <button class="btn-buy" aria-label="View Details" ${isOutOfStock ? 'disabled style="background:var(--g300);"' : ''}>${btnText}</button>
                        </div>
                    </div>
                </a>
            `;
            grid.insertAdjacentHTML('beforeend', cardHTML);
            count++;
        });
        
        if (count === 0) {
            grid.innerHTML = `
                <div style="grid-column: 1/-1; display: flex; align-items: center; justify-content: center; padding: 40px 20px; width: 100%;">
                    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; border-radius: 16px; border: 2px dashed var(--g200); padding: 48px; text-align: center; width: 100%; max-width: 500px; background: rgba(255,255,255,0.4);">
                        <div style="display: flex; flex-direction: column; align-items: center;">
                            <div style="position: relative; margin-bottom: 24px;">
                                <div style="display: flex; width: 48px; height: 48px; align-items: center; justify-content: center; border-radius: 10px; border: 1px solid var(--g200); background: var(--white); box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
                                    <i data-lucide="tag" style="width: 24px; height: 24px; color: var(--pink);"></i>
                                </div>
                            </div>
                            <h2 style="font-size: 28px; font-weight: 800; font-family: 'Outfit', sans-serif; letter-spacing: -0.02em; margin-bottom: 8px; background: linear-gradient(to right, var(--black), #3b82f6); -webkit-background-clip: text; -webkit-text-fill-color: transparent;">No products found</h2>
                            <p style="color: var(--g500); font-size: 15px; max-width: 300px; line-height: 1.5;">No products match your search criteria.</p>
                        </div>
                        <div style="display: flex; flex-direction: column; align-items: center; gap: 16px;">
                            <button class="btn-buy" onclick="window.location.href='devices.html'" style="display: flex; align-items: center; gap: 8px; padding: 10px 24px; font-size: 14px;">
                                <i data-lucide="tag" style="width: 16px; height: 16px;"></i> Browse products
                            </button>
                        </div>
                    </div>
                </div>
            `;
            if (window.lucide) window.lucide.createIcons();
        }
        
        // Update tab counts if elements exist
        if (statusFilter === 'available') {
            const availCount = document.querySelector('#tab-available .tab-count');
            if (availCount) availCount.textContent = count;
        } else if (statusFilter === 'upcoming') {
            const upCount = document.querySelector('#tab-upcoming .tab-count');
            if (upCount) upCount.textContent = count;
        }
        
        document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    } catch (err) {
        console.error(err);
        grid.innerHTML = '<p style="text-align: center; color: red; width: 100%; grid-column: 1/-1;">Failed to load devices.</p>';
    }
};

// Ensure modal event delegation
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (e) => {
        const card = e.target.closest('.p-card');
        if (card) {
            e.preventDefault();
            const pmOverlay = document.getElementById('pm-overlay');
            if (!pmOverlay) return; // In case page doesn't have modal

            const titleText = card.querySelector('.p-title').textContent.trim();
            const dynamicSoc = card.getAttribute('data-soc');
            const appledbId = card.getAttribute('data-appledb-id');

            let deviceSpecs = null;
            try {
                const raw = card.getAttribute('data-specs');
                if (raw) deviceSpecs = JSON.parse(raw);
            } catch(e) {}

            if (!deviceSpecs && window._loadedDevices) {
                const found = window._loadedDevices.find(d => d.name === titleText || d.id === card.getAttribute('data-device-id'));
                if (found && found.specs) deviceSpecs = found.specs;
            }

            // Resolve authentic specifications through AppleSpecsEngine
            const specs = window.getAppleSpecs 
                ? window.getAppleSpecs(titleText, appledbId, dynamicSoc, deviceSpecs)
                : {
                    display: "Super Retina XDR OLED display with incredible clarity and color.",
                    camera: "Advanced camera system with 4K recording and Smart HDR.",
                    chip: `${dynamicSoc || 'Apple'} Chip. High-performance processing.`,
                    battery: "All-day battery life."
                };

            const mTitle = document.getElementById('m-title');
            const mPrice = document.getElementById('m-price');
            const mImg = document.getElementById('m-img');
            const mSpecDisplay = document.getElementById('m-spec-display');
            const mSpecCamera = document.getElementById('m-spec-camera');
            const mSpecChip = document.getElementById('m-spec-chip');
            const mSpecBattery = document.getElementById('m-spec-battery');

            if(mTitle) mTitle.textContent = titleText;
            if(mPrice) mPrice.textContent = card.querySelector('.p-price').textContent;
            if(mImg) mImg.src = card.querySelector('.p-img').src;

            // Fetch original price from card data attribute
            if (mPrice) {
                let mOriginalPrice = document.getElementById('m-original-price');
                if (!mOriginalPrice) {
                    mOriginalPrice = document.createElement('p');
                    mOriginalPrice.id = 'm-original-price';
                    mOriginalPrice.style.fontSize = '14px';
                    mOriginalPrice.style.color = '#64748b'; // slate-500
                    mOriginalPrice.style.marginTop = '4px';
                    mPrice.parentNode.insertBefore(mOriginalPrice, mPrice.nextSibling);
                }
                const ogPrice = card.getAttribute('data-original-price');
                mOriginalPrice.textContent = `SRP: ${ogPrice}`;
            }

            if(mSpecDisplay) mSpecDisplay.textContent = specs.display;
            if(mSpecCamera) mSpecCamera.textContent = specs.camera;
            if(mSpecChip) mSpecChip.textContent = specs.chip;
            if(mSpecBattery) mSpecBattery.textContent = specs.battery;

            // Setup Loan button link with dynamic params
            const btnApplyLoan = document.getElementById('btn-apply-loan');
            if (btnApplyLoan) {
                const urlParams = new URLSearchParams();
                urlParams.set('model', titleText);
                urlParams.set('price', card.querySelector('.p-price').textContent.replace('₱', '').replace('/mo', '').trim());
                urlParams.set('img', card.querySelector('.p-img').src);
                btnApplyLoan.href = `loan.html?${urlParams.toString()}`;
            }

            // Show Modal
            pmOverlay.style.display = 'flex';
            setTimeout(() => {
                pmOverlay.classList.add('open');
            }, 10);
        }
    });

    // Close modal logic
    const pmClose = document.getElementById('pm-close');
    const pmOverlay = document.getElementById('pm-overlay');
    if (pmClose && pmOverlay) {
        pmClose.addEventListener('click', () => {
            pmOverlay.classList.remove('open');
            setTimeout(() => {
                pmOverlay.style.display = 'none';
            }, 300); // match CSS transition duration
        });
    }
});
