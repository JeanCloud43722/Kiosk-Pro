# KioskPackagePro Architecture Documentation

KioskPackagePro is a high-performance, mobile-first web application designed for kiosk owners to manage incoming and outgoing packages efficiently. It leverages modern web technologies and AI to automate data entry and tracking.

## 1. High-Level Overview

The application is built as a Single Page Application (SPA) using **React 19** and **TypeScript**. It follows a "Local-First" philosophy, using **IndexedDB** for data persistence, ensuring high performance and offline capability.

### Core Workflows
1.  **Package Intake**: Camera capture -> AI-powered OCR (Gemini) -> Data Confirmation.
2.  **Location Linking**: QR/Barcode scanning (jsQR) -> Association with the last scanned package.
3.  **Inventory Management**: Search, filter, and mark items as "Picked Up".

---

## 2. Technical Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, TypeScript | UI Logic and Component Architecture |
| **Styling** | Tailwind CSS | Utility-first responsive design |
| **AI / OCR** | Google Gemini 3 Flash | Extracting text from shipping labels |
| **Scanning** | jsQR | Real-time QR/Barcode decoding |
| **Database** | IndexedDB | Local persistent storage |
| **Build Tool** | Vite | Fast development and optimized builds |

---

## 3. File Structure

```text
/src
├── components/
│   ├── Scanner.tsx          # Package OCR scanner (Camera + Gemini)
│   ├── LocationScanner.tsx  # QR/Barcode scanner (Camera + jsQR)
│   ├── Inventory.tsx        # Main list view (Stockpile)
│   ├── Search.tsx           # Search interface with useMemo filtering
│   └── PackageCard.tsx      # Reusable package display component
├── services/
│   ├── db.ts                # IndexedDB wrapper for local storage
│   └── ocrService.ts        # AI integration for text extraction
├── App.tsx                  # Root component, routing, and global state
├── types.ts                 # TypeScript interfaces and types
└── index.tsx                # React entry point
```

## 4. System Architecture & Data Flow

### 3.1 Data Model (`types.ts`)
The core entity is the `Package`:
```typescript
interface Package {
  id: string;          // UUID
  name: string;        // Recipient name (from OCR)
  trackingId: string;  // Tracking number (from OCR)
  receivedAt: string;  // ISO Timestamp
  pickedUp: boolean;   // Status flag
  locationCode: string | null; // Shelf/Bin ID
}
```

### 3.2 State Management (`App.tsx`)
The application uses a centralized state pattern in the root component:
- **`packages`**: The source of truth for all inventory items.
- **`activeTab`**: Controls the navigation and view rendering.
- **`locationTargetId`**: Tracks which package is currently being assigned a location.

### 3.3 Persistence Layer (`services/db.ts`)
A wrapper around the browser's **IndexedDB** API.
- **`init()`**: Sets up the `KioskPackageDB`.
- **`save(pkg)`**: Uses `put` to insert or update records.
- **`getAll()`**: Retrieves the full inventory for the initial load.

### 4.4 Auto-Switching Workflow
A key UX feature is the seamless transition between scanning a package and assigning its location:
1.  **Scanner Component**: Captures image -> Gemini extracts data.
2.  **Confirmation**: User clicks "Confirm".
3.  **App.tsx `handlePackageScanned`**:
    - Saves package to IndexedDB.
    - Sets `locationTargetId` to the new package ID.
    - **Automatically switches** `activeTab` to `'set-location'`.
4.  **LocationScanner Component**: User points camera at a shelf QR code.
5.  **jsQR**: Decodes the code instantly.
6.  **App.tsx `handleLocationScanned`**:
    - Updates the package in IndexedDB with the `locationCode`.
    - Switches `activeTab` to `'inventory'`.
    - Clears `locationTargetId`.

---

## 5. Key Components

### 4.1 AI OCR Service (`services/ocrService.ts`)
Uses the `@google/genai` SDK to communicate with Gemini.
- **Prompting**: Uses a specific system instruction to extract `name` and `trackingId`.
- **Structured Output**: Forces the model to return JSON using `responseMimeType: "application/json"` and a defined `responseSchema`.

### 4.2 Package Scanner (`components/Scanner.tsx`)
- **MediaDevices API**: Accesses the rear camera (`facingMode: 'environment'`).
- **Capture**: Draws a video frame to a hidden canvas, converts it to base64, and sends it to the OCR service.
- **UI**: Features a "scanning frame" overlay and a confirmation modal to verify AI results.

### 4.3 Location Scanner (`components/LocationScanner.tsx`)
- **Real-time Decoding**: Uses a `setInterval` loop (200ms) to analyze video frames.
- **jsQR Integration**: Decodes QR/Barcodes directly in the browser without server calls.
- **Workflow Integration**: Automatically links the scanned code to the `locationTargetId` defined in `App.tsx`.

### 4.4 Inventory & Search (`components/Inventory.tsx`, `Search.tsx`)
- **Filtering**: Real-time filtering of the `packages` array based on name or tracking ID.
- **Actions**: Provides quick buttons for "Pick Up" (marking as done) and "Scan Location" (re-linking).

---

## 5. UI/UX Design Principles

- **Mobile-First**: All interactions are optimized for thumb-reach (bottom nav, large buttons).
- **Visual Feedback**:
    - Emerald green accents for success/active states.
    - Animated "scan line" to indicate active camera processing.
    - Spinners and status badges for async operations.
- **Performance**: 
    - Camera streams are cleaned up on unmount to save battery.
    - IndexedDB operations are asynchronous to prevent UI blocking.

---

## 6. Security & Permissions

- **Camera Access**: Requested via `navigator.mediaDevices.getUserMedia`. Permissions are declared in `metadata.json`.
- **API Keys**: The Gemini API key is managed via environment variables (`process.env.GEMINI_API_KEY`) and injected during the Vite build process.
