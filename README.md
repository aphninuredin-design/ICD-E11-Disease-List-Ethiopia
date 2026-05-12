# 🇪🇹 Ethio-ICD E11 Tool

A browser-based ICD-11 reference app for Ethiopian primary hospitals, built from the Ethiopia Simplified Version (ESV_ICD11). This tool helps clinicians and health information officers search codes, browse categories, and copy ICD-11 codes quickly.

## 🔥 What’s New
* Full ESV ICD-11 dataset implementation with **806 disease entries**.
* Complete support for **26 medical categories** including all chapters from the Ethiopia Simplified Version.
* Category dropdown now displays **clean category names** only, without chapter prefixes or emoji labels.
* Search and filter are fully synced with the results count.
* Category selection updates the displayed disease count immediately.

## ✨ Key Features
* 🔍 **Instant Search:** filter by ICD-11 code or disease description.
* 📂 **Category Filtering:** browse by full category names and chapter groups.
* 📊 **Result Sync:** dynamic disease count updates during filtering.
* 📋 **Copy Code:** one-click copy for ICD-11 codes.
* ⭐ **Pinned Diagnoses:** save frequent diagnoses for quick access.
* 🧭 **View Modes:** switch between table view and card view.
* 📱 **Responsive PWA Design:** mobile optimized with offline support.

## 📦 Included Files
* `index.html` — main application markup and UI structure.
* `icd_data.js` / `icd_data.json` — full ICD-11 dataset for the app.
* `script.js` — app logic for search, filtering, sorting, and UI interaction.
* `manifest.json` — PWA install metadata.

## 🛠 Tech Stack
* **HTML5** + **Tailwind CSS** for responsive UI.
* **Vanilla JavaScript** for app behavior.
* **Client-side JSON dataset** for fast offline lookups.

## 🚀 Usage
1. Open `index.html` in a browser.
2. Use the search bar to query by ICD-11 code or description.
3. Open the category dropdown to filter by chapter.
4. Click the copy button to copy a code to the clipboard.

## 📌 Notes
* The app now contains the full ESV ICD-11 dataset and 26 categories.
* Category labels are cleaned to show only descriptive names.
* The dataset is stored in `icd_data.js` and loaded directly in the browser.

---
*This tool is intended as a reference for trained healthcare professionals and should be used in accordance with Ministry of Health guidelines.*