// src/user/js/appledb.js

const TARGET_MODELS = [
    { id: "iPhone17,3", image: "Iphone_16.png", price: "₱ 2,350/mo", originalPrice: "₱54,990", fallbackName: "iPhone 16", storage: "256 GB" },
    { id: "iPhone15,4", image: "Iphone_15.png", price: "₱ 2,000/mo", originalPrice: "₱49,990", fallbackName: "iPhone 15", storage: "256 GB" },
    { id: "iPhone14,7", image: "14.png", price: "₱ 1,700/mo", originalPrice: "₱43,990", fallbackName: "iPhone 14", storage: "256 GB" },
    { id: "iPhone14,5", image: "Iphone_13.png", price: "₱ 1,450/mo", originalPrice: "₱36,990", fallbackName: "iPhone 13", storage: "128 GB" },
    { id: "iPhone13,2", image: "Iphone_12.png", price: "₱ 1,200/mo", originalPrice: "₱29,990", fallbackName: "iPhone 12", storage: "128 GB" },
    { id: "iPhone12,1", image: "Iphone_11.png", price: "₱ 950/mo", originalPrice: "₱24,990", fallbackName: "iPhone 11", storage: "64 GB" },
    { id: "iPhone12,8", image: "Iphone_SE.png", price: "₱ 800/mo", originalPrice: "₱28,990", fallbackName: "iPhone SE", storage: "64 GB" },
    { id: "iPhone11,8", image: "Iphone_XR.png", price: "₱ 780/mo", originalPrice: "₱21,990", fallbackName: "iPhone XR", storage: "64 GB" },
    { id: "iPhone11,2", image: "Iphone_XS.png", price: "₱ 850/mo", originalPrice: "₱25,990", fallbackName: "iPhone XS", storage: "64 GB" },
    { id: "iPhone10,6", image: "Iphone_X.png", price: "₱ 750/mo", originalPrice: "₱19,990", fallbackName: "iPhone X", storage: "64 GB" },
    { id: "iPhone10,1", image: "Iphone_8.png", price: "₱ 650/mo", originalPrice: "₱15,990", fallbackName: "iPhone 8", storage: "64 GB" },
    { id: "iPhone9,1", image: "Iphone_7.png", price: "₱ 500/mo", originalPrice: "₱12,990", fallbackName: "iPhone 7", storage: "32 GB" }
];

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
        }
    });
}, { threshold: 0.1 });

