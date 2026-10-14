// src/admin/js/inventory.js

document.addEventListener('DOMContentLoaded', () => {
  const panelInventory = document.getElementById('panel-inventory');
  const inventoryModal = document.getElementById('inventory-modal');
  const inventoryForm = document.getElementById('inventory-form');
  const tbody = document.getElementById('devices-tbody');
  
  if (!panelInventory) return;

  // ─── APPLE-ACCURATE PRESET COLORS ─────────────────────────────────────────────
  const PRESET_COLORS = [
    { name: 'Black',               hex: '#1a1a1a' },
    { name: 'White',               hex: '#f3ede3' },
    { name: 'Pink',                hex: '#f2a8b0' },
    { name: 'Teal',                hex: '#4e8d87' },
    { name: 'Ultramarine',         hex: '#3b4f88' },
    { name: 'Black Titanium',      hex: '#2f2e2c' },
    { name: 'White Titanium',      hex: '#e8e3d8' },
    { name: 'Natural Titanium',    hex: '#c2b9a9' },
    { name: 'Desert Titanium',     hex: '#a6845c' },
    { name: 'Blue',                hex: '#9aafc4' },
    { name: 'Yellow',              hex: '#e4d159' },
    { name: 'Green',               hex: '#a4c0a6' },
    { name: 'Red',                 hex: '#d13040' },
    { name: 'Blue Titanium',       hex: '#7a8ea0' },
    { name: 'Midnight',            hex: '#252628' },
    { name: 'Starlight',           hex: '#f5f0e6' },
    { name: 'Purple',              hex: '#cac1d8' },
    { name: 'Space Black',         hex: '#2b2b2b' },
    { name: 'Gold',                hex: '#f8d7a5' },
    { name: 'Silver',              hex: '#e9e3d6' },
    { name: 'Space Gray',          hex: '#6b6b6b' },
  ];

  let selectedColors = []; // Array of color names for device
  let appleDbCatalog = []; // Cached AppleDB devices
  let currentAppleFilter = 'all';
  let activeAppleDevice = null;
  let activeColorVariant = null;

  // ─── COLOR CHIPS DISPLAY ──────────────────────────────────────────────────────
  function renderSelectedChips() {
    const display = document.getElementById('inv-selected-colors-display');
    if (!display) return;
    display.innerHTML = '';
    
    if (selectedColors.length === 0) {
      display.innerHTML = '<span style="font-size:12px;color:var(--text-muted);">No colors selected yet (auto-populated when choosing Apple model)</span>';
      return;
    }

    selectedColors.forEach(name => {
      // Find hex from activeAppleDevice or PRESET_COLORS
      let hex = '#94a3b8';
      if (activeAppleDevice && activeAppleDevice.colors) {
        const found = activeAppleDevice.colors.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (found) hex = found.hex;
      }
      if (hex === '#94a3b8') {
        const preset = PRESET_COLORS.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (preset) hex = preset.hex;
      }

      const chip = document.createElement('span');
      chip.style.cssText = `
        display:inline-flex; align-items:center; gap:6px; padding:4px 10px; border-radius:20px;
        background:rgba(236,72,153,0.12); color:#f472b6; font-size:12px; font-weight:600; cursor:pointer;
        border:1px solid rgba(236,72,153,0.28); transition:all .15s;
      `;
      chip.title = 'Click to remove color';
      chip.innerHTML = `<span style="width:10px;height:10px;border-radius:50%;background:${hex};border:1px solid rgba(255,255,255,0.3);display:inline-block;"></span>${name} <span style="font-size:13px;opacity:0.7;margin-left:2px;">&times;</span>`;
      
      chip.addEventListener('click', () => {
        selectedColors = selectedColors.filter(c => c !== name);
        renderSelectedChips();
      });
      display.appendChild(chip);
    });
  }

  // ─── APPLE DATABASE CATALOG & SEARCH ──────────────────────────────────────────
  const searchInput    = document.getElementById('appledb-search-input');
  const searchDropdown = document.getElementById('appledb-search-dropdown');
  const clearSearchBtn = document.getElementById('appledb-clear-search');
  const filterPills    = document.querySelectorAll('.appledb-filter-pill');
  const statusIndicator = document.getElementById('appledb-status-indicator');

  async function loadAppleDbCatalog() {
    try {
      const res = await fetch('/api/appledb/devices');
      if (!res.ok) throw new Error('Failed to fetch AppleDB catalog');
      appleDbCatalog = await res.json();
      if (statusIndicator) {
        statusIndicator.textContent = `● ${appleDbCatalog.length} Models Ready`;
      }
    } catch (err) {
      console.warn('AppleDB catalog load warning:', err);
      if (statusIndicator) {
        statusIndicator.textContent = '● Offline Mode';
        statusIndicator.style.color = '#eab308';
        statusIndicator.style.background = 'rgba(234,179,8,0.15)';
      }
    }
  }

  // Filter Pills (All, iPhone, iPad, Apple Watch, Mac)
  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentAppleFilter = pill.dataset.type;
      runAppleSearch(searchInput ? searchInput.value.trim() : '');
    });
  });

  // Debounced Search Input
  let searchTimeout = null;
  if (searchInput) {
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      const query = searchInput.value.trim();
      if (clearSearchBtn) clearSearchBtn.style.display = query ? 'flex' : 'none';
      searchTimeout = setTimeout(() => runAppleSearch(query), 120);
    });

    searchInput.addEventListener('focus', () => {
      const query = searchInput.value.trim();
      runAppleSearch(query);
    });
  }

  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      if (searchInput) {
        searchInput.value = '';
        searchInput.focus();
      }
      clearSearchBtn.style.display = 'none';
      if (searchDropdown) searchDropdown.style.display = 'none';
    });
  }

  // Close dropdown on outside click
  document.addEventListener('click', (e) => {
    if (searchDropdown && !e.target.closest('.appledb-search-wrap')) {
      searchDropdown.style.display = 'none';
    }
  });

  function runAppleSearch(query) {
    if (!searchDropdown) return;
    if (!appleDbCatalog || appleDbCatalog.length === 0) {
      searchDropdown.innerHTML = '<div style="padding:12px;font-size:12px;color:var(--text-muted);text-align:center;">Loading Apple catalog...</div>';
      searchDropdown.style.display = 'block';
      return;
    }

    const q = query.toLowerCase();
    const results = appleDbCatalog.filter(d => {
      // Type category filter
      if (currentAppleFilter !== 'all') {
        if (currentAppleFilter === 'MacBook' && !d.type.includes('Mac')) return false;
        if (currentAppleFilter !== 'MacBook' && !d.type.includes(currentAppleFilter)) return false;
      }
      // Text match filter
      if (!q) return true;
      return d.name.toLowerCase().includes(q) || 
             (d.key && d.key.toLowerCase().includes(q)) ||
             (d.soc && d.soc.toLowerCase().includes(q));
    }).slice(0, 10); // Limit to top 10

    if (results.length === 0) {
      searchDropdown.innerHTML = `<div style="padding:14px;font-size:12px;color:var(--text-muted);text-align:center;">No matching Apple devices found for "${query}"</div>`;
      searchDropdown.style.display = 'block';
      return;
    }

    searchDropdown.innerHTML = results.map(d => {
      const releaseYear = d.released ? d.released.substring(0, 4) : '';
      const colorsCount = d.colors ? d.colors.length : 0;
      return `
        <div class="appledb-dropdown-item" data-key="${d.key}">
          <div>
            <div class="appledb-item-name">${d.name}</div>
            <div class="appledb-item-sub">
              ${d.soc ? `<span class="appledb-chip-badge">${d.soc}</span>` : ''}
              <span>${d.type}</span>
              ${releaseYear ? `<span>· ${releaseYear}</span>` : ''}
              ${colorsCount > 0 ? `<span>· ${colorsCount} colors</span>` : ''}
            </div>
          </div>
          <div style="font-size:11px;font-weight:700;color:#ec4899;background:rgba(236,72,153,0.12);padding:4px 8px;border-radius:6px;">Select</div>
        </div>
      `;
    }).join('');

    searchDropdown.style.display = 'block';

    // Item click listener
    searchDropdown.querySelectorAll('.appledb-dropdown-item').forEach(item => {
      item.addEventListener('click', () => {
        const key = item.dataset.key;
        const device = appleDbCatalog.find(d => d.key === key);
        if (device) selectAppleDevice(device);
        searchDropdown.style.display = 'none';
      });
    });
  }

  // ─── SPECS AUTO-POPULATION ──────────────────────────────────────────────────
  function populateSpecsFields(modelName, appledb_id = null, dynamicSoc = null, existingSpecs = null) {
    if (!window.getAppleSpecs) return;
    const specs = window.getAppleSpecs(modelName, appledb_id, dynamicSoc, existingSpecs);
    const d = document.getElementById('inv-spec-display');
    const c = document.getElementById('inv-spec-camera');
    const ch = document.getElementById('inv-spec-chip');
    const b = document.getElementById('inv-spec-battery');
    if (d) d.value = specs.display || '';
    if (c) c.value = specs.camera || '';
    if (ch) ch.value = specs.chip || '';
    if (b) b.value = specs.battery || '';
  }

  // When admin changes device name manually, auto-calculate specs if available
  const invNameEl = document.getElementById('inv-name');
  if (invNameEl) {
    invNameEl.addEventListener('change', () => {
      const val = invNameEl.value.trim();
      if (val) {
        populateSpecsFields(val, document.getElementById('inv-appledb')?.value);
      }
    });
  }

  /**
   * Called when an Apple device is selected from the search dropdown.
   * Auto-populates Device Name, AppleDB ID, Color Inventory, and Studio Render.
   */
  function selectAppleDevice(device) {
    activeAppleDevice = device;

    // 1. Auto-fill form fields
    const nameInput = document.getElementById('inv-name');
    const appleDbInput = document.getElementById('inv-appledb');
    if (nameInput) nameInput.value = device.name;
    if (appleDbInput) appleDbInput.value = device.key;

    if (searchInput) searchInput.value = device.name;
    if (clearSearchBtn) clearSearchBtn.style.display = 'flex';

    // 2. Auto-fill colors
    selectedColors = (device.colors || []).map(c => c.name);
    renderSelectedChips();

    // 3. Auto-populate specifications
    populateSpecsFields(device.name, device.key, device.soc);

    // 4. Setup Studio Render & Swatches
    setupStudioRender(device);

    // Ensure Studio tab is active
    switchToStudioTab();
  }

  function setupStudioRender(device, preselectedColorName = null) {
    const previewImg   = document.getElementById('inv-img-preview');
    const emptyState   = document.getElementById('inv-img-empty-state');
    const swatchesWrap = document.getElementById('appledb-swatches-wrap');
    const swatchesList = document.getElementById('appledb-swatches-list');
    const colorNameEl  = document.getElementById('appledb-color-selected-name');
    const hiddenImg    = document.getElementById('inv-img');

    if (!device || !device.colors || device.colors.length === 0) {
      if (emptyState) emptyState.style.display = 'block';
      if (previewImg) previewImg.style.display = 'none';
      if (swatchesWrap) swatchesWrap.style.display = 'none';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';
    if (previewImg) previewImg.style.display = 'block';
    if (swatchesWrap) swatchesWrap.style.display = 'flex';
    if (swatchesList) swatchesList.innerHTML = '';

    const imgKey = device.imageKey || device.key;
    
    // Determine active color
    let activeColor = device.colors[0];
    if (preselectedColorName) {
      const match = device.colors.find(c => c.name.toLowerCase() === preselectedColorName.toLowerCase());
      if (match) activeColor = match;
    }
    activeColorVariant = activeColor;

    // Render clickable color swatches
    device.colors.forEach(c => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `appledb-swatch-btn ${c.name === activeColor.name ? 'active' : ''}`;
      btn.style.background = c.hex;
      btn.title = c.name;
      
      btn.addEventListener('click', () => {
        swatchesList.querySelectorAll('.appledb-swatch-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeColorVariant = c;

        // Construct high-res AppleDB studio image URL
        const colorKey = c.key || c.name;
        const imgUrl = `https://img.appledb.dev/device@256/${imgKey}/${encodeURIComponent(colorKey)}.png`;
        
        if (previewImg) previewImg.src = imgUrl;
        if (hiddenImg) hiddenImg.value = imgUrl;
        if (colorNameEl) colorNameEl.textContent = c.name;
      });

      swatchesList.appendChild(btn);
    });

    // Trigger initial load for active color
    const initialColorKey = activeColor.key || activeColor.name;
    const initialImgUrl = `https://img.appledb.dev/device@256/${imgKey}/${encodeURIComponent(initialColorKey)}.png`;
    if (previewImg) previewImg.src = initialImgUrl;
    if (hiddenImg) hiddenImg.value = initialImgUrl;
    if (colorNameEl) colorNameEl.textContent = activeColor.name;
  }

  // ─── STUDIO RENDER VS CUSTOM UPLOAD TABS ─────────────────────────────────────
  const tabStudio = document.getElementById('tab-img-studio');
  const tabCustom = document.getElementById('tab-img-custom');
  const containerStudio = document.getElementById('appledb-studio-container');
  const containerCustom = document.getElementById('inv-custom-upload-container');

  function switchToStudioTab() {
    if (tabStudio) tabStudio.classList.add('active');
    if (tabCustom) tabCustom.classList.remove('active');
    if (containerStudio) containerStudio.style.display = 'block';
    if (containerCustom) containerCustom.style.display = 'none';

    // If an Apple studio image is active, ensure #inv-img has the studio URL
    if (activeAppleDevice && activeColorVariant) {
      const imgKey = activeAppleDevice.imageKey || activeAppleDevice.key;
      const colorKey = activeColorVariant.key || activeColorVariant.name;
      const imgUrl = `https://img.appledb.dev/device@256/${imgKey}/${encodeURIComponent(colorKey)}.png`;
      const hiddenImg = document.getElementById('inv-img');
      if (hiddenImg) hiddenImg.value = imgUrl;
    }
  }

  function switchToCustomTab() {
    if (tabCustom) tabCustom.classList.add('active');
    if (tabStudio) tabStudio.classList.remove('active');
    if (containerCustom) containerCustom.style.display = 'block';
    if (containerStudio) containerStudio.style.display = 'none';
  }

  if (tabStudio) tabStudio.addEventListener('click', switchToStudioTab);
  if (tabCustom) tabCustom.addEventListener('click', switchToCustomTab);

  // ─── CUSTOM IMAGE UPLOAD & CANVAS AUTO-CROP ──────────────────────────────────
  const imgFileInput     = document.getElementById('inv-img-file');
  const imgDropzone      = document.getElementById('inv-img-dropzone');
  const imgCustomPreview = document.getElementById('inv-img-custom-preview');
  const imgPlaceholder   = document.getElementById('inv-img-placeholder');
  const imgHidden        = document.getElementById('inv-img');

  if (imgDropzone) {
    imgDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      imgDropzone.style.borderColor = 'var(--primary)';
      imgDropzone.style.background = 'rgba(236,72,153,0.06)';
    });
    imgDropzone.addEventListener('dragleave', () => {
      imgDropzone.style.borderColor = 'var(--border)';
      imgDropzone.style.background = 'var(--bg)';
    });
    imgDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      imgDropzone.style.borderColor = 'var(--border)';
      imgDropzone.style.background = 'var(--bg)';
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) processImageFile(file);
    });
  }

  if (imgFileInput) {
    imgFileInput.addEventListener('change', () => {
      const file = imgFileInput.files[0];
      if (file) processImageFile(file);
    });
  }

  function processImageFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = async () => {
        // Center-crop to square
        const size = Math.min(img.width, img.height);
        const sx = (img.width  - size) / 2;
        const sy = (img.height - size) / 2;

        const canvas = document.createElement('canvas');
        canvas.width  = 500;
        canvas.height = 500;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, sx, sy, size, size, 0, 0, 500, 500);

        // Show preview in custom box
        if (imgCustomPreview) {
          imgCustomPreview.src = canvas.toDataURL('image/png');
          imgCustomPreview.style.display = 'block';
          if (imgPlaceholder) imgPlaceholder.style.display = 'none';
        }

        // Upload cropped image to server
        canvas.toBlob(async (blob) => {
          const formData = new FormData();
          const safeName = file.name.replace(/\s+/g, '_');
          formData.append('image', blob, safeName);

          try {
            imgDropzone.style.opacity = '0.6';
            const res = await fetch('/api/upload-image', {
              method: 'POST',
              body: formData
            });
            if (!res.ok) throw new Error('Upload failed');
            const data = await res.json();
            // Store public URL or saved filename
            imgHidden.value = data.url || data.filename;
            imgDropzone.style.opacity = '1';
          } catch (err) {
            console.error('Image upload failed:', err);
            if (window.showCustomAlert) window.showCustomAlert('Image upload failed. Please try again.', 'Upload Error');
            else alert('Image upload failed. Please try again.');
            imgDropzone.style.opacity = '1';
          }
        }, 'image/png');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function resetAllImageInputs() {
    if (imgHidden) imgHidden.value = '';
    
    // Reset Studio render
    const previewImg = document.getElementById('inv-img-preview');
    const emptyState = document.getElementById('inv-img-empty-state');
    const swatchesWrap = document.getElementById('appledb-swatches-wrap');
    if (previewImg) { previewImg.src = ''; previewImg.style.display = 'none'; }
    if (emptyState) emptyState.style.display = 'block';
    if (swatchesWrap) swatchesWrap.style.display = 'none';
    
    // Reset Custom upload
    if (imgCustomPreview) { imgCustomPreview.src = ''; imgCustomPreview.style.display = 'none'; }
    if (imgPlaceholder) imgPlaceholder.style.display = 'block';
    if (imgFileInput) imgFileInput.value = '';
    if (imgDropzone) {
      imgDropzone.style.borderColor = 'var(--border)';
      imgDropzone.style.background = 'var(--bg)';
    }

    // Default to studio tab
    switchToStudioTab();
  }

  // ─── MODAL HANDLERS ───────────────────────────────────────────────────────────
  document.getElementById('open-add-device-btn').addEventListener('click', () => {
    document.getElementById('inventory-form').reset();
    document.getElementById('inv-id').value = '';
    document.getElementById('inventory-modal-title').textContent = 'Add Device';
    
    activeAppleDevice = null;
    activeColorVariant = null;
    selectedColors = [];
    renderSelectedChips();

    if (searchInput) searchInput.value = '';
    if (clearSearchBtn) clearSearchBtn.style.display = 'none';
    if (searchDropdown) searchDropdown.style.display = 'none';

    // Clear spec fields
    const dEl = document.getElementById('inv-spec-display'); if (dEl) dEl.value = '';
    const cEl = document.getElementById('inv-spec-camera'); if (cEl) cEl.value = '';
    const chEl = document.getElementById('inv-spec-chip'); if (chEl) chEl.value = '';
    const bEl = document.getElementById('inv-spec-battery'); if (bEl) bEl.value = '';

    resetAllImageInputs();
    
    inventoryModal.style.display = 'flex';
    inventoryModal.classList.add('active');
    if (window.lucide) lucide.createIcons();
  });

  function closeModal() {
    inventoryModal.style.display = 'none';
    inventoryModal.classList.remove('active');
    if (searchDropdown) searchDropdown.style.display = 'none';
  }

  document.getElementById('close-inventory-modal').addEventListener('click', closeModal);
  
  const closeX = document.getElementById('close-inventory-modal-x');
  if (closeX) closeX.addEventListener('click', closeModal);

  // ─── FORM SUBMIT (ADD / EDIT) ─────────────────────────────────────────────────
  inventoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('inv-id').value;
    const imgVal = document.getElementById('inv-img').value;

    if (!imgVal) {
      if (window.showCustomAlert) {
        window.showCustomAlert('Please select an Apple device to use its official studio photo, or upload a custom image before saving.', 'Missing Image');
      } else {
        alert('Please select an Apple device to use its official studio photo, or upload a custom image before saving.');
      }
      return;
    }

    const specsObj = {
      display: document.getElementById('inv-spec-display')?.value.trim() || '',
      camera:  document.getElementById('inv-spec-camera')?.value.trim() || '',
      chip:    document.getElementById('inv-spec-chip')?.value.trim() || '',
      battery: document.getElementById('inv-spec-battery')?.value.trim() || ''
    };

    const deviceData = {
      name:       document.getElementById('inv-name').value.trim(),
      appledb_id: document.getElementById('inv-appledb').value.trim(),
      image:      imgVal,
      storage:    document.getElementById('inv-storage').value.trim(),
      srp:        document.getElementById('inv-srp').value,
      stock:      document.getElementById('inv-stock').value,
      status:     document.getElementById('inv-status').value,
      colors:     selectedColors,
      specs:      specsObj,
    };
    
    const method = id ? 'PUT' : 'POST';
    const url = id ? `/api/devices/${id}` : `/api/devices`;
    
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deviceData)
      });
      
      if (!res.ok) throw new Error('Failed to save device');
      
      closeModal();
      loadDevices();
    } catch (err) {
      if (window.showCustomAlert) window.showCustomAlert(err.message, 'Save Error');
      else alert(err.message);
    }
  });

  // ─── EDIT DEVICE ──────────────────────────────────────────────────────────────
  window.editDevice = async (id, name, appledb_id, image, storage, srp, stock, status, colors, specs) => {
    try {
      document.getElementById('inv-id').value      = id || '';
      document.getElementById('inv-name').value    = name || '';
      document.getElementById('inv-appledb').value = appledb_id || '';
      document.getElementById('inv-img').value     = image || '';
      document.getElementById('inv-storage').value = storage || '';
      document.getElementById('inv-srp').value     = srp || 0;
      document.getElementById('inv-stock').value   = stock || 0;
      document.getElementById('inv-status').value  = status || 'available';

      if (searchInput) searchInput.value = name || '';
      if (clearSearchBtn) clearSearchBtn.style.display = name ? 'flex' : 'none';

      // Colors
      selectedColors = Array.isArray(colors) ? [...colors] : (colors ? String(colors).split(',').map(s=>s.trim()).filter(Boolean) : []);
      renderSelectedChips();

      // Populate specs (stored or auto-generated)
      populateSpecsFields(name, appledb_id, null, specs);

      // Check if image is from AppleDB CDN
      const isAppleDbUrl = image && image.includes('img.appledb.dev');

      // Attempt to match device in AppleDB catalog to restore swatches
      let matchedDevice = null;
      if (appleDbCatalog && appleDbCatalog.length > 0) {
        if (appledb_id) matchedDevice = appleDbCatalog.find(d => d.key === appledb_id);
        if (!matchedDevice && name) matchedDevice = appleDbCatalog.find(d => d.name.toLowerCase() === name.toLowerCase());
      }
      activeAppleDevice = matchedDevice;

      if (isAppleDbUrl || matchedDevice) {
        switchToStudioTab();
        if (matchedDevice) {
          // Extract color from URL if present
          let colorInUrl = null;
          if (image && image.includes('/')) {
            const parts = image.split('/');
            const filename = decodeURIComponent(parts[parts.length - 1]).replace('.png', '').replace('.webp', '');
            colorInUrl = filename;
          }
          setupStudioRender(matchedDevice, colorInUrl);
        } else {
          // Fallback studio image display
          const previewImg = document.getElementById('inv-img-preview');
          const emptyState = document.getElementById('inv-img-empty-state');
          if (previewImg) { previewImg.src = image; previewImg.style.display = 'block'; }
          if (emptyState) emptyState.style.display = 'none';
        }
      } else if (image) {
        // Custom upload or local image
        switchToCustomTab();
        const imgPath = image.includes('/') ? image : `../../images/phones/${image}`;
        if (imgCustomPreview) {
          imgCustomPreview.src = imgPath;
          imgCustomPreview.style.display = 'block';
          if (imgPlaceholder) imgPlaceholder.style.display = 'none';
        }
      } else {
        resetAllImageInputs();
      }
      
      document.getElementById('inventory-modal-title').textContent = 'Edit Device';
      inventoryModal.style.display = 'flex';
      inventoryModal.classList.add('active');
      if (window.lucide) lucide.createIcons();
    } catch (err) {
      console.error('Error in editDevice:', err);
    }
  };

  // ─── DELETE DEVICE ────────────────────────────────────────────────────────────
  window.deleteDevice = async (id) => {
    const doDelete = async () => {
      try {
        const res = await fetch(`/api/devices/${id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete device');
        loadDevices();
      } catch (err) {
        if (window.showCustomAlert) window.showCustomAlert(err.message, 'Error');
        else alert(err.message);
      }
    };
    if (window.showCustomConfirm) {
      window.showCustomConfirm('Are you sure you want to delete this device?', doDelete, 'Delete Device');
    } else if (confirm('Are you sure you want to delete this device?')) {
      doDelete();
    }
  };

  // ─── LOAD DEVICES TABLE ───────────────────────────────────────────────────────
  async function loadDevices() {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);">Loading devices...</td></tr>';
    try {
      const res = await fetch('/api/devices');
      const devices = await res.json();
      
      tbody.innerHTML = '';
      if (!devices || devices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:30px;color:var(--text-muted);">No devices found in inventory. Click "+ Add New Device" above.</td></tr>';
        return;
      }

      devices.forEach(d => {
        const stockBadge = d.stock > 0 
          ? `<span style="font-size:12px; color:var(--success); font-weight:600;">${d.stock} In Stock</span>` 
          : `<span style="font-size:12px; color:var(--danger); font-weight:600;">Out of Stock</span>`;
          
        let imgPath = d.image || '../../images/phones/appledb/iphone_16.png';
        if (!imgPath.startsWith('http') && !imgPath.startsWith('/')) {
          const clean = imgPath.replace(/^(\.\.\/)+/, '');
          imgPath = `../../${clean}`;
        }

        // Color dots
        const colorDots = (d.colors && d.colors.length > 0)
          ? d.colors.slice(0, 5).map(c => {
              const preset = PRESET_COLORS.find(p => p.name.toLowerCase() === c.toLowerCase());
              const hex = preset ? preset.hex : '#94a3b8';
              return `<span title="${c}" style="display:inline-block;width:13px;height:13px;border-radius:50%;background:${hex};border:1px solid rgba(255,255,255,0.25);margin-right:3px;"></span>`;
            }).join('') + (d.colors.length > 5 ? `<span style="font-size:11px;color:var(--text-muted);">+${d.colors.length - 5}</span>` : '')
          : '<span style="font-size:11px;color:var(--text-muted);">—</span>';

        const isStudioImg = d.image && (d.image.includes('img.appledb.dev') || d.image.includes('appledb/'));

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <div style="display:flex; align-items:center; gap:12px;">
              <div style="width:38px; height:38px; border-radius:8px; background:rgba(255,255,255,0.03); display:flex; align-items:center; justify-content:center; padding:2px; position:relative;">
                <img src="${imgPath}" alt="${d.name}" style="max-width:100%; max-height:100%; object-fit:contain;" onerror="this.src='../../images/phones/appledb/iphone_16.png'">
                ${isStudioImg ? '<span title="Official AppleDB Studio Render" style="position:absolute;bottom:-2px;right:-2px;width:8px;height:8px;border-radius:50%;background:#ec4899;border:1px solid #18181b;"></span>' : ''}
              </div>
              <div>
                <span style="font-weight:700; color:var(--text-main); display:block;">${d.name}</span>
                ${d.appledb_id ? `<span style="font-size:10px; color:var(--text-muted); font-family:monospace;">${d.appledb_id}</span>` : ''}
              </div>
            </div>
          </td>
          <td style="color:var(--text-muted); font-weight:500;">${d.storage || '-'}</td>
          <td style="font-weight:700; color:var(--text-main);">₱${Number(d.srp).toLocaleString()}</td>
          <td><div style="display:flex;align-items:center;gap:2px;">${colorDots}</div></td>
          <td>${stockBadge}</td>
          <td>${d.status === 'upcoming' ? '<span style="color:#eab308;font-weight:700;background:rgba(234,179,8,0.12);padding:3px 8px;border-radius:12px;font-size:11px;">Upcoming</span>' : '<span style="color:#22c55e;font-weight:700;background:rgba(34,197,94,0.12);padding:3px 8px;border-radius:12px;font-size:11px;">Available</span>'}</td>
          <td>
            <div style="display:flex; gap:8px;">
              <button class="btn-secondary edit-btn" style="padding:5px 10px; font-size:12px; border-radius:6px;">Edit</button>
              <button class="btn-secondary delete-btn" style="padding:5px 10px; font-size:12px; color:#ef4444; border-color:rgba(239,68,68,0.3); border-radius:6px;">Delete</button>
            </div>
          </td>
        `;

        tr.querySelector('.edit-btn').addEventListener('click', () => {
          window.editDevice(d.id, d.name, d.appledb_id, d.image, d.storage, d.srp, d.stock, d.status, d.colors || [], d.specs);
        });

        tr.querySelector('.delete-btn').addEventListener('click', () => {
          window.deleteDevice(d.id);
        });

        tbody.appendChild(tr);
      });
    } catch (err) {
      console.error('Error loading devices:', err);
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger); padding:30px;">Failed to load inventory.</td></tr>`;
    }
  }

  // Initial Data Fetching
  loadAppleDbCatalog();
  loadDevices();
});
