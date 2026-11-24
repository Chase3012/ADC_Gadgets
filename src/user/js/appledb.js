// src/user/js/appledb.js

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

// Resolves authentic Apple Database (AppleDB) studio image
window.getAppleDBDeviceImage = function(deviceName, originalImg) {
    // 1. If originalImg already specifies an appledb local file or full URL, return it with proper relative path
    if (originalImg) {
        if (originalImg.startsWith('http://') || originalImg.startsWith('https://')) {
            return originalImg;
        }
        if (originalImg.includes('appledb/')) {
            const basename = originalImg.split('/').pop();
            return `../../images/phones/appledb/${basename}`;
        }
    }

    const name = (deviceName || '').trim().toLowerCase();

    // Map each model to its authentic AppleDB studio image
    if (name.includes('18')) return '../../images/phones/appledb/iphone_18_pro.png';
    if (name.includes('air')) return '../../images/phones/appledb/iphone_air.png';
    if (name.includes('17')) return '../../images/phones/appledb/iphone_17.png';
    if (name.includes('16')) return '../../images/phones/appledb/iphone_16.png';
    if (name.includes('15')) return '../../images/phones/appledb/iphone_15.png';
    if (name.includes('14')) return '../../images/phones/appledb/iphone_14.png';
    if (name.includes('13')) return '../../images/phones/appledb/iphone_13.png';
    if (name.includes('12')) return '../../images/phones/appledb/iphone_12.png';
    if (name.includes('se')) return '../../images/phones/appledb/iphone_se.png';
    if (name.includes('xr')) return '../../images/phones/appledb/iphone_xr.png';
    if (name.includes('xs')) return '../../images/phones/appledb/iphone_xs.png';
    if (name.includes('x')) return '../../images/phones/appledb/iphone_x.png';
    if (name.includes('8')) return '../../images/phones/appledb/iphone_8.png';
    if (name.includes('7')) return '../../images/phones/appledb/iphone_7.png';
    if (name.includes('11')) return '../../images/phones/appledb/iphone_11.png';

    // Default to iPhone 16 Ultramarine
    return '../../images/phones/appledb/iphone_16.png';
};
// Backwards compatibility alias
window.getFrontBackDeviceImage = window.getAppleDBDeviceImage;

window.renderDeviceSkeletons = function(count = 6) {
    return Array.from({ length: count }, () => `
        <div class="p-card-skeleton" aria-hidden="true">
            <span class="sk sk-badge"></span>
            <div class="sk-img-box"><span class="sk sk-phone"></span></div>
            <span class="sk sk-title"></span>
            <span class="sk sk-spec"></span>
            <div class="sk-foot">
                <div>
                    <span class="sk sk-price-lbl"></span>
                    <span class="sk sk-price"></span>
                </div>
                <span class="sk sk-btn"></span>
            </div>
        </div>
    `).join('');
};