window.loadAppleDBDevices = async function(gridSelector) {
    const grid = document.querySelector(gridSelector);
    if (!grid) return;

    const cacheKey = 'adc_appledb_devices_cached';
    let results = null;
    if (sessionStorage.getItem(cacheKey)) {
        try { results = JSON.parse(sessionStorage.getItem(cacheKey)); } catch(e) {}
    }

    if (!results) {
        grid.innerHTML = '<p style="text-align: center; padding: 40px; color: var(--g500); width: 100%; grid-column: 1/-1;">Loading devices from AppleDB...</p>';
        try {
            const fetchPromises = TARGET_MODELS.map(model =>
                fetch(`https://api.appledb.dev/device/${model.id}.json`)
                    .then(res => {
                        if (!res.ok) throw new Error("HTTP " + res.status);
                        return res.json();
                    })
                    .catch(err => {
                        console.error("Failed to fetch", model.id, err);
                        return null;
                    })
            );
            const fetched = await Promise.all(fetchPromises);
            // We only need name and soc from the API. Map to smaller objects to avoid caching MBs of JSON.
            results = fetched.map(data => {
                if (!data) return null;
                return { name: data.name, soc: data.soc };
            });
            sessionStorage.setItem(cacheKey, JSON.stringify(results));
        } catch (err) {
            console.error(err);
            grid.innerHTML = '<p style="text-align: center; color: red; width: 100%; grid-column: 1/-1;">Failed to load devices.</p>';
            return;
        }
    }

    grid.innerHTML = '';

    try {
        results.forEach((data, index) => {
            const local = TARGET_MODELS[index];
            let name = data && data.name ? data.name : local.fallbackName;
            name = name.replace(/\s*\([^)]*\)/g, '').trim();
            const soc = data && data.soc ? data.soc : "Unknown";
            const isNew = index === 0;

            const cardHTML = `
                <a href="devices.html" class="p-card scroll-reveal" data-soc="${soc}">
                    <span class="p-badge" style="z-index: 10; ${isNew ? '' : 'background:rgba(0,0,0,0.06);color:var(--g500);border:none;'}">${isNew ? 'New' : 'Available'}</span>
                    <div class="p-img-wrap">
                        <img src="../../images/phones/${local.image}" alt="${name}" class="p-img">
                    </div>
                    <div class="p-info">
                        <h3 class="p-title">${name}</h3>
                        <p class="p-specs">${soc} Chip · ${local.storage}</p>
                        <div class="p-foot">
                            <div>
                                <p class="p-price-label">From</p>
                                <p class="p-price">${local.price}</p>
                            </div>
                            <button class="btn-buy" aria-label="View Details">View</button>
                        </div>
                    </div>
                </a>
            `;
            grid.insertAdjacentHTML('beforeend', cardHTML);
        });

        document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    } catch (err) {
        console.error(err);
        grid.innerHTML = '<p style="text-align: center; color: red; width: 100%; grid-column: 1/-1;">Failed to render devices.</p>';
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

            // Find matching model from TARGET_MODELS to get original price
            const modelData = TARGET_MODELS.find(m => m.fallbackName === titleText);
            if (modelData && mPrice) {
                let mOriginalPrice = document.getElementById('m-original-price');
                if (!mOriginalPrice) {
                    mOriginalPrice = document.createElement('p');
                    mOriginalPrice.id = 'm-original-price';
                    mOriginalPrice.style.fontSize = '14px';
                    mOriginalPrice.style.color = '#64748b'; // slate-500
                    mOriginalPrice.style.marginTop = '4px';
                    mPrice.parentNode.insertBefore(mOriginalPrice, mPrice.nextSibling);
                }
                mOriginalPrice.textContent = `SRP: ${modelData.originalPrice}`;
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
                    else if (dynamicSoc.includes('A16')) chipDesc = "Powering advanced computational photography.";
                    else if (dynamicSoc.includes('A15')) chipDesc = "Lightning fast and highly power-efficient.";
                    else if (dynamicSoc.includes('A14')) chipDesc = "Incredible performance and fully 5G ready.";
                    else if (dynamicSoc.includes('A13')) chipDesc = "Dependable performance for daily tasks.";
                    else if (dynamicSoc.includes('A12')) chipDesc = "Next-generation Neural Engine.";
                    else if (dynamicSoc.includes('A11')) chipDesc = "Smart and powerful.";
                    else if (dynamicSoc.includes('A10')) chipDesc = "Fast when you need it.";
                    else if (dynamicSoc.includes('A9')) chipDesc = "Stellar performance for everyday use.";
                }
                if(mSpecChip) mSpecChip.textContent = (dynamicSoc && dynamicSoc !== "Unknown") ? `${dynamicSoc} chip. ${chipDesc}` : specsData[titleText].chip;
                if(mSpecBattery) mSpecBattery.textContent = specsData[titleText].battery;
            }

            pmOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    });
    
    // Close Modal Event Listeners
    const pmOverlay = document.getElementById('pm-overlay');
    const pmClose = document.getElementById('pm-close');
    
    function closeProductModal(e) {
        if (e && e.target !== pmOverlay && e.target.closest('button') !== pmClose) return;
        pmOverlay.classList.remove('open');
        document.body.style.overflow = '';
    }
    
    if(pmClose) pmClose.addEventListener('click', closeProductModal);
    if(pmOverlay) pmOverlay.addEventListener('click', closeProductModal);
});
