/* ==================================================
   AI Honeycomb Inspector v4
   HUD Controller — Mobile-First Redesign
   Updates live strip + bottom sheet stats
================================================== */

const HUD = (() => {

    function update(data) {
        // Bottom sheet stats
        setText("fpsValue",     data.fps);
        setText("surfaceStatus", data.surface);
        setText("frameCount",   data.frames);
        setText("elapsedTime",  formatTime(data.elapsed));
        setText("activeVoids",  data.voids);

        // Live strip (always visible)
        setText("voidCount",    data.voids);

        updateStatusDot(data);
        updateScanStatus(data);
        updateSeverity(data.risk);
    }

    /* ==========================================
       STATUS DOT (live strip)
    ========================================== */

    function updateStatusDot(data) {
        const dot = document.getElementById("statusDot");
        if (!dot) return;

        dot.className = "dot";

        if (data.frozen) {
            dot.classList.add("warning");
        } else if (data.risk >= 0.7) {
            dot.classList.add("severe");
        }
        // else stays green (default)
    }

    function updateScanStatus(data) {
        const status = document.getElementById("scanStatus");
        if (!status) return;

        if (data.frozen) {
            status.textContent  = "FROZEN";
            status.style.color  = "#ffb000";
        } else {
            status.textContent  = "SCANNING";
            status.style.color  = "#00dc64";
        }
    }

    /* ==========================================
       SEVERITY — updates both live strip + sheet
    ========================================== */

    function updateSeverity(risk) {
        const safeRisk = Number.isFinite(risk) ? risk : 0;
        const percent  = Math.round(safeRisk * 100);

        let color = "#00dc64";
        let label = "MINOR";

        if (safeRisk >= 0.7) {
            color = "#ff4040";
            label = "SEVERE";
        } else if (safeRisk >= 0.4) {
            color = "#ffb000";
            label = "MODERATE";
        }

        // Live strip
        const fill        = document.getElementById("severityFill");
        const riskPercent = document.getElementById("riskPercent");
        const sevLabel    = document.getElementById("severityLabel");

        if (fill)        fill.style.width       = `${percent}%`;
        if (riskPercent) { riskPercent.textContent = `${percent}%`; riskPercent.style.color = color; }
        if (sevLabel)    { sevLabel.textContent   = label;           sevLabel.style.color    = color; }

        // Bottom sheet
        const fillSheet  = document.getElementById("severityFillSheet");
        const sheetPct   = document.getElementById("sheetRiskPercent");
        const sheetLabel = document.getElementById("sheetSeverityLabel");

        if (fillSheet)  fillSheet.style.width       = `${percent}%`;
        if (sheetPct)   { sheetPct.textContent       = `${percent}%`; sheetPct.style.color  = color; }
        if (sheetLabel) { sheetLabel.textContent      = label;         sheetLabel.style.color = color; }
    }

    /* ==========================================
       RESET
    ========================================== */

    function reset() {
        setText("scanStatus",    "READY");
        setText("modelStatus",   "Not Loaded");
        setText("fpsValue",      "0");
        setText("surfaceStatus", "Active");
        setText("voidCount",     "0");
        setText("frameCount",    "0");
        setText("elapsedTime",   "00:00");
        setText("activeVoids",   "0");
        setText("riskPercent",   "0%");
        setText("severityLabel", "MINOR");
        setText("sheetRiskPercent",   "0%");
        setText("sheetSeverityLabel", "MINOR");

        const green = "#00dc64";

        colorEl("scanStatus",         green);
        colorEl("severityLabel",      green);
        colorEl("riskPercent",        green);
        colorEl("sheetRiskPercent",   green);
        colorEl("sheetSeverityLabel", green);

        widthEl("severityFill",      "0%");
        widthEl("severityFillSheet", "0%");

        const dot = document.getElementById("statusDot");
        if (dot) dot.className = "dot";

        const modelBadge = document.getElementById("modelBadge");
        if (modelBadge) {
            modelBadge.textContent       = "MODEL LOADING";
            modelBadge.style.background  = "#ffb000";
            modelBadge.style.color       = "#000";
        }
    }

    /* ==========================================
       HELPERS
    ========================================== */

    function setText(id, value) {
        const el = document.getElementById(id);
        if (el) el.textContent = value;
    }

    function colorEl(id, color) {
        const el = document.getElementById(id);
        if (el) el.style.color = color;
    }

    function widthEl(id, width) {
        const el = document.getElementById(id);
        if (el) el.style.width = width;
    }

    function formatTime(seconds) {
        const s = Number.isFinite(seconds) ? seconds : 0;
        const m = Math.floor(s / 60);
        const r = Math.floor(s % 60);
        return String(m).padStart(2, "0") + ":" + String(r).padStart(2, "0");
    }

    return { update, reset };

})();
