
/* ==================================================
   AI Honeycomb Inspector v4
   Measurement Engine
   Purpose:
   Convert detected honeycomb void pixel area into cm².
================================================== */

const Measurement = (() => {

    const DEFAULT_SCALE_CM_PER_PIXEL = 0.05;

    let scaleCmPerPixel = DEFAULT_SCALE_CM_PER_PIXEL;

    /* ==========================================
       SETUP
    ========================================== */

    function init() {
        const input = document.getElementById("scaleInput");

        if (!input) return;

        scaleCmPerPixel =
            parseFloat(input.value) ||
            DEFAULT_SCALE_CM_PER_PIXEL;

        input.addEventListener("input", () => {
            const value = parseFloat(input.value);

            if (
                Number.isFinite(value) &&
                value > 0
            ) {
                scaleCmPerPixel = value;
            }
        });
    }

    /* ==========================================
       MAIN MEASUREMENT
    ========================================== */

    function analyseDetections(detections) {

        if (!Array.isArray(detections)) {
            return emptyResult();
        }

        let totalAreaCm2 = 0;
        let largestAreaCm2 = 0;

        const measuredDetections =
            detections.map((det, index) => {

                const areaPx =
                    getPixelArea(det);

                const areaCm2 =
                    pixelAreaToCm2(areaPx);

                totalAreaCm2 += areaCm2;

                largestAreaCm2 =
                    Math.max(
                        largestAreaCm2,
                        areaCm2
                    );

                return {
                    ...det,

                    id: det.id || `VOID-${index + 1}`,

                    areaPx,

                    areaCm2,

                    areaText:
                        `${areaCm2.toFixed(2)} cm²`
                };
            });

        return {
            detections: measuredDetections,
            totalAreaCm2,
            largestAreaCm2,
            totalAreaText:
                `${totalAreaCm2.toFixed(2)} cm²`,
            largestAreaText:
                `${largestAreaCm2.toFixed(2)} cm²`
        };
    }

    /* ==========================================
       PIXEL AREA
    ========================================== */

    function getPixelArea(det) {

        if (
            typeof det.areaPx === "number" &&
            det.areaPx > 0
        ) {
            return det.areaPx;
        }

        if (
            det.bbox &&
            typeof det.bbox.w === "number" &&
            typeof det.bbox.h === "number"
        ) {
            return det.bbox.w * det.bbox.h;
        }

        return 0;
    }

    /* ==========================================
       CONVERSION
    ========================================== */

    function pixelAreaToCm2(areaPx) {
        return (
            areaPx *
            scaleCmPerPixel *
            scaleCmPerPixel
        );
    }

    function cm2ToPixelArea(areaCm2) {
        return (
            areaCm2 /
            (
                scaleCmPerPixel *
                scaleCmPerPixel
            )
        );
    }

    /* ==========================================
       SEVERITY SUPPORT
       This is a prototype engineering estimate.
    ========================================== */

    function calculateSeverity(measurement) {

        if (!measurement) {
            return {
                score: 0,
                label: "MINOR"
            };
        }

        const totalArea =
            measurement.totalAreaCm2 || 0;

        const largestArea =
            measurement.largestAreaCm2 || 0;

        const count =
            measurement.detections
                ? measurement.detections.length
                : 0;

        const areaFactor =
            Math.min(totalArea / 150, 1);

        const largestFactor =
            Math.min(largestArea / 80, 1);

        const countFactor =
            Math.min(count / 6, 1);

        const score =
            Math.min(
                1,
                areaFactor * 0.45 +
                largestFactor * 0.35 +
                countFactor * 0.20
            );

        let label = "MINOR";

        if (score >= 0.7) {
            label = "SEVERE";
        } else if (score >= 0.4) {
            label = "MODERATE";
        }

        return {
            score,
            label
        };
    }

    /* ==========================================
       HUD UPDATE
    ========================================== */

    function updateHUD(measurement) {

        const totalEl =
            document.getElementById("totalAreaCm2");

        const largestEl =
            document.getElementById("largestAreaCm2");

        if (totalEl) {
            totalEl.textContent =
                measurement.totalAreaText;
        }

        if (largestEl) {
            largestEl.textContent =
                measurement.largestAreaText;
        }
    }

    /* ==========================================
       SCALE
    ========================================== */

    function setScale(value) {

        if (
            Number.isFinite(value) &&
            value > 0
        ) {
            scaleCmPerPixel = value;
        }
    }

    function getScale() {
        return scaleCmPerPixel;
    }

    /* ==========================================
       EMPTY RESULT
    ========================================== */

    function emptyResult() {
        return {
            detections: [],
            totalAreaCm2: 0,
            largestAreaCm2: 0,
            totalAreaText: "0.00 cm²",
            largestAreaText: "0.00 cm²"
        };
    }

    return {
        init,
        analyseDetections,
        calculateSeverity,
        updateHUD,
        pixelAreaToCm2,
        cm2ToPixelArea,
        setScale,
        getScale,
        emptyResult
    };

})();
