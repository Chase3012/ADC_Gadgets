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

            const cardHTML = `
                <a href="devices.html" class="p-card scroll-reveal" data-soc="${soc}" data-original-price="₱${formattedSrp}" style="${cardStyle}">
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

// Global spec data for the modals
window.specsData = {
    "iPhone 16": { display: "6.9-inch display with ProMotion up to 120Hz.", camera: "48MP main camera with advanced ultra-wide.", chip: "A18 Pro chip. Built for next-gen processing.", battery: "Up to 33 hours video playback." },
    "iPhone 15": { display: "6.1-inch display with ProMotion.", camera: "48MP main camera and optical zoom.", chip: "A16 Bionic Chip.", battery: "Up to 31 hours video playback." },
    "iPhone 14": { display: "6.1-inch Super Retina XDR.", camera: "Advanced dual-camera system.", chip: "A15 Bionic chip.", battery: "Up to 26 hours video playback." },
    "iPhone 13": { display: "6.1-inch Super Retina XDR.", camera: "Dual 12MP camera system.", chip: "A15 Bionic chip.", battery: "Up to 19 hours video playback." },
    "iPhone 12": { display: "6.1-inch Super Retina XDR.", camera: "Dual 12MP camera system.", chip: "A14 Bionic chip.", battery: "Up to 17 hours video playback." },
    "iPhone 11": { display: "6.1-inch Liquid Retina HD.", camera: "Dual 12MP Ultra Wide and Wide.", chip: "A13 Bionic chip.", battery: "Up to 17 hours video playback." },
    "iPhone SE": { display: "4.7-inch Retina HD.", camera: "Single 12MP camera.", chip: "A13 Bionic chip.", battery: "Up to 13 hours video playback." },
    "iPhone XR": { display: "6.1-inch Liquid Retina HD.", camera: "Single 12MP camera.", chip: "A12 Bionic chip.", battery: "Up to 16 hours video playback." },
    "iPhone XS": { display: "5.8-inch Super Retina HD.", camera: "Dual 12MP camera system.", chip: "A12 Bionic chip.", battery: "Up to 14 hours video playback." },
    "iPhone X": { display: "5.8-inch Super Retina HD.", camera: "Dual 12MP cameras.", chip: "A11 Bionic chip.", battery: "Up to 13 hours video playback." },
    "iPhone 8": { display: "4.7-inch Retina HD.", camera: "Single 12MP camera.", chip: "A11 Bionic chip.", battery: "Up to 13 hours video playback." },
    "iPhone 7": { display: "4.7-inch Retina HD.", camera: "Single 12MP camera.", chip: "A10 Fusion chip.", battery: "Up to 13 hours video playback." }
};

// Ensure modal event delegation
document.addEventListener('DOMContentLoaded', () => {
    document.body.addEventListener('click', (e) => {
        const card = e.target.closest('.p-card');
        if (card) {
            e.preventDefault();
            const pmOverlay = document.getElementById('pm-overlay');
            if (!pmOverlay) return; // In case page doesn't have modal

            const titleText = card.querySelector('.p-title').textContent;
            
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

            if (specsData[titleText]) {
                if(mSpecDisplay) mSpecDisplay.textContent = specsData[titleText].display;
                if(mSpecCamera) mSpecCamera.textContent = specsData[titleText].camera;

                const dynamicSoc = card.getAttribute('data-soc');
                let chipDesc = "Powerful performance and highly efficient.";
                if (dynamicSoc) {
                    if (dynamicSoc.includes('A19')) chipDesc = "Next-generation architecture built for advanced processing.";
                    else if (dynamicSoc.includes('A18')) chipDesc = "Custom-built for incredible speed and next-level intelligence.";
                    else if (dynamicSoc.includes('A17')) chipDesc = "A monumental leap in graphics performance.";
                    else if (dynamicSoc.includes('A16')) chipDesc = "Proven performance with amazing efficiency.";
                    else if (dynamicSoc.includes('A15')) chipDesc = "Delivers fast performance and powers advanced features.";
                    else if (dynamicSoc.includes('A14')) chipDesc = "Great power and battery life balance.";
                }
                
                if(mSpecChip) mSpecChip.textContent = `${dynamicSoc} Chip. ${chipDesc}`;
                if(mSpecBattery) mSpecBattery.textContent = specsData[titleText].battery;
            } else {
                // Fallback for unknown models
                if(mSpecDisplay) mSpecDisplay.textContent = "High-quality Retina display.";
                if(mSpecCamera) mSpecCamera.textContent = "Advanced camera system.";
                const dynamicSoc = card.getAttribute('data-soc');
                if(mSpecChip) mSpecChip.textContent = `${dynamicSoc || 'Apple'} Chip. Powerful and efficient.`;
                if(mSpecBattery) mSpecBattery.textContent = "All-day battery life.";
            }

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
