# CloudCost Buddy ☁️💰
> **AWS Cost Estimation and Optimization Assistant for Students & Cloud Beginners**

CloudCost Buddy is an interactive, educational web application designed to help cloud beginners, students, and engineers understand and estimate AWS infrastructure costs before provisioning resources.

AWS pricing can be intimidating for learners. With multiple pricing dimensions (hourly rates, request counts, GB-months, data egress), beginners often fear accidental runaway cloud bills. CloudCost Buddy demystifies cloud economics with transparent formulas, real-time interactive calculators, rule-based optimization recommendations, educational deep-dives, and local data persistence.

---

## 🚀 Key Features

- **Real-Time Architectural Cost Engine**:
  - Pure calculation engine without side effects.
  - Multi-service modeling for **Amazon EC2**, **Amazon S3**, **AWS Lambda**, and **Amazon DynamoDB**.
  - Multi-region price modeling (US East - N. Virginia, US West - Oregon, Europe - Ireland, Asia Pacific - Mumbai).
  - Explicit monthly & annual projections with detailed mathematical line-item breakdowns.

- **Pre-Configured Architecture Templates**:
  - *Starter Web App*: EC2 + S3 storage.
  - *Serverless REST API*: Lambda + DynamoDB on-demand.
  - *Static Website*: S3 Standard bucket hosting with high web request volumes.

- **Transparent Pricing Assumptions & Status**:
  - Every price displays its verification tag (`verified-sample` or `needs-verification`).
  - Clear explanations of hidden dimensions (e.g. data transfer out, snapshots, minimum storage durations).
  - Prominent educational disclaimer reminding users that estimates are approximate models, not binding AWS billing invoices.

- **Rule-Based Cost Optimization Engine**:
  - Automatically identifies optimization levers based on user configurations:
    - *EC2*: Reserved Instance & Savings Plans savings (up to ~30-72%), scheduling idle dev/test instances, right-sizing instance tiers.
    - *S3*: Lifecycle management, transitioning infrequently accessed objects, Intelligent-Tiering, and CloudFront integration.
    - *Lambda*: Memory allocation tuning, execution duration optimization, and Free Tier boundaries.
    - *DynamoDB*: Comparing On-Demand vs. Provisioned Capacity for stable predictable traffic patterns.

- **Interactive Visualizations & Analytics**:
  - Visual breakdown by service percentage using interactive responsive Donut / Pie charts.
  - Cost comparison bar charts across saved architectures.
  - Dynamic cost summaries that update instantly as sliders and toggles change.

- **Local-First Persistence & Export**:
  - Zero database or authentication requirement: architectures persist safely in browser `localStorage`.
  - Export full architecture configurations and cost breakdowns as structured **JSON** or spreadsheet-compatible **CSV**.
  - Load, edit, duplicate, and delete architectural estimates seamlessly.

- **Educational Knowledge Hub**:
  - Explains the AWS Free Tier (Always Free, 12 Months Free, Short-term Trials).
  - Practical tips to prevent unexpected AWS bills: AWS Budgets, CloudWatch Billing Alarms, Cost Anomaly Detection, and stopping idle instances.
  - Linux/DevOps cost tips: automating instance start/stop with cron and systemd, monitoring CPU/RAM before scaling up.

---

## 🛠️ Technology Stack & Architecture

- **Frontend Framework**: React 19 + TypeScript (Strict Mode)
- **Build Tool**: Vite 8 with fast Hot Module Replacement (HMR)
- **Styling**: Tailwind CSS v4 + Custom Dark Modern Glassmorphism Design System
- **Icons**: Lucide React
- **Data Visualizations**: Recharts
- **Testing**: Vitest unit testing suite
- **State & Storage**: Pure functional state + Browser LocalStorage persistence

### Project Architecture & Folder Structure

