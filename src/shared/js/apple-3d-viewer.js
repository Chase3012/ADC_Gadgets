/**
 * ADC Gadgets - Apple 3D Interactive Model Viewer Engine
 * Dynamically streams and controls rotatable 3D iPhone models on-demand with zero initial page load impact.
 */

(function () {
    'use strict';

    let modelViewerScriptPromise = null;
    let isInitialized = false;
    let currentModelViewer = null;
    let currentDeviceData = {
        name: '',
        appledbId: '',
        poster: ''
    };
    let activeMode = '2d'; // '2d' | '3d'
    let isAutoRotating = true;

    // Helper: Dynamic URL resolver for models
    function getModelUrl(filename) {
        if (window.location.origin && window.location.origin !== 'null' && !window.location.protocol.startsWith('file')) {
            return `${window.location.origin}/models/${filename}`;
        }
        return `../../models/${filename}`;
    }

    // Helper: Match device model to 3D GLB chassis
    function resolveModelFile(deviceName, appledbId) {
        const name = (deviceName || '').toLowerCase();
        const id = (appledbId || '').toLowerCase();

        // Pro series: iPhone 16 Pro / 16 Pro Max / 15 Pro / 15 Pro Max / 14 Pro / 13 Pro / 18 Pro
        if (name.includes('pro') || id.includes('pro') || name.includes('ultra')) {
            return getModelUrl('iphone-pro.glb');
        }

        // Standard series: iPhone 16, 15, 14, 13, 12, 11, etc.
        return getModelUrl('iphone.glb');
    }

    // Lazy loader for Google <model-viewer>
    function ensureModelViewerScript() {
        if (window.customElements && window.customElements.get('model-viewer')) {
            return Promise.resolve();
        }

        if (!modelViewerScriptPromise) {
            modelViewerScriptPromise = new Promise((resolve, reject) => {
                const existingScript = document.querySelector('script[data-role="model-viewer"]');
                if (existingScript) {
                    existingScript.addEventListener('load', resolve);
                    existingScript.addEventListener('error', reject);
                    return;
                }

                const script = document.createElement('script');
                script.type = 'module';
                script.src = 'https://ajax.googleapis.com/ajax/libs/model-viewer/4.0.0/model-viewer.min.js';
                script.setAttribute('data-role', 'model-viewer');
                script.onload = () => resolve();
                script.onerror = (err) => {
                    console.warn('[Apple3D] Failed to load Google model-viewer CDN, falling back to unpkg...', err);
                    const fallbackScript = document.createElement('script');
                    fallbackScript.type = 'module';
                    fallbackScript.src = 'https://unpkg.com/@google/model-viewer/dist/model-viewer.min.js';
                    fallbackScript.onload = () => resolve();
                    fallbackScript.onerror = (err2) => reject(err2);
                    document.head.appendChild(fallbackScript);
                };
                document.head.appendChild(script);
            });
        }

        return modelViewerScriptPromise;
    }

    const Apple3DViewer = {
        /**
         * Initialize DOM listeners for 2D/3D toggle and controls inside the product modal
         */
        init: function () {
            if (isInitialized) return;

            const btn2D = document.getElementById('btn-toggle-2d');
            const btn3D = document.getElementById('btn-toggle-3d');
            const btnReset = document.getElementById('btn-reset-3d');
            const btnRotate = document.getElementById('btn-toggle-rotate');
            currentModelViewer = document.getElementById('m-model-viewer');

            if (btn2D) {
                btn2D.addEventListener('click', () => this.switchTo2D());
            }

            if (btn3D) {
                btn3D.addEventListener('click', () => this.switchTo3D());
            }

            if (btnReset && currentModelViewer) {
                btnReset.addEventListener('click', () => {
                    currentModelViewer.cameraOrbit = '0deg 75deg 105%';
                    currentModelViewer.cameraTarget = 'auto auto auto';
                    currentModelViewer.fieldOfView = 'auto';
                });
            }

            if (btnRotate && currentModelViewer) {
                btnRotate.addEventListener('click', () => {
                    isAutoRotating = !isAutoRotating;
                    currentModelViewer.autoRotate = isAutoRotating;
                    btnRotate.innerHTML = isAutoRotating 
                        ? '<i data-lucide="pause"></i> Pause' 
                        : '<i data-lucide="play"></i> Spin';
                    if (window.lucide) window.lucide.createIcons();
                });
            }

            if (currentModelViewer) {
                const loadingEl = document.getElementById('pm-3d-loading');
                currentModelViewer.addEventListener('load', () => {
                    if (loadingEl) loadingEl.style.display = 'none';
                    if (window.lucide) window.lucide.createIcons();
                });

                currentModelViewer.addEventListener('error', (e) => {
                    console.warn('[Apple3D] Model loading error, returning to 2D view:', e);
                    if (loadingEl) loadingEl.style.display = 'none';
                    this.switchTo2D();
                });
            }

            isInitialized = true;
        },

        /**
         * Prepare the viewer for a specific device when opening the modal
         */
        setupDevice: function (deviceName, appledbId, posterUrl) {
            this.init();

            currentDeviceData = {
                name: deviceName || 'iPhone',
                appledbId: appledbId || '',
                poster: posterUrl || ''
            };

            // Always start in 2D mode for instantaneous zero-latency modal display
            this.switchTo2D(true);

            if (currentModelViewer) {
                if (posterUrl) currentModelViewer.poster = posterUrl;
                // Defer loading model src until user triggers 3D view
                currentModelViewer.removeAttribute('src');
            }
        },

        /**
         * Switch modal view to 2D Photo mode
         */
        switchTo2D: function (isSilent = false) {
            activeMode = '2d';
            const imgContainer = document.getElementById('pm-img-container');
            const d3Container = document.getElementById('pm-3d-container');
            const btn2D = document.getElementById('btn-toggle-2d');
            const btn3D = document.getElementById('btn-toggle-3d');

            if (imgContainer) imgContainer.style.display = 'flex';
            if (d3Container) d3Container.style.display = 'none';

            if (btn2D) btn2D.classList.add('active');
            if (btn3D) btn3D.classList.remove('active');

            if (currentModelViewer && !isSilent) {
                currentModelViewer.autoRotate = false;
            }
        },

        /**
         * Switch modal view to Interactive 3D mode (loads engine and GLB on demand)
         */
        switchTo3D: async function () {
            activeMode = '3d';
            const imgContainer = document.getElementById('pm-img-container');
            const d3Container = document.getElementById('pm-3d-container');
            const btn2D = document.getElementById('btn-toggle-2d');
            const btn3D = document.getElementById('btn-toggle-3d');
            const loadingEl = document.getElementById('pm-3d-loading');

            if (btn2D) btn2D.classList.remove('active');
            if (btn3D) btn3D.classList.add('active');

            if (imgContainer) imgContainer.style.display = 'none';
            if (d3Container) d3Container.style.display = 'flex';

            if (loadingEl) loadingEl.style.display = 'flex';

            try {
                // 1. Ensure Google <model-viewer> engine is loaded
                await ensureModelViewerScript();

                // Re-query viewer in case custom element just upgraded
                currentModelViewer = document.getElementById('m-model-viewer');

                if (currentModelViewer) {
                    const targetGlb = resolveModelFile(currentDeviceData.name, currentDeviceData.appledbId);
                    
                    if (currentModelViewer.getAttribute('src') !== targetGlb) {
                        currentModelViewer.src = targetGlb;
                    }
                    
                    currentModelViewer.autoRotate = isAutoRotating;
                    currentModelViewer.cameraOrbit = '0deg 75deg 105%';
                }
            } catch (err) {
                console.error('[Apple3D] Failed to load 3D viewer:', err);
                if (loadingEl) loadingEl.style.display = 'none';
                this.switchTo2D();
            }

            if (window.lucide) window.lucide.createIcons();
        },

        /**
         * Clean up resources and stop rendering when modal closes
         */
        onModalClose: function () {
            if (currentModelViewer) {
                currentModelViewer.autoRotate = false;
                // Pause rendering or release src to save memory
                currentModelViewer.removeAttribute('src');
            }
            this.switchTo2D(true);
        }
    };

    // Expose globally
    window.Apple3DViewer = Apple3DViewer;

    // Auto-init on DOMContentLoaded if modal elements exist
    document.addEventListener('DOMContentLoaded', () => {
        Apple3DViewer.init();
    });
})();
