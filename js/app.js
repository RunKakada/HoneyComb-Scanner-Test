
/* ==================================================
   AI Honeycomb Inspector v4
   Main Application Controller
   Mobile-First Redesign
================================================== */

const App = (() => {

    const state = {
        running: false,
        frozen: false,
        surfaceEnabled: true,
        overlayMode: 0,
        overlayLabels: ["Full AR", "Outline", "Off"],
        frameCount: 0,
        startTime: null,
        lastFrameTime: performance.now(),
        fpsBuffer: [],
        detections: [],
        concreteData: null,
        measurement: null,
        smoothRisk: 0,
        busyDetecting: false
    };

    let animationId = null;

    /* ==========================================
       INIT
    ========================================== */

    async function init() {
        bindEvents();
        HUD.reset();
        Measurement.init();
        await YOLODetector.init();
        console.log("AI Honeycomb Inspector v4 Ready");
    }

    function bindEvents() {
        document.getElementById("startBtn")
            .addEventListener("click", start);

        document.getElementById("freezeBtn")
            .addEventListener("click", toggleFreeze);

        document.getElementById("overlayBtn")
            .addEventListener("click", cycleOverlay);

        document.getElementById("surfaceBtn")
            .addEventListener("click", toggleSurfaceROI);

        document.getElementById("saveBtn")
            .addEventListener("click", saveScreenshot);

        document.getElementById("resetBtn")
            .addEventListener("click", resetSession);

        // Bottom sheet open/close
        document.getElementById("statsBtn")
            .addEventListener("click", openSheet);

        document.getElementById("sheetClose")
            .addEventListener("click", closeSheet);

        document.getElementById("sheetBackdrop")
            .addEventListener("click", closeSheet);
    }

    /* ==========================================
       BOTTOM SHEET
    ========================================== */

    function openSheet() {
        document.getElementById("bottomSheet").classList.add("open");
        document.getElementById("sheetBackdrop").classList.add("open");
    }

    function closeSheet() {
        document.getElementById("bottomSheet").classList.remove("open");
        document.getElementById("sheetBackdrop").classList.remove("open");
    }

    /* ==========================================
       START CAMERA + LOOP
    ========================================== */

    async function start() {
        try {
            await Camera.start();

            state.running = true;
            state.frozen = false;
            state.frameCount = 0;
            state.detections = [];
            state.concreteData = null;
            state.measurement = Measurement.emptyResult();
            state.smoothRisk = 0;
            state.fpsBuffer = [];
            state.startTime = performance.now();
            state.lastFrameTime = performance.now();

            setText("scanStatus", "SCANNING");
            document.getElementById("frozenBadge").classList.add("hidden");

            loop();

        } catch (error) {
            alert("Camera cannot start. Please allow camera permission.");
            console.error(error);
        }
    }

    function loop() {
        if (!state.running) return;

        const video = document.getElementById("cameraVideo");

        if (video.readyState >= 2) {
            prepareCanvasSize();

            if (!state.frozen) {
                processFrame(video);
            }

            renderAR();
            updateHUD();
        }

        animationId = requestAnimationFrame(loop);
    }

    /* ==========================================
       CANVAS SIZE
    ========================================== */

    function prepareCanvasSize() {
        const video         = document.getElementById("cameraVideo");
        const processCanvas = document.getElementById("processCanvas");
        const arCanvas      = document.getElementById("arCanvas");

        const width  = video.videoWidth  || window.innerWidth;
        const height = video.videoHeight || window.innerHeight;

        if (processCanvas.width !== width || processCanvas.height !== height) {
            processCanvas.width  = width;
            processCanvas.height = height;
        }

        if (arCanvas.width !== width || arCanvas.height !== height) {
            arCanvas.width  = width;
            arCanvas.height = height;
        }
    }

    /* ==========================================
       FRAME PROCESSING
    ========================================== */

    function processFrame(video) {
        if (state.busyDetecting) return;

        const processCanvas = document.getElementById("processCanvas");
        const ctx = processCanvas.getContext("2d", { willReadFrequently: true });

        ctx.drawImage(video, 0, 0, processCanvas.width, processCanvas.height);
        state.frameCount++;
        state.busyDetecting = true;

        runDetection(processCanvas).finally(() => {
            state.busyDetecting = false;
        });
    }

    async function runDetection(processCanvas) {
        try {
            if (state.surfaceEnabled) {
                state.concreteData = ConcreteSurface.detect(processCanvas);
            } else {
                state.concreteData = null;
            }

            const rawDetections = await YOLODetector.detect(processCanvas, state.concreteData);
            state.measurement   = Measurement.analyseDetections(rawDetections);
            state.detections    = state.measurement.detections;

            Measurement.updateHUD(state.measurement);

            const severity   = Measurement.calculateSeverity(state.measurement);
            state.smoothRisk = lerp(state.smoothRisk, severity.score, 0.15);

        } catch (error) {
            console.error("Detection pipeline error:", error);
        }
    }

    /* ==========================================
       RENDER AR
    ========================================== */

    function renderAR() {
        const arCanvas = document.getElementById("arCanvas");
        const ctx      = arCanvas.getContext("2d");

        ctx.clearRect(0, 0, arCanvas.width, arCanvas.height);

        const t = performance.now() / 1000;

        AROverlay.drawScanlines(ctx, arCanvas, t);

        if (state.surfaceEnabled && state.concreteData) {
            AROverlay.drawConcreteROI(ctx, state.concreteData.roi, t);
        }

        AROverlay.drawHoneycomb(ctx, state.detections, state.overlayMode, t);
    }

    /* ==========================================
       HUD
    ========================================== */

    function updateHUD() {
        const now = performance.now();
        const dt  = now - state.lastFrameTime;
        state.lastFrameTime = now;

        if (dt > 0) {
            state.fpsBuffer.push(1000 / dt);
            if (state.fpsBuffer.length > 30) state.fpsBuffer.shift();
        }

        const avgFps = state.fpsBuffer.reduce((a, b) => a + b, 0) /
                       Math.max(1, state.fpsBuffer.length);

        const elapsed = state.startTime
            ? (performance.now() - state.startTime) / 1000
            : 0;

        HUD.update({
            fps:     Math.round(avgFps),
            frozen:  state.frozen,
            overlay: state.overlayLabels[state.overlayMode],
            surface: state.surfaceEnabled ? "Active" : "Off",
            voids:   state.detections.length,
            frames:  state.frameCount,
            elapsed,
            risk:    state.smoothRisk
        });
    }

    /* ==========================================
       CONTROLS
    ========================================== */

    function toggleFreeze() {
        if (!state.running) return;

        state.frozen = !state.frozen;

        document.getElementById("frozenBadge")
            .classList.toggle("hidden", !state.frozen);

        // Update button label span
        const label = document.querySelector("#freezeBtn .btn-label");
        const icon  = document.querySelector("#freezeBtn .btn-icon");
        if (label) label.textContent = state.frozen ? "Resume" : "Freeze";
        if (icon)  icon.textContent  = state.frozen ? "▶" : "⏸";
    }

    function cycleOverlay() {
        state.overlayMode = (state.overlayMode + 1) % 3;
        // Visual feedback on button label
        const label = document.querySelector("#overlayBtn .btn-label");
        if (label) label.textContent = state.overlayLabels[state.overlayMode];
    }

    function toggleSurfaceROI() {
        state.surfaceEnabled = !state.surfaceEnabled;
        ConcreteSurface.setEnabled(state.surfaceEnabled);
        setText("surfaceStatus", state.surfaceEnabled ? "Active" : "Off");

        const label = document.querySelector("#surfaceBtn .btn-label");
        if (label) label.textContent = state.surfaceEnabled ? "ROI" : "ROI Off";
    }

    function saveScreenshot() {
        if (!state.running) return;
        Exporter.saveARFrame({
            detections:   state.detections,
            measurement:  state.measurement,
            concreteData: state.concreteData
        });
    }

    function resetSession() {
        state.frameCount  = 0;
        state.detections  = [];
        state.concreteData = null;
        state.measurement = Measurement.emptyResult();
        state.smoothRisk  = 0;
        state.fpsBuffer   = [];

        HUD.reset();
        Measurement.updateHUD(state.measurement);

        const arCanvas = document.getElementById("arCanvas");
        arCanvas.getContext("2d").clearRect(0, 0, arCanvas.width, arCanvas.height);
    }

    /* ==========================================
       HELPERS
    ========================================== */

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    window.addEventListener("resize", prepareCanvasSize);
    document.addEventListener("DOMContentLoaded", init);

    return { start, resetSession };

})();
