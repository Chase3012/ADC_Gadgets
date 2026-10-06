// src/admin/js/inventory.js

document.addEventListener('DOMContentLoaded', () => {
  const panelInventory = document.getElementById('panel-inventory');
  const inventoryModal = document.getElementById('inventory-modal');
  const inventoryForm = document.getElementById('inventory-form');
  const tbody = document.getElementById('devices-tbody');
  
  if (!panelInventory) return;

  // ─── COLOR PICKER LOGIC ────────────────────────────────────────────────────────
  // Apple-accurate color palette with hex values
  const PRESET_COLORS = [
    // iPhone 16 series
    { name: 'Black',               hex: '#1a1a1a' },
    { name: 'White',               hex: '#f3ede3' },
    { name: 'Pink',                hex: '#f2a8b0' },
    { name: 'Teal',                hex: '#4e8d87' },
    { name: 'Ultramarine',         hex: '#3b4f88' },
    // iPhone 16 Pro
    { name: 'Black Titanium',      hex: '#2f2e2c' },
    { name: 'White Titanium',      hex: '#e8e3d8' },
    { name: 'Natural Titanium',    hex: '#c2b9a9' },
    { name: 'Desert Titanium',     hex: '#a6845c' },
    // iPhone 15 series
    { name: 'Blue',                hex: '#9aafc4' },
    { name: 'Yellow',              hex: '#e4d159' },
    { name: 'Green',               hex: '#a4c0a6' },
    { name: 'Red',                 hex: '#d13040' },
    // iPhone 15 Pro
    { name: 'Blue Titanium',       hex: '#7a8ea0' },
    { name: 'Black Titanium (15)', hex: '#2f2f2f' },
    { name: 'White Titanium (15)', hex: '#dcd7cc' },
    // iPhone 14 series
    { name: 'Midnight',            hex: '#252628' },
    { name: 'Starlight',           hex: '#f5f0e6' },
    { name: 'Purple',              hex: '#cac1d8' },
    { name: 'Space Black',         hex: '#2b2b2b' },
    { name: 'Gold',                hex: '#f8d7a5' },
    { name: 'Silver',              hex: '#e9e3d6' },
    { name: 'Space Gray',          hex: '#6b6b6b' },
    // iPhone 13 / 12
    { name: 'Alpine Green',        hex: '#7d9b8e' },
    { name: 'Coral',               hex: '#e1614f' },
    { name: 'Light Blue',          hex: '#aacdd6' },
    // iPhone 11
    { name: 'Purple (11)',         hex: '#c7b8d7' },
    { name: 'Yellow (11)',         hex: '#f5e07d' },
    { name: 'Green (11)',          hex: '#a5cf9f' },
    { name: 'Red (11)',            hex: '#c0222a' },
    { name: 'White (11)',          hex: '#f7f2f2' },
    { name: 'Black (11)',          hex: '#1a1919' },
    // Older / SE
    { name: 'Product Red',         hex: '#b92234' },
    { name: 'Midnight Green',      hex: '#3d5248' },
    { name: 'Pacific Blue',        hex: '#2e6e99' },
    { name: 'Graphite',            hex: '#5c5957' },
    { name: 'Bronze',              hex: '#7a5c45' },
  ];

  let selectedColors = []; // array of color name strings

  function renderColorPicker(existingColors = []) {
    selectedColors = [...existingColors];
    const picker = document.getElementById('inv-color-picker');
    if (!picker) return;
    picker.innerHTML = '';
    PRESET_COLORS.forEach(c => {
      const isSelected = selectedColors.includes(c.name);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.title = c.name;
      btn.dataset.colorName = c.name;
      btn.style.cssText = `
        width:30px; height:30px; border-radius:50%; border:3px solid ${isSelected ? '#ec4899' : 'transparent'};
        background:${c.hex}; cursor:pointer; transition:all .15s; outline:2px solid rgba(0,0,0,.15);
        outline-offset:2px; position:relative;
      `;
      if (isSelected) {
        btn.innerHTML = `<span style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;color:#fff;font-size:14px;text-shadow:0 1px 2px rgba(0,0,0,.7);">✓</span>`;
      }
      btn.addEventListener('click', () => togglePresetColor(c.name));
      picker.appendChild(btn);
    });
    renderSelectedChips();
  }

  function togglePresetColor(name) {
    if (selectedColors.includes(name)) {
      selectedColors = selectedColors.filter(c => c !== name);
    } else {
      selectedColors.push(name);
    }
    renderColorPicker(selectedColors);
  }

  function addCustomColor() {
    const input = document.getElementById('inv-custom-color');
    if (!input) return;
    const val = input.value.trim();
    if (!val) return;
    if (!selectedColors.includes(val)) {
      selectedColors.push(val);
      renderColorPicker(selectedColors);
    }
    input.value = '';
  }

  function renderSelectedChips() {
    const display = document.getElementById('inv-selected-colors-display');
    if (!display) return;
    display.innerHTML = '';
    selectedColors.forEach(name => {
      const preset = PRESET_COLORS.find(c => c.name === name);
      const chip = document.createElement('span');
      chip.style.cssText = `
        display:inline-flex; align-items:center; gap:5px; padding:4px 10px; border-radius:20px;
        background:#fce7f3; color:#db2777; font-size:12px; font-weight:600; cursor:pointer;
        border:1px solid #fbcfe8;
      `;
      if (preset) {
        chip.innerHTML = `<span style="width:10px;height:10px;border-radius:50%;background:${preset.hex};border:1px solid rgba(0,0,0,.15);display:inline-block;"></span>${name} <span style="margin-left:2px;font-size:14px;color:#ec4899;">×</span>`;
      } else {
        chip.innerHTML = `${name} <span style="margin-left:2px;font-size:14px;color:#ec4899;">×</span>`;
      }
      chip.addEventListener('click', () => {
        selectedColors = selectedColors.filter(c => c !== name);
        renderColorPicker(selectedColors);
      });
      display.appendChild(chip);
    });
    if (selectedColors.length === 0) {
      display.innerHTML = '<span style="font-size:12px;color:var(--text-muted);">No colors selected yet</span>';
    }
  }

  // Wire up custom color button + Enter key
  document.getElementById('inv-add-custom-color')?.addEventListener('click', addCustomColor);
  document.getElementById('inv-custom-color')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addCustomColor(); }
  });

  // ─── Image Upload & Canvas Auto-Crop ──────────────────────────────────────────
  const imgFileInput  = document.getElementById('inv-img-file');
  const imgDropzone   = document.getElementById('inv-img-dropzone');
  const imgPreview    = document.getElementById('inv-img-preview');
  const imgPlaceholder = document.getElementById('inv-img-placeholder');
  const imgHidden     = document.getElementById('inv-img');

  // Drag visual feedback
  if (imgDropzone) {
    imgDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      imgDropzone.style.borderColor = 'var(--primary)';
      imgDropzone.style.background = '#fff0f6';
    });
    imgDropzone.addEventListener('dragleave', () => {
      imgDropzone.style.borderColor = 'var(--border)';
      imgDropzone.style.background = '#f8fafc';
    });
    imgDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      imgDropzone.style.borderColor = 'var(--border)';
      imgDropzone.style.background = '#f8fafc';
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

  /**
   * Center-crop the image to a square using Canvas, then upload to server.
   * Returns the saved filename via the hidden #inv-img field.
   */
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

        // Show preview immediately
        if (imgPreview) {
          imgPreview.src = canvas.toDataURL('image/png');
          imgPreview.style.display = 'block';
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
            imgHidden.value = data.filename;
            imgDropzone.style.opacity = '1';
          } catch (err) {
            console.error('Image upload failed:', err);
            alert('Image upload failed. Please try again.');
            imgDropzone.style.opacity = '1';
          }
        }, 'image/png');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function resetImageDropzone() {
    if (imgHidden) imgHidden.value = '';
    if (imgPreview) { imgPreview.src = ''; imgPreview.style.display = 'none'; }
    if (imgPlaceholder) imgPlaceholder.style.display = '';
    if (imgFileInput) imgFileInput.value = '';
    if (imgDropzone) {
      imgDropzone.style.borderColor = 'var(--border)';
      imgDropzone.style.background = '#f8fafc';
    }
  }

  // ─── Modal Handlers ────────────────────────────────────────────────────────────
  document.getElementById('open-add-device-btn').addEventListener('click', () => {
    document.getElementById('inventory-form').reset();
    document.getElementById('inv-id').value = '';
    document.getElementById('inventory-modal-title').textContent = 'Add Device';
    resetImageDropzone();
    renderColorPicker([]);
    inventoryModal.style.display = 'flex';
    inventoryModal.classList.add('active');
    if (window.lucide) lucide.createIcons();
  });

  document.getElementById('close-inventory-modal').addEventListener('click', () => {
    inventoryModal.style.display = 'none';
    inventoryModal.classList.remove('active');
  });
  
  const closeX = document.getElementById('close-inventory-modal-x');
  if (closeX) {
    closeX.addEventListener('click', () => {
      inventoryModal.style.display = 'none';
      inventoryModal.classList.remove('active');
    });
  }

  // Form Submit (Add/Edit)
  inventoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const id = document.getElementById('inv-id').value;
    const imgVal = document.getElementById('inv-img').value;

    if (!imgVal) {
      alert('Please upload a device image before saving.');
      return;
    }

    if (selectedColors.length === 0) {
      alert('Please select at least one available color for this device.');
      return;
    }

    const deviceData = {
      name:       document.getElementById('inv-name').value,
      appledb_id: document.getElementById('inv-appledb').value,
      image:      imgVal,
      storage:    document.getElementById('inv-storage').value,
      srp:        document.getElementById('inv-srp').value,
      stock:      document.getElementById('inv-stock').value,
      status:     document.getElementById('inv-status').value,
      colors:     selectedColors,
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
      
      inventoryModal.style.display = 'none';
      inventoryModal.classList.remove('active');
      loadDevices();
    } catch (err) {
      alert(err.message);
    }
  });

  window.editDevice = async (id, name, appledb_id, image, storage, srp, stock, status, colors) => {
    try {
      document.getElementById('inv-id').value      = id || '';
      document.getElementById('inv-name').value    = name || '';
      document.getElementById('inv-appledb').value = appledb_id || '';
      document.getElementById('inv-img').value     = image || '';
      document.getElementById('inv-storage').value = storage || '';
      document.getElementById('inv-srp').value     = srp || 0;
      document.getElementById('inv-stock').value   = stock || 0;
      document.getElementById('inv-status').value  = status || 'available';

      // Restore colors
      const existingColors = Array.isArray(colors) ? colors : [];
      renderColorPicker(existingColors);

      // Show existing image in preview if available
      if (image) {
        const imgPath = image.includes('/') ? image : `../../images/phones/${image}`;
        if (imgPreview) {
          imgPreview.src = imgPath;
          imgPreview.style.display = 'block';
          if (imgPlaceholder) imgPlaceholder.style.display = 'none';
        }
      } else {
        resetImageDropzone();
      }
      
      document.getElementById('inventory-modal-title').textContent = 'Edit Device';
      inventoryModal.style.display = 'flex';
      inventoryModal.classList.add('active');
    } catch (err) {
      console.error('Error in editDevice:', err);
    }
  };

  window.deleteDevice = async (id) => {
    if (!confirm('Are you sure you want to delete this device?')) return;
    try {
      const res = await fetch(`/api/devices/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete device');
      loadDevices();
    } catch (err) {
      alert(err.message);
    }
  };

  async function loadDevices() {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;">Loading...</td></tr>';
    try {
      const res = await fetch('/api/devices');
      const devices = await res.json();
      
      tbody.innerHTML = '';
      devices.forEach(d => {
        const stockBadge = d.stock > 0 
          ? `<span style="font-size:12px; color:var(--success);">${d.stock} In Stock</span>` 
          : `<span style="font-size:12px; color:var(--danger);">Out of Stock</span>`;
          
        const imgPath = d.image && d.image.includes('/') ? d.image : `../../images/phones/${d.image}`;

        // Color dots
        const colorDots = (d.colors && d.colors.length > 0)
          ? d.colors.slice(0, 5).map(c => {
              const preset = PRESET_COLORS.find(p => p.name === c);
              const hex = preset ? preset.hex : '#94a3b8';
              return `<span title="${c}" style="display:inline-block;width:14px;height:14px;border-radius:50%;background:${hex};border:1px solid rgba(0,0,0,.2);margin-right:2px;"></span>`;
            }).join('') + (d.colors.length > 5 ? `<span style="font-size:11px;color:var(--text-muted);">+${d.colors.length - 5}</span>` : '')
          : '<span style="font-size:11px;color:#aaa;">—</span>';

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td>
            <div style="display:flex; align-items:center; gap:12px;">
              <img src="${imgPath}" alt="${d.name}" style="width:32px; height:32px; object-fit:contain;">
              <span style="font-weight:600; color:var(--text-main);">${d.name}</span>
            </div>
          </td>
          <td style="color:var(--text-muted);">${d.storage || '-'}</td>
          <td style="font-weight:600;">₱${Number(d.srp).toLocaleString()}</td>
          <td><div style="display:flex;align-items:center;gap:2px;">${colorDots}</div></td>
          <td>${stockBadge}</td>
          <td>${d.status === 'upcoming' ? '<span style="color:#eab308;font-weight:600;">Upcoming</span>' : '<span style="color:#22c55e;font-weight:600;">Available</span>'}</td>
          <td>
            <div style="display:flex; gap:8px;">
              <button class="btn-secondary edit-btn" style="padding:4px 8px; font-size:12px;">Edit</button>
              <button class="btn-secondary delete-btn" style="padding:4px 8px; font-size:12px; color:#ef4444; border-color:#fee2e2;">Delete</button>
            </div>
          </td>
        `;

        tr.querySelector('.edit-btn').addEventListener('click', () => {
          window.editDevice(d.id, d.name, d.appledb_id, d.image, d.storage, d.srp, d.stock, d.status, d.colors || []);
        });

        tr.querySelector('.delete-btn').addEventListener('click', () => {
          window.deleteDevice(d.id);
        });

        tbody.appendChild(tr);
      });
    } catch (err) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color:var(--danger);">Failed to load inventory.</td></tr>`;
    }
  }

  // Initial render of color picker (empty state for add modal)
  renderColorPicker([]);

  // Initial Load
  loadDevices();
});