```
src/
├── components/          # Reusable UI components
│   └── Header.tsx       # Navigation bar & brand header
├── data/                # Static pricing models & service metadata
│   └── pricingData.ts   # Documented sample prices, units, and assumptions
├── features/            # Decoupled business logic modules
│   ├── pricing/         # Cost calculation engine
│   │   ├── calculateCost.ts
│   │   └── calculateCost.test.ts
│   ├── recommendations/ # Rule-based optimization logic
│   │   ├── useRecommendations.ts
│   │   └── useRecommendations.test.ts
│   └── storage/         # LocalStorage persistence & JSON/CSV exporters
│       └── estimateStorage.ts
├── lib/                 # Utility functions & formatting helpers
│   └── utils.ts
├── pages/               # Application view layouts
│   ├── Dashboard.tsx    # Summary metrics, charts, templates & saved estimates
│   ├── CreateEstimate.tsx # Interactive architecture canvas & service configurator
│   └── LearnPage.tsx    # AWS billing guide, free tier tips & cost control best practices
├── types/               # TypeScript interfaces and data contracts
│   └── index.ts
├── App.tsx              # Root app orchestrator & view routing
└── main.tsx             # React entry point
```

---

## 🧪 Local Setup & Development

### Prerequisites
- Node.js (version 18+ or 20+ recommended)
- npm or pnpm / yarn

### Installation
```bash
# Clone or navigate into the repository
cd "AWS Builder Challenge"

# Install project dependencies
npm install
```

### Running the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser to experience the application.

### Running Automated Tests
```bash
npm test
```
Runs the Vitest suite covering pure cost calculation formulas, multi-service aggregations, and recommendation rules.

### Production Build
```bash
npm run build
```
Type-checks TypeScript (`tsc -b`) and generates production bundles in `/dist`.

---

## 📊 Verification & Test Summary

- **Type Safety**: Verified zero TypeScript errors across all modules.
- **Unit Testing**: 7 passing tests validating:
  - EC2 monthly math ($0.0104/hr × 730 hrs = ~$7.592/mo in `us-east-1`).
  - S3 multi-part pricing (storage GB + PUT request tiers).
  - Lambda computation (request count + memory-weighted GB-seconds duration).
  - DynamoDB capacity units (WRU + RRU + storage aggregation).
  - Multi-service architecture rollup into annual and monthly project estimates.
  - Recommendation engine triggers (24/7 EC2 warning, S3 lifecycle recommendation).
- **Browser End-to-End Verification**:
  - Dashboard loads cleanly with instant responsive templates.
  - Adding, tuning, and removing services dynamically recalculates totals.
  - Project saving, updating, and JSON/CSV exporting operates locally without network latency.

---

## ⚠️ Important Educational Disclaimers

> **Notice**: CloudCost Buddy is an educational planning assistant. It is **not** an official Amazon Web Services (AWS) billing tool or calculator.
>
> 1. Real-world AWS bills depend on dynamic metrics such as cross-AZ data transfer, regional tax rates, public IPv4 address charges ($0.005/hr), CloudWatch log ingestion, and unpredictable network spikes.
> 2. Always verify real-time regional rates with the official [AWS Pricing Calculator](https://calculator.aws/) before deploying production infrastructure.
> 3. Always set up an **AWS Billing Alarm ($5 - $10)** in CloudWatch when starting out on AWS!

---

## 🗺️ Future Cloud Architecture & AWS Deployment Roadmap

When scaling beyond a client-side prototype, the application can be seamlessly augmented with native AWS cloud services:

1. **Frontend Hosting (AWS Amplify)**:
   - Deploy the static Vite build directly to AWS Amplify Hosting via Git-based CI/CD.
   - Provides global CloudFront CDN edge delivery, free SSL certificates, and preview branches.

2. **Backend API (Amazon API Gateway + AWS Lambda)**:
   - *Amazon API Gateway*: Exposes RESTful HTTP endpoints (`/api/estimates`, `/api/pricing`).
   - *AWS Lambda*: Serverless compute to query real-time AWS Price List Query API and perform server-side validations.

3. **Database (Amazon DynamoDB)**:
   - Serverless NoSQL storage for user projects, shareable estimate URLs, and historical architectural comparisons.

4. **Monitoring & Governance (Amazon CloudWatch + AWS Budgets)**:
   - *CloudWatch Alarms*: Monitor Lambda latency, 5xx error rates, and API invocation counts.
   - *AWS Budgets*: Set hard alert thresholds (e.g., $1.00/mo) to guarantee that backend learning experiments never incur surprise costs.

5. **Security & Identity (AWS IAM + Amazon Cognito)**:
   - Principle of Least Privilege: Lambda execution roles granted only minimum necessary DynamoDB permissions.
   - Optional Cognito user pools if multi-user team collaboration is required in the future.

---

## 📝 License
MIT License. Built for learning, cloud experimentation, and the AWS community.