window.loadAppleDBDevices = async function(gridSelector, hideOutOfStock = false, statusFilter = 'available') {
    const grid = document.querySelector(gridSelector);
    if (!grid) return;

    grid.innerHTML = window.renderDeviceSkeletons(hideOutOfStock ? 5 : 8);
    
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
                ? 'background:rgba(239,68,68,0.1);color:#dc2626;border:none;' 
                : (isNew ? 'background:#be185d;color:#fff;border:none;' : 'background:rgba(0,0,0,0.06);color:var(--g500);border:none;');
                
            if (device.status === 'upcoming') {
                badgeText = 'Coming Soon';
                badgeStyle = 'background:var(--yellow);color:var(--black);border:none;';
            }
                
            const cardStyle = isOutOfStock ? 'opacity: 0.65; filter: grayscale(80%); pointer-events: none;' : '';
            const btnText = isOutOfStock ? 'Sold Out' : 'View';
            
            // Official Apple Database Studio Render
            const imgPath = window.getAppleDBDeviceImage(device.name, device.image);

            const specsAttr = device.specs ? JSON.stringify(device.specs).replace(/"/g, '&quot;') : '';
            const cardHTML = `
                <a href="devices.html" class="p-card scroll-reveal sk-reveal" data-device-id="${device.id}" data-appledb-id="${device.appledb_id || ''}" data-soc="${soc}" data-specs="${specsAttr}" data-srp="${parseFloat(device.srp) || 0}" data-original-price="₱${formattedSrp}" style="${cardStyle}">
                    <span class="p-badge" style="z-index: 10; ${badgeStyle}">${badgeText}</span>
                    <div class="p-img-wrap">
                        <img src="${imgPath}" alt="${device.name} Official Studio Render" class="p-img" loading="lazy">
                    </div>
                    <div class="p-info">
                        <h3 class="p-title">${device.name}</h3>
                        <p class="p-specs">${soc} Chip · ${device.storage}</p>
                        <div class="p-foot">
                            <div>
                                <p class="p-price-label">${device.status === 'upcoming' ? 'Estimated From' : 'From'}</p>
                                <p class="p-price num-tabular">₱ ${formattedMonthly}/mo</p>
                            </div>
                            <span class="btn-buy" ${isOutOfStock ? 'aria-disabled="true" style="background:#9ca3af; color:#111111;"' : ''}>${btnText}</span>
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
                            <h2 style="font-size: 28px; font-weight: 800; font-family: 'Outfit', sans-serif; letter-spacing: -0.02em; margin-bottom: 8px; color: var(--black);">No products found</h2>
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
        grid.innerHTML = `
            <div style="text-align:center; width:100%; grid-column:1/-1; padding:32px 16px;">
                <p style="color:#dc2626; font-weight:600; margin-bottom:12px;">Failed to load devices.</p>
                <button type="button" class="btn-buy" onclick="window.loadAppleDBDevices('${gridSelector}', ${hideOutOfStock}, ${statusFilter ? `'${statusFilter}'` : 'null'})">Retry</button>
            </div>
        `;
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
            
            // Set authentic Apple Database studio image in modal
            const cardImg = card.querySelector('.p-img');
            const studioImg = cardImg ? cardImg.src : window.getAppleDBDeviceImage(titleText);
            if(mImg) {
                mImg.src = studioImg;
                mImg.alt = `${titleText} Official Apple Studio View`;
            }

            // Fetch original price from card data attribute + build interactive 6/12/18/24 month selector
            const btnApplyLoan = document.getElementById('btn-apply-loan');
            const ogPriceRaw = card.getAttribute('data-original-price') || '';
            const numericSrp = parseFloat(card.getAttribute('data-srp') || ogPriceRaw.replace(/[^\d.]/g, '')) || 0;

            if (mPrice) {
                let mOriginalPrice = document.getElementById('m-original-price');
                if (!mOriginalPrice) {
                    mOriginalPrice = document.createElement('p');
                    mOriginalPrice.id = 'm-original-price';
                    mOriginalPrice.className = 'num-tabular';
                    mOriginalPrice.style.fontSize = '14px';
                    mOriginalPrice.style.color = 'var(--g500)';
                    mOriginalPrice.style.marginTop = '4px';
                    mPrice.parentNode.insertBefore(mOriginalPrice, mPrice.nextSibling);
                }
                mOriginalPrice.textContent = ogPriceRaw ? `SRP: ${ogPriceRaw}` : '';

                let termWrap = document.getElementById('pm-term-selector');
                if (!termWrap) {
                    termWrap = document.createElement('div');
                    termWrap.id = 'pm-term-selector';
                    termWrap.className = 'pm-term-selector';
                    termWrap.setAttribute('role', 'group');
                    termWrap.setAttribute('aria-label', 'Installment term preview');
                    mOriginalPrice.parentNode.insertBefore(termWrap, mOriginalPrice.nextSibling);
                }

                if (numericSrp > 0) {
                    const terms = [6, 12, 18, 24];
                    const defaultTerm = 24;
                    termWrap.innerHTML = `
                        <span class="pm-term-label">Installment preview</span>
                        <div class="pm-term-pills">
                            ${terms.map(t => `<button type="button" class="pm-term-pill${t === defaultTerm ? ' active' : ''}" data-term="${t}">${t} mo</button>`).join('')}
                        </div>
                    `;
                    termWrap.style.display = 'flex';

                    const updatePreviewTerm = (termMonths) => {
                        const monthlyEst = Math.ceil(numericSrp / termMonths);
                        const formattedEst = `₱ ${monthlyEst.toLocaleString('en-PH')}/mo`;
                        mPrice.textContent = `${formattedEst} (${termMonths} mos)`;
                        mPrice.classList.add('num-tabular');
                        if (btnApplyLoan) {
                            btnApplyLoan.dataset.monthly = formattedEst;
                            btnApplyLoan.dataset.term = String(termMonths);
                        }
                        termWrap.querySelectorAll('.pm-term-pill').forEach(p => {
                            p.classList.toggle('active', Number(p.dataset.term) === termMonths);
                        });
                    };

                    updatePreviewTerm(defaultTerm);
                    termWrap.querySelectorAll('.pm-term-pill').forEach(pill => {
                        pill.addEventListener('click', () => updatePreviewTerm(Number(pill.dataset.term)));
                    });
                } else {
                    termWrap.style.display = 'none';
                }
            }

            if(mSpecDisplay) mSpecDisplay.textContent = specs.display;
            if(mSpecCamera) mSpecCamera.textContent = specs.camera;
            if(mSpecChip) mSpecChip.textContent = specs.chip;
            if(mSpecBattery) mSpecBattery.textContent = specs.battery;

            // Setup Guided Concierge action for Support Chat loan inquiries
            if (btnApplyLoan) {
                const monthlyLabel = card.querySelector('.p-price') ? card.querySelector('.p-price').textContent.trim() : '';
                const srpLabel = ogPriceRaw;
                const statusBadge = card.querySelector('.p-badge') ? card.querySelector('.p-badge').textContent.trim().toLowerCase() : '';
                const isOutOfStock = statusBadge.includes('out of stock');

                btnApplyLoan.dataset.model = titleText;
                if (!btnApplyLoan.dataset.monthly) btnApplyLoan.dataset.monthly = monthlyLabel;
                if (!btnApplyLoan.dataset.term) btnApplyLoan.dataset.term = '24';
                btnApplyLoan.dataset.srp = srpLabel;
                btnApplyLoan.dataset.outOfStock = isOutOfStock ? '1' : '0';

                if (btnApplyLoan.tagName === 'BUTTON' || btnApplyLoan.tagName === 'A') {
                    btnApplyLoan.innerHTML = isOutOfStock
                        ? '<i data-lucide="message-square"></i> Inquire Restock via Chat'
                        : '<i data-lucide="message-square"></i> Apply via Support Chat';
                }

                if (!btnApplyLoan.dataset.conciergeBound) {
                    btnApplyLoan.dataset.conciergeBound = 'true';
                    btnApplyLoan.addEventListener('click', async (evt) => {
                        evt.preventDefault();
                        const model = btnApplyLoan.dataset.model || 'this device';
                        const monthly = btnApplyLoan.dataset.monthly || '';
                        const term = btnApplyLoan.dataset.term || '24';
                        const srp = btnApplyLoan.dataset.srp || '';
                        const outOfStock = btnApplyLoan.dataset.outOfStock === '1';

                        const pmOverlayEl = document.getElementById('pm-overlay');
                        if (pmOverlayEl) {
                            pmOverlayEl.classList.remove('open');
                            setTimeout(() => { pmOverlayEl.style.display = 'none'; }, 250);
                        }

                        const promptText = outOfStock
                            ? `Hi! Is the ${model}${srp ? ` (SRP ${srp})` : ''} scheduled for restock soon? I'd like to inquire about pre-approval.`
                            : `Hi! I want to apply for a ${term}-month loan on the ${model}${srp ? ` (SRP ${srp})` : ''}${monthly ? ` (~${monthly})` : ''}. Could you guide me through the requirements and exact plan options?`;

                        if (typeof window.openSupportChatWithPrompt === 'function') {
                            await window.openSupportChatWithPrompt(promptText);
                        } else {
                            const fabBtn = document.getElementById('fab-chat-btn');
                            if (fabBtn) fabBtn.click();
                        }
                    });
                }
            }

            // Refresh Lucide icons for modal controls
            if (window.lucide) {
                window.lucide.createIcons();
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
    function closeModal() {
        if (!pmOverlay) return;
        pmOverlay.classList.remove('open');
        setTimeout(() => {
            pmOverlay.style.display = 'none';
        }, 300); // match CSS transition duration
    }

    if (pmClose && pmOverlay) {
        pmClose.addEventListener('click', closeModal);
        pmOverlay.addEventListener('click', (e) => {
            if (e.target === pmOverlay) closeModal();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && pmOverlay.classList.contains('open')) {
                closeModal();
            }
        });
    }
});
