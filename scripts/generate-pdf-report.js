import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const rootDir = process.cwd();

function getBase64Image(filename) {
  const filePath = path.join(rootDir, filename);
  if (!fs.existsSync(filePath)) return "";
  const buf = fs.readFileSync(filePath);
  return `data:image/png;base64,${buf.toString("base64")}`;
}

const imgUserSpec = getBase64Image("screenshot_user_spec.png");
const imgVision = getBase64Image("screenshot_vision.png");
const imgDemands = getBase64Image("screenshot_demands.png");
const imgEvents = getBase64Image("screenshot_events.png");
const imgHome = getBase64Image("screenshot_home.png");
const imgImpact = getBase64Image("screenshot_impact.png");
const imgAdd = getBase64Image("screenshot_add.png");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>SECOND PLATE — Comprehensive System Architecture & UI/Code Specification</title>
  <style>
    @page {
      size: A4;
      margin: 14mm 14mm 16mm 14mm;
      @bottom-right {
        content: counter(page) " / " counter(pages);
      }
    }
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #1e293b;
      background: #ffffff;
      line-height: 1.55;
      font-size: 10pt;
    }
    .page-break {
      page-break-before: always;
      break-before: page;
    }
    .avoid-break {
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    /* Document Header */
    .doc-header {
      border-bottom: 2px solid #059669;
      padding-bottom: 14px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .brand-title {
      font-size: 20pt;
      font-weight: 900;
      color: #064e3b;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 10pt;
      font-weight: 600;
      color: #059669;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .meta-box {
      text-align: right;
      font-size: 8.5pt;
      color: #64748b;
    }
    .meta-box strong {
      color: #0f172a;
    }

    /* Headings */
    h1 {
      font-size: 16pt;
      font-weight: 800;
      color: #064e3b;
      margin: 18px 0 10px;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 4px;
    }
    h2 {
      font-size: 12pt;
      font-weight: 700;
      color: #0f766e;
      margin: 14px 0 6px;
    }
    h3 {
      font-size: 10.5pt;
      font-weight: 700;
      color: #1e293b;
      margin: 10px 0 4px;
    }
    p {
      margin-bottom: 8px;
    }
    
    /* Cards and Containers */
    .card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
    }
    .card-highlight {
      background: #f0fdf4;
      border: 1px solid #86efac;
    }
    .card-amber {
      background: #fffbeb;
      border: 1px solid #fde68a;
    }
    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 999px;
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .badge-emerald { background: #d1fae5; color: #065f46; }
    .badge-amber { background: #fef3c7; color: #92400e; }
    .badge-teal { background: #ccfbf1; color: #115e59; }
    .badge-blue { background: #dbeafe; color: #1e40af; }
    .badge-purple { background: #f3e8ff; color: #6b21a8; }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 10px 0 14px;
      font-size: 8.5pt;
    }
    th, td {
      border: 1px solid #cbd5e1;
      padding: 6px 8px;
      text-align: left;
      vertical-align: top;
    }
    th {
      background: #f1f5f9;
      font-weight: 700;
      color: #334155;
    }
    tr:nth-child(even) td {
      background: #f8fafc;
    }
    
    /* Code Styling */
    code {
      font-family: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, Courier, monospace;
      font-size: 8pt;
      background: #f1f5f9;
      padding: 2px 4px;
      border-radius: 4px;
      color: #0f172a;
    }
    .code-block {
      background: #0f172a;
      color: #f8fafc;
      padding: 10px;
      border-radius: 6px;
      font-family: "SFMono-Regular", Consolas, monospace;
      font-size: 7.8pt;
      line-height: 1.45;
      overflow-x: hidden;
      margin: 8px 0 12px;
    }
    
    /* Screenshots */
    .screenshot-container {
      margin: 10px 0 14px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      overflow: hidden;
      background: #f1f5f9;
    }
    .screenshot-container img {
      width: 100%;
      display: block;
      max-height: 380px;
      object-fit: contain;
      background: #ffffff;
    }
    .screenshot-caption {
      padding: 6px 10px;
      font-size: 8pt;
      font-weight: 600;
      color: #475569;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
    }

    /* Key-Value Pair Grid */
    .spec-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin: 10px 0;
    }
    .spec-item {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 10px;
    }
    .spec-label {
      font-size: 7.5pt;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
    }
    .spec-val {
      font-size: 9pt;
      font-weight: 600;
      color: #0f172a;
      margin-top: 2px;
    }
  </style>
</head>
<body>

  <!-- ================= PAGE 1 ================= -->
  <div class="doc-header">
    <div>
      <div class="brand-title">SECOND PLATE</div>
      <div class="brand-subtitle">System Architecture, UI Specifications & Code Index</div>
    </div>
    <div class="meta-box">
      <div><strong>Document Version:</strong> 2.4.0 (Enterprise Spec)</div>
      <div><strong>Platform:</strong> Agent-Native · React Router 8</div>
      <div><strong>Date:</strong> November 23, 2026</div>
      <div><strong>Hub:</strong> Bhubaneswar, Odisha</div>
    </div>
  </div>

  <section>
    <h1>1. Executive Summary & Tech Stack Matrix</h1>
    <p>
      <strong>SECOND PLATE</strong> is an intelligent food rescue and zero-landfill redistribution platform. It connects banquet halls, hotel canteens, wholesale agri mandis, NGOs, night shelters, animal gaushalas, and volunteer logistics coordinators.
    </p>

    <div class="spec-grid">
      <div class="spec-item">
        <div class="spec-label">Core Frontend Framework</div>
        <div class="spec-val">React 19.2.7 & React Router 8.1.0 (Framework Mode)</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">Language & Typing</div>
        <div class="spec-val">TypeScript 7.0 / 5.x (Strict Typing, Exact Optional Properties)</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">Styling & Design System</div>
        <div class="spec-val">Tailwind CSS v4.3.2 + @agent-native/toolkit + Radix UI</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">Typography / Primary UI Font</div>
        <div class="spec-val">Inter Variable (@fontsource-variable/inter) 100-900 weights</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">Iconography</div>
        <div class="spec-val">Tabler Icons React (@tabler/icons-react v3.44.0)</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">State & Data Store</div>
        <div class="spec-val">Zero-Sync Reactive Store (useSyncExternalStore + localStorage)</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">Server & Runtime Engine</div>
        <div class="spec-val">Nitro v3 + H3 v2 + Node.js v26.13.1 + Vite 8.1.0</div>
      </div>
      <div class="spec-item">
        <div class="spec-label">Database Architecture</div>
        <div class="spec-val">Embedded PGlite (WebAssembly PostgreSQL) + Drizzle ORM</div>
      </div>
    </div>
  </section>

  <section class="avoid-break" style="margin-top: 15px;">
    <h1>2. Design System Tokens & Typography</h1>
    <table>
      <thead>
        <tr>
          <th>UI Element</th>
          <th>Token / Style</th>
          <th>Hex / HSL Code</th>
          <th>Usage & Visual Semantics</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><strong>Primary Font</strong></td>
          <td><code>Inter Variable</code></td>
          <td>Font weights 400, 600, 700, 900</td>
          <td>Body copy, labels, headers, dashboard analytics</td>
        </tr>
        <tr>
          <td><strong>Mono Font</strong></td>
          <td><code>SFMono, Consolas, monospace</code></td>
          <td>System font stack</td>
          <td>Timer readouts, batch ids, portion counters</td>
        </tr>
        <tr>
          <td><strong>Primary Brand</strong></td>
          <td><code>--primary</code></td>
          <td><code>hsl(130, 54%, 19%)</code> / <code>#144d29</code></td>
          <td>Deep Forest Green — Agriculture, food security, stability</td>
        </tr>
        <tr>
          <td><strong>Tier 1 Accent</strong></td>
          <td><code>emerald-500</code></td>
          <td><code>#10b981</code> / <code>#059669</code></td>
          <td>Human relief, verified fresh batches, NGO direct meals</td>
        </tr>
        <tr>
          <td><strong>Tier 2 Accent</strong></td>
          <td><code>amber-500</code></td>
          <td><code>#f59e0b</code> / <code>#d97706</code></td>
          <td>Animal feed, Gaushala cattle batches, urgent cutoffs</td>
        </tr>
        <tr>
          <td><strong>Tier 3 Accent</strong></td>
          <td><code>teal-500</code></td>
          <td><code>#14b8a6</code> / <code>#0d9488</code></td>
          <td>Compost, organic bio-energy, biomethanation digesters</td>
        </tr>
        <tr>
          <td><strong>Background</strong></td>
          <td><code>--background</code></td>
          <td><code>hsl(90, 25%, 97%)</code> / <code>#f7f9f4</code></td>
          <td>Soft organic warm canvas (light mode)</td>
        </tr>
        <tr>
          <td><strong>Cards / Surfaces</strong></td>
          <td><code>--card</code></td>
          <td><code>#ffffff</code> with <code>rgba(0,0,0,0.04)</code> border</td>
          <td>Elevated cards with 1.5rem to 2rem border-radius</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="avoid-break">
    <h1>3. The Requirements Spec from User Screenshot</h1>
    <p>
      The following message screenshot defined the feature expansion requested by the leadership team:
    </p>
    <div class="screenshot-container">
      ${imgUserSpec ? `<img src="${imgUserSpec}" alt="User Screenshot Specification" />` : `<div style="padding: 20px; text-align: center;">[User Requirement Screenshot]</div>`}
      <div class="screenshot-caption">
        <span>Figure 1: Original Product Strategy & Feature Requirement Messages</span>
        <span>Requirement Source: User Briefing</span>
      </div>
    </div>
  </section>

  <!-- ================= PAGE 2 ================= -->
  <div class="page-break"></div>

  <div class="doc-header">
    <div>
      <div class="brand-title">SECOND PLATE · Feature Architecture</div>
      <div class="brand-subtitle">Page & Code Inventory</div>
    </div>
    <div class="meta-box">
      <div>Section: Pages, Code & UI Inventory</div>
    </div>
  </div>

  <section>
    <h1>4. Complete Page, Route & Code File Inventory</h1>
    <table>
      <thead>
        <tr>
          <th>Route</th>
          <th>File Location</th>
          <th>Primary Component</th>
          <th>Feature Responsibilities</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td><code>/</code></td>
          <td><code>app/routes/_index.tsx</code></td>
          <td><code>HomeRoute</code></td>
          <td>Role-aware routing (ProviderView, NgoView, VolunteerView) based on active demo role</td>
        </tr>
        <tr>
          <td><code>/demands</code></td>
          <td><code>app/routes/demands.tsx</code></td>
          <td><code>DemandsRoute</code></td>
          <td>NGO urgent meal demand broadcast board, deadline timers (e.g. 9:00 PM), and donor pledge modal</td>
        </tr>
        <tr>
          <td><code>/events</code></td>
          <td><code>app/routes/events.tsx</code></td>
          <td><code>EventsRoute</code></td>
          <td>Solidarity campaigns, World Food Day (Oct 16) 10,000-meal drive, animal outreach Sunday drives</td>
        </tr>
        <tr>
          <td><code>/vision</code></td>
          <td><code>app/routes/vision.tsx</code></td>
          <td><code>VisionRoute</code></td>
          <td>100% Zero-Landfill circular charter, 3-tier cascade breakdown, interactive city cascade slider</td>
        </tr>
        <tr>
          <td><code>/impact</code></td>
          <td><code>app/routes/impact.tsx</code></td>
          <td><code>ImpactRoute</code></td>
          <td>EPA WARM ecological savings (CO2, water, trees) + 3-tier cascade distribution statistics</td>
        </tr>
        <tr>
          <td><code>/add</code></td>
          <td><code>app/routes/add.tsx</code></td>
          <td><code>AddRoute</code></td>
          <td>Surplus food publication form with 3-tier destination selector and circular fallback toggle</td>
        </tr>
        <tr>
          <td><code>/map</code></td>
          <td><code>app/routes/map.tsx</code></td>
          <td><code>MapRoute</code></td>
          <td>SVG geographic surplus radar, distance calculation from DEMO_BASE, and tier markers</td>
        </tr>
        <tr>
          <td><code>/profile</code></td>
          <td><code>app/routes/profile.tsx</code></td>
          <td><code>ProfileRoute</code></td>
          <td>User profile, organization credentials, FSSAI compliance declarations, and role management</td>
        </tr>
        <tr>
          <td><code>Shared Store</code></td>
          <td><code>app/lib/second-plate.ts</code></td>
          <td><code>useSecondPlateStore</code></td>
          <td>Global reactive state: listings, donations, demands, events, seed data, and persistent actions</td>
        </tr>
        <tr>
          <td><code>Navigation</code></td>
          <td><code>app/components/second-plate/app-shell.tsx</code></td>
          <td><code>AppShell</code></td>
          <td>Desktop header with adaptive role switcher, mobile bottom nav, live ticker, and layout shell</td>
        </tr>
      </tbody>
    </table>
  </section>

  <section class="avoid-break" style="margin-top: 15px;">
    <h1>5. Detailed Feature Breakdown: The 3-Tier Cascade</h1>
    <div class="card card-highlight">
      <h3 style="color: #065f46;">🔄 Hierarchical Food Redirection Architecture</h3>
      <p>
        Implemented in <code>app/lib/second-plate.ts</code> and exposed in <code>add-food-form.tsx</code>, <code>primitives.tsx</code>, <code>ngo-view.tsx</code>, <code>provider-view.tsx</code>, and <code>vision.tsx</code>:
      </p>
      <ul style="margin-left: 20px; font-size: 8.5pt;">
        <li><strong>Tier 1 — People & NGOs:</strong> <code>destinationTier: "people"</code>. Filtered strictly for fresh, verified hot-held (&gt;65°C) or cold-held (&lt;4°C) batches.</li>
        <li><strong>Tier 2 — Animal Feed & Gaushalas:</strong> <code>destinationTier: "animals"</code>. Safe unsold bakery loaves, cooked grains, and crisp produce greens routed to cattle shelters and street animal feeders.</li>
        <li><strong>Tier 3 — Compost & Biogas:</strong> <code>destinationTier: "compost"</code>. Inedible vegetable trimmings, peels, and biomass diverted to localized biomethanation digesters for renewable cooking gas.</li>
        <li><strong>Circular Fallback:</strong> <code>allowAlternativeRouting: true</code>. If no NGO claims a Tier 1 batch 1 hour before cutoff, the platform automatically redirects it to Animal Feed or Biogas!</li>
      </ul>
    </div>

    <div class="screenshot-container">
      ${imgVision ? `<img src="${imgVision}" alt="Vision Screen" />` : `<div style="padding: 20px; text-align: center;">[Vision Page Screenshot]</div>`}
      <div class="screenshot-caption">
        <span>Figure 2: Zero-Landfill Vision Page (http://localhost:3000/vision)</span>
        <span>Component: app/routes/vision.tsx</span>
      </div>
    </div>
  </section>

  <!-- ================= PAGE 3 ================= -->
  <div class="page-break"></div>

  <div class="doc-header">
    <div>
      <div class="brand-title">SECOND PLATE · Operational Screens</div>
      <div class="brand-subtitle">Urgent Demands & Solidarity Events</div>
    </div>
    <div class="meta-box">
      <div>Section: Demands & Events Specification</div>
    </div>
  </div>

  <section>
    <h1>6. Urgent NGO Food Demands Broadcast System</h1>
    <p>
      <strong>User Spec:</strong> <em>"Ngo can demand ki etiki etiki darkar by 9pm or so and donors respond whether to give or not"</em><br />
      <strong>Implementation:</strong> <code>app/routes/demands.tsx</code>, backed by <code>createNgoDemand</code> and <code>pledgeToDemand</code> actions in <code>app/lib/second-plate.ts</code>.
    </p>
    
    <div class="screenshot-container">
      ${imgDemands ? `<img src="${imgDemands}" alt="Demands Screen" />` : `<div style="padding: 20px; text-align: center;">[Demands Page Screenshot]</div>`}
      <div class="screenshot-caption">
        <span>Figure 3: Live NGO Food Demand Broadcast & Donor Pledge Board (http://localhost:3000/demands)</span>
        <span>Component: app/routes/demands.tsx</span>
      </div>
    </div>

    <div class="card card-amber">
      <h3>Key Capabilities of the Demand Board:</h3>
      <ol style="margin-left: 20px; font-size: 8.5pt;">
        <li><strong>Cutoff Deadline Tracking:</strong> NGOs post exact timing (e.g., <em>"Needed by 9:00 PM tonight"</em>) and portion quantities required for evening shelter distributions.</li>
        <li><strong>Donor Pledge Modal:</strong> Restaurants and banquet providers review live requests and click <em>"Pledge Food"</em> to commit meals with preparation notes.</li>
        <li><strong>Real-time Progress Bars:</strong> Dynamic calculation of pledged vs. needed portions with automatic <code>FULFILLED</code> status transition.</li>
      </ol>
    </div>
  </section>

  <section class="avoid-break" style="margin-top: 15px;">
    <h1>7. Annual Solidarity Events & World Food Day Portal</h1>
    <p>
      <strong>User Spec:</strong> <em>"Organised events made by donors specially for ngos once a year like on oct 16 world food day"</em><br />
      <strong>Implementation:</strong> <code>app/routes/events.tsx</code>, with interactive pledge action <code>pledgeToEvent</code>.
    </p>

    <div class="screenshot-container">
      ${imgEvents ? `<img src="${imgEvents}" alt="Events Screen" />` : `<div style="padding: 20px; text-align: center;">[Events Page Screenshot]</div>`}
      <div class="screenshot-caption">
        <span>Figure 4: Annual Solidarity Drives & World Food Day Mega-Drive (http://localhost:3000/events)</span>
        <span>Component: app/routes/events.tsx</span>
      </div>
    </div>
  </section>

  <!-- ================= PAGE 4 ================= -->
  <div class="page-break"></div>

  <div class="doc-header">
    <div>
      <div class="brand-title">SECOND PLATE · UI Components & Form Engine</div>
      <div class="brand-subtitle">Dashboard & Surplus Publication</div>
    </div>
    <div class="meta-box">
      <div>Section: Component Architecture</div>
    </div>
  </div>

  <section>
    <h1>8. Provider Dashboard & Live Handover Console</h1>
    <p>
      <strong>Component:</strong> <code>app/components/second-plate/provider-view.tsx</code><br />
      Features live operational dispatch feed, urgent expiration alerts (&lt; 2h), urgent NGO demand alerts, 3-tier channel filters, and 1-click batch review.
    </p>

    <div class="screenshot-container">
      ${imgHome ? `<img src="${imgHome}" alt="Dashboard Screen" />` : `<div style="padding: 20px; text-align: center;">[Provider Dashboard Screenshot]</div>`}
      <div class="screenshot-caption">
        <span>Figure 5: Kitchen Provider Command Center Dashboard (http://localhost:3000/)</span>
        <span>Component: app/components/second-plate/provider-view.tsx</span>
      </div>
    </div>
  </section>

  <section class="avoid-break" style="margin-top: 15px;">
    <h1>9. 3-Tier Surplus Publication Form</h1>
    <p>
      <strong>Component:</strong> <code>app/components/second-plate/add-food-form.tsx</code> at route <code>/add</code><br />
      Features 1-click quick presets, 3-tier visual card selection, FSSAI temperature tracking, and automatic circular fallback toggle.
    </p>

    <div class="screenshot-container">
      ${imgAdd ? `<img src="${imgAdd}" alt="Add Food Screen" />` : `<div style="padding: 20px; text-align: center;">[Add Food Form Screenshot]</div>`}
      <div class="screenshot-caption">
        <span>Figure 6: Surplus Food Publication Form with 3-Tier Channel Selector (http://localhost:3000/add)</span>
        <span>Component: app/components/second-plate/add-food-form.tsx</span>
      </div>
    </div>
  </section>

  <!-- ================= PAGE 5 ================= -->
  <div class="page-break"></div>

  <div class="doc-header">
    <div>
      <div class="brand-title">SECOND PLATE · Sustainability & Verification</div>
      <div class="brand-subtitle">Environmental Impact & Header Architecture</div>
    </div>
    <div class="meta-box">
      <div>Section: Impact Metrics & Code Samples</div>
    </div>
  </div>

  <section>
    <h1>10. Ecological Savings & 3-Tier Distribution Metrics</h1>
    <p>
      <strong>Component:</strong> <code>app/routes/impact.tsx</code><br />
      Translates diverted surplus into tangible metrics using official EPA WARM life-cycle coefficients: CO2 avoided, virtual water saved, tree-absorption equivalents, and vehicle-km offsets.
    </p>

    <div class="screenshot-container">
      ${imgImpact ? `<img src="${imgImpact}" alt="Impact Screen" />` : `<div style="padding: 20px; text-align: center;">[Impact Dashboard Screenshot]</div>`}
      <div class="screenshot-caption">
        <span>Figure 7: Impact & Sustainability Dashboard (http://localhost:3000/impact)</span>
        <span>Component: app/routes/impact.tsx</span>
      </div>
    </div>
  </section>

  <section class="avoid-break" style="margin-top: 15px;">
    <h1>11. Data Structures & Code Architecture Reference</h1>
    <p>
      Below is the core TypeScript schema implemented in <code>app/lib/second-plate.ts</code>:
    </p>
    <div class="code-block">
// 3-Tier Food Destination Architecture
export type FoodDestinationTier = "people" | "animals" | "compost";

export type Listing = {
  id: string;
  providerName: string;
  providerType: string;
  title: string;
  category: string;
  destinationTier: FoodDestinationTier; // 3-Tier: people | animals | compost
  allowAlternativeRouting: boolean;     // Circular cascade toggle
  portionsTotal: number;
  portionsRemaining: number;
  weightKg: number | null;
  collectBy: string;
  status: string;
};

// NGO Demand Broadcast Schema
export type NgoDemand = {
  id: string;
  ngoName: string;
  foodType: string;
  portionsNeeded: number;
  portionsPledged: number;
  deadlineTime: string; // e.g. "9:00 PM tonight"
  urgency: "critical" | "high" | "normal";
  status: "OPEN" | "FULFILLED";
  pledges: DemandPledge[];
};

// Solidarity Campaign Schema
export type SolidarityEvent = {
  id: string;
  title: string;
  dateLabel: string; // e.g. "October 16 · World Food Day"
  targetMeals: number;
  pledgedMeals: number;
  partnerNgos: string[];
  participatingDonors: string[];
};
    </div>
  </section>

  <footer style="margin-top: 25px; padding-top: 10px; border-top: 1px solid #cbd5e1; font-size: 8pt; color: #64748b; display: flex; justify-content: space-between;">
    <span>SECOND PLATE — Rescue Food. Share Hope.</span>
    <span>Generated via Headless Chrome Engine · Confidential Product Specification</span>
  </footer>

</body>
</html>`;

const htmlPath = path.join(rootDir, "SECOND_PLATE_SPECIFICATION.html");
const pdfPath = path.join(rootDir, "SECOND_PLATE_SPECIFICATION.pdf");

fs.writeFileSync(htmlPath, html, "utf-8");
console.log("HTML specification written to:", htmlPath);

const chromeCmd = `"C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" --headless=new --disable-gpu --no-pdf-header-footer --print-to-pdf="${pdfPath}" "${htmlPath}"`;

try {
  console.log("Generating PDF via Chrome headless engine...");
  execSync(chromeCmd, { stdio: "inherit" });
  const stat = fs.statSync(pdfPath);
  console.log(`Success! PDF generated at: ${pdfPath} (${(stat.size / 1024).toFixed(1)} KB)`);
} catch (err) {
  console.error("PDF generation failed:", err);
  process.exit(1);
}
