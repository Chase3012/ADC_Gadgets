/**
 * ADC Gadgets - Apple 3D Interactive Model Viewer Engine
 * Dynamically streams and controls rotatable 3D iPhone models on-demand with zero initial page load impact.
 * Includes multi-tier candidate resolution, live progress tracking, and fallback safeguards.
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
    let candidateList = [];
    let currentCandidateIndex = 0;
    let safetyTimeout = null;

    function clearSafetyTimer() {
        if (safetyTimeout) {
            clearTimeout(safetyTimeout);
            safetyTimeout = null;
        }
    }

    // Helper: Build multi-tier candidate URLs for robustness
    function getModelCandidates(deviceName, appledbId) {
        const name = (deviceName || '').toLowerCase();
        const id = (appledbId || '').toLowerCase();

        // Pro series: iPhone 16 Pro / 16 Pro Max / 15 Pro / 15 Pro Max / 14 Pro / 13 Pro / 18 Pro
        const isPro = name.includes('pro') || id.includes('pro') || name.includes('ultra');
        const filename = isPro ? 'iphone-pro.glb' : 'iphone.glb';

        const list = [];

        // 1. App-relative path to src/shared/models (guaranteed in Vercel dist and Express)
        list.push(`../../src/shared/models/${filename}`);

        // 2. Relative path to root models/
        list.push(`../../models/${filename}`);

        // 3. Absolute URL if on web server
        if (window.location.origin && !window.location.protocol.startsWith('file')) {
            list.push(`${window.location.origin}/src/shared/models/${filename}`);
            list.push(`${window.location.origin}/models/${filename}`);
        }

        // 4. Remote high-speed fallback
        if (isPro) {
            list.push('https://raw.githubusercontent.com/vishalparmarr/apple-clone/main/public/models/scene.glb');
        } else {
            list.push('https://raw.githubusercontent.com/pizza3/asset/master/iphone.glb');
        }

        return list;
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
                    console.warn('[Apple3D] Failed to load Google model-viewer CDN, trying unpkg fallback...', err);
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

            isInitialized = true;
        },

        /**
         * Prepare the viewer for a specific device when opening the modal
         */
        setupDevice: function (deviceName, appledbId, posterUrl) {
            this.init();
            clearSafetyTimer();

            currentDeviceData = {
                name: deviceName || 'iPhone',
                appledbId: appledbId || '',
                poster: posterUrl || ''
            };

            candidateList = getModelCandidates(currentDeviceData.name, currentDeviceData.appledbId);
            currentCandidateIndex = 0;

            // Always start in 2D mode for instantaneous zero-latency modal display
            this.switchTo2D(true);

            currentModelViewer = document.getElementById('m-model-viewer');
            if (currentModelViewer) {
                if (posterUrl) currentModelViewer.poster = posterUrl;
                currentModelViewer.removeAttribute('src');
            }
        },

        /**
         * Switch modal view to 2D Photo mode
         */
        switchTo2D: function (isSilent = false) {
            activeMode = '2d';
            clearSafetyTimer();

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
            clearSafetyTimer();

            const imgContainer = document.getElementById('pm-img-container');
            const d3Container = document.getElementById('pm-3d-container');
            const btn2D = document.getElementById('btn-toggle-2d');
            const btn3D = document.getElementById('btn-toggle-3d');
            const loadingEl = document.getElementById('pm-3d-loading');
            const loadingText = loadingEl ? loadingEl.querySelector('span') : null;

            if (btn2D) btn2D.classList.remove('active');
            if (btn3D) btn3D.classList.add('active');

            if (imgContainer) imgContainer.style.display = 'none';
            if (d3Container) d3Container.style.display = 'flex';

            if (loadingEl) {
                loadingEl.style.display = 'flex';
                if (loadingText) loadingText.textContent = 'Loading 3D Experience...';
            }

            try {
                // 1. Ensure Google <model-viewer> engine script is loaded
                await ensureModelViewerScript();

                // 2. Ensure custom element is registered and upgraded
                if (window.customElements && window.customElements.whenDefined) {
                    await window.customElements.whenDefined('model-viewer');
                }

                currentModelViewer = document.getElementById('m-model-viewer');

                if (currentModelViewer) {
                    // Set up event listeners directly on the upgraded element
                    const onProgress = (e) => {
                        const pct = Math.round((e.detail.totalProgress || 0) * 100);
                        if (loadingText && pct > 0 && pct <= 100) {
                            loadingText.textContent = `Loading 3D Experience... ${pct}%`;
                        }
                    };

                    const onLoad = () => {
                        clearSafetyTimer();
                        if (loadingEl) loadingEl.style.display = 'none';
                        if (window.lucide) window.lucide.createIcons();
                        currentModelViewer.removeEventListener('load', onLoad);
                        currentModelViewer.removeEventListener('progress', onProgress);
                    };

                    const onError = (e) => {
                        console.warn(`[Apple3D] Failed candidate [${currentCandidateIndex}]: ${candidateList[currentCandidateIndex]}`, e);
                        currentCandidateIndex++;
                        if (currentCandidateIndex < candidateList.length) {
                            const nextUrl = candidateList[currentCandidateIndex];
                            console.log(`[Apple3D] Trying fallback candidate: ${nextUrl}`);
                            currentModelViewer.setAttribute('src', nextUrl);
                        } else {
                            console.error('[Apple3D] All 3D model candidates failed. Reverting to 2D view.');
                            clearSafetyTimer();
                            if (loadingEl) loadingEl.style.display = 'none';
                            this.switchTo2D();
                        }
                    };

                    currentModelViewer.addEventListener('progress', onProgress);
                    currentModelViewer.addEventListener('load', onLoad);
                    currentModelViewer.addEventListener('error', onError);

                    // 4-Second safety timer: if load takes too long or silent fail, hide overlay
                    safetyTimeout = setTimeout(() => {
                        if (loadingEl && loadingEl.style.display !== 'none') {
                            console.log('[Apple3D] Safety release: hiding loading overlay.');
                            loadingEl.style.display = 'none';
                        }
                    }, 4000);

                    // Trigger model loading with first candidate
                    if (!candidateList || candidateList.length === 0) {
                        candidateList = getModelCandidates(currentDeviceData.name, currentDeviceData.appledbId);
                    }
                    currentCandidateIndex = 0;
                    const initialModel = candidateList[0];

                    currentModelViewer.autoRotate = isAutoRotating;
                    currentModelViewer.cameraOrbit = '0deg 75deg 105%';
                    currentModelViewer.setAttribute('src', initialModel);
                }
            } catch (err) {
                console.error('[Apple3D] Failed to initialize 3D viewer:', err);
                clearSafetyTimer();
                if (loadingEl) loadingEl.style.display = 'none';
                this.switchTo2D();
            }

            if (window.lucide) window.lucide.createIcons();
        },

        /**
         * Clean up resources and stop rendering when modal closes
         */
        onModalClose: function () {
            clearSafetyTimer();
            if (currentModelViewer) {
                currentModelViewer.autoRotate = false;
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
