
# AI Honeycomb Inspector v4

## YOLOv8 Web AR Concrete Inspection System

---

## Overview

AI Honeycomb Inspector v4 is a browser-based AI inspection platform developed for civil engineers, QA/QC engineers, site inspectors, contractors, researchers, and infrastructure professionals.

The system combines:

* YOLOv8 Honeycomb Detection
* Concrete Surface Filtering
* Augmented Reality Visualization
* Real-Time Area Measurement (cm²)
* Screenshot and Report Export

Unlike previous versions that relied on traditional image-processing techniques, v4 uses a trained YOLOv8 deep-learning model to identify honeycomb defects on concrete surfaces.

---

# Key Features

## YOLOv8 AI Detection

The system uses a trained YOLOv8 model to detect:

* Honeycomb Concrete
* Surface Voids
* Compaction Defects
* Porous Concrete Regions

Output:

* Bounding Box
* Confidence Score
* Defect Count

---

## Concrete Surface ROI Filter

Before running AI detection, the system identifies the likely concrete surface region.

Purpose:

* Ignore sky
* Ignore workers
* Ignore tools
* Ignore vehicles
* Ignore background objects

Only the concrete surface is analyzed.

---

## Real-Time AR Visualization

The detected defects are displayed using AR overlays:

* Glow Bounding Box
* Corner Brackets
* Detection Tags
* Confidence Bars
* Scanline Effects
* Concrete ROI Boundary

---

## Area Measurement (cm²)

Each detected defect is measured and converted from pixel area to real-world area.

Formula:

Area (cm²) = Pixel Area × (cm per pixel)²

Outputs:

* Individual Void Area
* Total Void Area
* Largest Void Area

---

## Severity Assessment

The system estimates defect severity based on:

* Total Defect Area
* Largest Defect Area
* Number of Defects

Levels:

### Minor

Small isolated defects.

### Moderate

Medium-sized honeycomb regions requiring repair.

### Severe

Large or widespread honeycomb defects requiring immediate engineering assessment.

---

## Screenshot Export

Export includes:

* Original Camera Frame
* AR Overlay
* Measurement Information
* Defect Statistics

Output Format:

* PNG Image

---

## Inspection Report Export

Exported JSON contains:

* Detection Results
* Bounding Boxes
* Confidence Scores
* Defect Areas
* Concrete ROI Information
* Inspection Metadata

---

# System Architecture

Camera

↓

Concrete Surface Filter

↓

YOLOv8 ONNX Model

↓

Honeycomb Detection

↓

Area Measurement

↓

AR Overlay

↓

Export Report

---

# Project Structure

AI_Honeycomb_Inspector_v4

├── index.html

├── manifest.json

├── README.md

│

├── css

│ └── style.css

│

├── js

│ ├── app.js

│ ├── camera.js

│ ├── concrete-surface.js

│ ├── measurement.js

│ ├── yolo-detector.js

│ ├── ar-overlay.js

│ ├── hud.js

│ └── export.js

│

├── models

│ └── best.onnx

│

└── assets

---

# YOLOv8 Model Training

## Dataset Preparation

Recommended dataset structure:

dataset/

├── images/

│ ├── train/

│ ├── valid/

│ └── test/

│

└── labels/

├── train/

├── valid/

└── test/

Class:

0 = Honeycomb

---

## Train Model

Install Ultralytics:

```bash
pip install ultralytics
```

Train:

```bash
yolo detect train \
model=yolov8n.pt \
data=data.yaml \
epochs=100 \
imgsz=640
```

Output:

```text
runs/detect/train/weights/best.pt
```

---

# Export to ONNX

Convert YOLO model:

```bash
yolo export \
model=best.pt \
format=onnx \
imgsz=640
```

Output:

```text
best.onnx
```

Place file:

```text
models/best.onnx
```

---

# Running Locally

Because browsers block camera access from local files, use a local server.

Example:

```bash
python -m http.server 8000
```

Open:

```text
http://localhost:8000
```

Allow camera permission.

---

# Deployment

## GitHub Pages

1. Upload project to GitHub
2. Open Repository Settings
3. Select Pages
4. Deploy from Branch
5. Choose main branch
6. Save

---

## Vercel

1. Push repository to GitHub
2. Import repository into Vercel
3. Deploy

No backend required.

---

# Recommended Dataset Collection

For best results, collect:

### Honeycomb Concrete

* Minor
* Moderate
* Severe

### Different Conditions

* Indoor
* Outdoor
* Daylight
* Night
* Wet Surface
* Dry Surface

### Different Structures

* Columns
* Beams
* Walls
* Slabs
* Foundations
* Retaining Walls

Recommended:

* 1,000+ images minimum
* 3,000+ images preferred

---

# Known Limitations (v4)

Current Concrete ROI Filter is rule-based.

May struggle with:

* Painted Concrete
* Very Dark Concrete
* Heavy Shadows
* Similar-Colored Backgrounds

---

# Future Roadmap

## Version 5

### Concrete Surface Segmentation AI

Replace rule-based ROI filter with:

* YOLOv8 Segmentation
* DeepLabV3
* Mask2Former

Benefits:

* Precise Concrete Boundaries
* Better False Positive Rejection

---

## Version 6

### CivilGPT Integration

AI-powered construction assistant.

Features:

* Repair Recommendations
* Method Statements
* QA/QC Checklists
* Concrete Repair Guidance
* Construction Knowledge Base
* RAG + LLM Integration

---

# Author

Construction Intelligence Laboratory (CI-Lab)

Civil Engineering + Artificial Intelligence

2026
