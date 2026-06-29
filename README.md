# 📐 NexusLedger

> **Centralized Enterprise State Orchestration & Multi-Tab Industrial Operations Ledger**

NexusLedger is a high-performance, responsive React application engineered for high-velocity industrial logging, operational parameter auditing, and batch telemetry tracking. Powered by a deterministic state machine, the platform segregates temporary, volatile workspace contexts from an immutable master ledger history while enforcing strict, anti-pollution guardrails against structural data clutter.

---

## 🚀 Core Architectural Milestones

* **Temporal State Workspace Segregation:** Utilizes a dual-slice `Redux Toolkit` architecture. Short-lived multi-stage form wizard records (`formInfo` slice) are structurally decoupled from the asynchronous, historical multi-record master ledger (`explorerData` slice).
* **Polymorphic Workflow Lifecycle:** Programmatically guides data payloads through an enterprise-grade tracking matrix:
  
  **DRAFT ➔ COMPLETED ➔ PENDING REVISION ➔ REVISED**

* **Atomic Anti-Pollution Guardrails:** Implements a single-source-of-truth core preservation engine (`executeDraftSave`). When operators execute background shifts (tab switches, dashboard retreats), a customized structural emptiness evaluator filters deep text and boolean inputs—safely bypassing background unit defaults—and triggers immediate early-exit returns to block ghost rows from generating in the ledger history.
* **High-DPI Adaptive CSS Canvas:** Built natively on the modern `Tailwind CSS v4` compiler and optimized for expansive `1550px` analytical control room displays down to tablet form factors via fluid responsive constraints and rigid vertical viewport clamping (`calc(100vh)`).

---

## 🛠️ Technical Stack & Framework Registry

| Layer | Technology Profile | Architectural Purpose |
| :--- | :--- | :--- |
| **Core View Framework** | React 18+ (Hooks, Context, useMemo) | Reactive UI component tree management |
| **State Pipeline** | Redux Toolkit & Redux Persist | Deterministic finite-state machine orchestration |
| **Build System** | Vite | Ultra-fast module bundling & compilation |
| **Design Utilities** | Tailwind CSS v4 & Vanilla CSS3 | Encapsulated utility styling & High-DPI canvas limits |
| **Automation QA** | Headless Selenium WebDriver | End-to-end programmatic browser regression sweeps |
| **Data Protocol** | Native JSON Documents | Scalable schema pre-engineered for NoSQL systems |

---

## 📦 Directory Topology Overview

```text
src/
├── config/
│   └── formConfig.json         # Declarative multi-tab schema layouts & skip validation flags
├── store/
│   ├── formSlice.js            # Temporary session workspace and active parameter handlers
│   ├── explorerSlice.js        # The core master ledger repository array & CRUD actions
│   └── store.js                # Central store compiler and Redux state preservation configuration
├── components/
│   ├── Dashboard.jsx           # Main log summary matrix view & metric overview cards
│   ├── MultiTabForm.jsx        # Refactored centralized save engine & tab scroller shell
│   ├── shared/ui/
│   │   └── Modal.jsx           # Reusable validation alert and deletion confirmation interceptor
│   └── forms/
│       ├── FormTab.jsx         # Dynamic tab renderer mapping inputs fields from configuration
│       ├── FormActionRow.jsx   # Contextual forward/reverse form pagination wrappers
│       └── FormSearch.jsx      # Telemetry index locator to jump directly to deep field parameters
├── utils/
│   └── formPayloadTransformer.js # Packs final key/value configurations into deep structural JSON structures
└── styles.css                  # Tailored v4 utility classes and vanilla overrides

---

## ⚡ Data Architecture Lifecycle Pipeline

```text
 [ Add New Log ] ➔ Instantiates Unique Session Batch ID
        │
        ├──➔ [ User Enters Telemetry ] ➔ State mutations logged to temporary workspace slice
        │
        ├──➔ [ Fast Exit / Tab Change ] ➔ Runs Atomic Content Evaluation
        │          │
        │          ├─── (Form Pristine/Blank) ➔ Trigger early-exit return (Zero Database Footprint)
        │          └─── (Data Detected) ➔ executeSilentDraftBackup() ➔ Status: DRAFT / PENDING REVISION
        │
        └──➔ [ Complete Audit Review ] ➔ FormPreviewModal.jsx ➔ Schema Verification
                   │
                   └─── [ Submit Form ] ➔ Clears local scratchpads ➔ Status: COMPLETED / REVISED

```

---

## 🧪 Comprehensive Quality Assurance Framework

NexusLedger is backed by a dual-layer test architecture to ensure 100% data pass rates and absolute deployment stability.

### 1. Programmatic Headless Selenium Automation

An E2E testing profile written via **Selenium WebDriver** simulates complex human operator workflows:

* **Tab-State Preservation:** Programmatically types telemetry coordinates on Tab 1, commands pagination changes to Tab 4, and asserts that no character loss occurs during mid-session memory switches.
* **Transaction Validation:** Automatically completes complex forms, triggers a mock network write, and validates that the Dashboard Summary ribbons update ledger counts in real time.
* **Destructive Scrub Verification:** Automates clicking the draft delete dismiss button (`✕`), forces interaction with the safety confirmation interceptor modal, and verifies the complete erasure of the targeted row block from memory tracks.

### 2. Manual Exploratory & Boundary Auditing

* **Anti-Pollution Edge Isolation:** Verifies that fields initializing background metrics strings (e.g., automatically populated engineering labels like `bar`, `PSI`, or `°C`) are safely filtered out by the logic validator, confirming a blank canvas stays perfectly pristine.
* **Fluid Boundary Layout Sweeps:** Verifies container constraints, backdrop blur modal presentations, and typography alignment properties under multi-browser hardware configurations.

---

## ⚙️ Core Installation & Execution

To run NexusLedger in your local engineering workspace, execute the following commands in sequence:

### 1. Clone & Resolve Dependencies

```bash
# Clone the repository
git clone [https://github.com/your-repo/nexus-ledger.git](https://github.com/your-repo/nexus-ledger.git)

# Navigate to the project root directory
cd nexus-ledger

# Install system dependencies
npm install

```

### 2. Launch Local Compilers

```bash
# Spin up the local Vite development server instance
npm run dev

```

*Open your local browser node to the loopback target provided by Vite (typically `http://localhost:5173`) to view the interactive control interface.*

### 3. Run Production Compilation Audit

```bash
# Run the linter and perform standard system building
npm run build

```

---

## 🔮 Roadmap Engineering Preview

NexusLedger is fully pre-engineered for offline-first capabilities. The final data output pipeline scales into deeply structured JSON document trees via `buildTabGroupedPayload`. The upcoming development phase will replace the synchronous `localStorage` caching engine with a client-side **NoSQL Document Database Abstract Layer** (`PouchDB` syncing directly to a remote cluster via standard `IndexedDB` browser wires).

```

```
