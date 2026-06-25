
/* ==================================================
   AI Honeycomb Inspector v4
   Screenshot Export
   Saves Camera + AR Overlay + Measurement Metadata
================================================== */

const Exporter = (() => {

    /* ==========================================
       SAVE AR FRAME
    ========================================== */

    function saveARFrame(result = {}) {

        const video =
            document.getElementById("cameraVideo");

        const arCanvas =
            document.getElementById("arCanvas");

        if (!video || !arCanvas) {
            alert("No AR frame available.");
            return;
        }

        const exportCanvas =
            document.createElement("canvas");

        const ctx =
            exportCanvas.getContext("2d");

        exportCanvas.width =
            arCanvas.width;

        exportCanvas.height =
            arCanvas.height;

        ctx.drawImage(
            video,
            0,
            0,
            exportCanvas.width,
            exportCanvas.height
        );

        ctx.drawImage(
            arCanvas,
            0,
            0,
            exportCanvas.width,
            exportCanvas.height
        );

        drawExportFooter(
            ctx,
            exportCanvas,
            result
        );

        const timestamp =
            createTimestamp();

        downloadPNG(
            exportCanvas,
            `honeycomb_v4_ar_${timestamp}.png`
        );

        downloadJSON(
            buildReportData(
                result,
                timestamp
            ),
            `honeycomb_v4_report_${timestamp}.json`
        );
    }

    /* ==========================================
       DRAW FOOTER ON IMAGE
    ========================================== */

    function drawExportFooter(
        ctx,
        canvas,
        result
    ) {
        const measurement =
            result.measurement || {};

        const detections =
            result.detections || [];

        const totalArea =
            measurement.totalAreaText || "0.00 cm²";

        const largestArea =
            measurement.largestAreaText || "0.00 cm²";

        const footerH = 76;

        const y =
            canvas.height - footerH;

        ctx.save();

        ctx.fillStyle =
            "rgba(2, 6, 23, 0.82)";

        ctx.fillRect(
            0,
            y,
            canvas.width,
            footerH
        );

        ctx.strokeStyle =
            "rgba(0, 200, 255, 0.8)";

        ctx.lineWidth = 2;

        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();

        ctx.fillStyle =
            "#00c8ff";

        ctx.font =
            "bold 18px Arial";

        ctx.fillText(
            "AI Honeycomb Inspector v4 | YOLOv8 Web AR",
            18,
            y + 26
        );

        ctx.fillStyle =
            "#ffffff";

        ctx.font =
            "13px Arial";

        ctx.fillText(
            `Voids: ${detections.length}   Total Area: ${totalArea}   Largest: ${largestArea}`,
            18,
            y + 50
        );

        ctx.fillStyle =
            "#9ca3af";

        ctx.font =
            "11px Arial";

        ctx.fillText(
            `Scale: ${getScaleText()} cm/pixel   Generated: ${new Date().toLocaleString()}`,
            18,
            y + 66
        );

        ctx.restore();
    }

    /* ==========================================
       BUILD JSON REPORT
    ========================================== */

    function buildReportData(
        result,
        timestamp
    ) {
        const measurement =
            result.measurement ||
            Measurement.emptyResult();

        const detections =
            result.detections || [];

        const concreteData =
            result.concreteData || null;

        return {
            app:
                "AI Honeycomb Inspector v4",

            engine:
                "YOLOv8 ONNX Web AR",

            timestamp,

            scaleCmPerPixel:
                Measurement.getScale(),

            concreteSurfaceROI:
                concreteData && concreteData.roi
                    ? concreteData.roi
                    : null,

            summary: {
                voidCount:
                    detections.length,

                totalVoidAreaCm2:
                    measurement.totalAreaCm2 || 0,

                largestVoidAreaCm2:
                    measurement.largestAreaCm2 || 0,

                totalVoidAreaText:
                    measurement.totalAreaText,

                largestVoidAreaText:
                    measurement.largestAreaText
            },

            detections:
                detections.map(
                    (det, index) => ({
                        id:
                            det.id ||
                            `VOID-${index + 1}`,

                        className:
                            det.className ||
                            "Honeycomb",

                        confidence:
                            det.confidence || 0,

                        bbox:
                            det.bbox,

                        areaPx:
                            det.areaPx || 0,

                        areaCm2:
                            det.areaCm2 || 0,

                        areaText:
                            det.areaText ||
                            "0.00 cm²"
                    })
                )
        };
    }

    /* ==========================================
       DOWNLOAD HELPERS
    ========================================== */

    function downloadPNG(
        canvas,
        filename
    ) {
        const link =
            document.createElement("a");

        link.download = filename;

        link.href =
            canvas.toDataURL("image/png");

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    function downloadJSON(
        data,
        filename
    ) {
        const blob =
            new Blob(
                [
                    JSON.stringify(
                        data,
                        null,
                        2
                    )
                ],
                {
                    type: "application/json"
                }
            );

        const url =
            URL.createObjectURL(blob);

        const link =
            document.createElement("a");

        link.download = filename;
        link.href = url;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        URL.revokeObjectURL(url);
    }

    function createTimestamp() {
        return new Date()
            .toISOString()
            .replace(/[:.]/g, "-");
    }

    function getScaleText() {

        if (
            typeof Measurement !== "undefined" &&
            Measurement.getScale
        ) {
            return Measurement
                .getScale()
                .toFixed(4);
        }

        return "0.0000";
    }

    return {
        saveARFrame
    };

})();
