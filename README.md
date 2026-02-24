# Pharmdle

A pharmacy-themed word-guessing game inspired by [Wordle](https://www.nytimes.com/games/wordle/index.html). Each day, a new pharmaceutical drug name is selected and players have 6 attempts to guess it using colour-coded feedback.

## How to Play

1. Each puzzle is a pharmaceutical drug name (up to 14 characters)
2. Type your guess using the on-screen keyboard or your physical keyboard (letters A-Z)
3. Press **Enter** to submit a guess — only valid drug names are accepted
4. After each guess, tiles flip to reveal colour-coded hints:
   - **Green** — correct letter in the correct position
   - **Yellow** — correct letter in the wrong position
   - **Grey** — letter is not in the word
5. The on-screen keyboard tracks which letters you've used and their best result
6. Use the **Hints** drawer to progressively reveal clues about the drug (route, dosage form, pharmacological class, etc.)
7. Guess the drug name within 6 attempts to win

## Architecture

```
Frontend (React) --> Lambda Function URL --> getDailyDrug Lambda --> S3 (reads daily_drug, drug_data)

EventBridge Scheduler (midnight CT) --> rotateDailyDrug Lambda --> S3 (writes daily_drug)

S3 bucket stores: drug_data (full list with hints), daily_drug (today's pick)
```

### Frontend

- **React 19** with **TypeScript**, bootstrapped with Create React App
- **Material-UI (MUI) v7** for UI components
- **Emotion** for CSS-in-JS styling
- Dark theme with CSS flip/bounce animations
- Responsive layout (mobile, tablet, desktop)

### Backend (AWS)

All backend infrastructure runs in **us-east-1** and is managed via Terraform.

- **S3 bucket** (`842817210846-drug-names`) — stores the drug database (`drug_data`) and the current daily pick (`daily_drug`)
- **getDailyDrug Lambda** (Node.js 22.x) — reads `daily_drug` from S3. Returns JSON with hint attributes when `?hints=true` is passed, otherwise returns the drug name as plain text. Exposed via a Lambda Function URL with CORS allowing `GET` from `*`
- **rotateDailyDrug Lambda** (Node.js 22.x) — reads `drug_data` from S3, picks a random drug, and writes it to `daily_drug` in S3
- **EventBridge Scheduler** — triggers `rotateDailyDrug` daily at midnight America/Chicago with a 15-minute flexible window
- **IAM** — least-privilege roles per Lambda, scoped to the specific S3 keys each function needs

### Drug List

The drug list is generated from the FDA drug database (`utils/drug-drugsfda-0001-of-0001.json`) using `utils/build_drug_data.py`, which filters for generic drug names that are alphabetic-only and 14 characters or fewer, and enriches each entry with hint attributes (route, dosage form, pharmacological class, etc.).

## Project Structure

```
src/
├── App.tsx                        # Root component with header
├── Pharmdle.tsx                   # Game container and state management
├── PharmdleRow.tsx                # Single row of letter cells
├── Keypad.tsx                     # On-screen QWERTY keyboard
├── hooks/
│   └── usePharmdle.ts             # Custom hook for core game logic
├── components/
│   ├── HintsDrawer.tsx            # Progressive hint reveal drawer
│   ├── InfoModal.tsx              # How-to-play and about modal
│   ├── WonGameModal.tsx           # Victory modal
│   └── LostGameModal.tsx          # Game-over modal
├── data/
│   └── validDrugs.ts              # Static set of valid drug names for guess validation
├── utils/
│   ├── analytics.ts               # Google Analytics event tracking wrapper
│   └── gameStorage.ts             # localStorage persistence for game state
└── index.css                      # Global styles and animations

terraform/
├── main.tf                        # Provider, S3 bucket, S3 objects
├── iam.tf                         # IAM roles and inline policies
├── lambda.tf                      # Lambda functions, log groups, Function URL
├── eventbridge.tf                 # Scheduler schedule and scheduler IAM role
├── monitoring.tf                  # CloudWatch dashboard, alarms, SNS topic
├── variables.tf                   # Input variables
├── outputs.tf                     # Function URL, bucket name, Lambda ARNs
├── IMPORT.md                      # Instructions for importing existing AWS resources
└── lambdas/
    ├── getDailyDrug/index.mjs     # getDailyDrug Lambda source
    └── rotateDailyDrug/index.mjs  # rotateDailyDrug Lambda source

utils/
├── build_drug_data.py             # Script to build drug database from FDA data
├── drug_data.json                 # Generated drug database with hint attributes
└── drug-drugsfda-0001-of-0001.json  # Raw FDA drug database
```

## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

```bash
npm install
```

### Running Locally

```bash
npm start
```

Opens the app at [http://localhost:3000](http://localhost:3000). The page reloads automatically on code changes.

### Running Tests

```bash
npm test
```

### Production Build

```bash
npm run build
```

Outputs an optimised production build to the `build/` directory.

## Deployment

The frontend is continuously deployed via **AWS Amplify**. Pushing to the `main` branch automatically triggers a build and deploy.

### Checking Deployment Status

```bash
# List recent deployments
aws amplify list-jobs --app-id d1zf2mt5b84s5d --branch-name main --max-items 5

# Get details for a specific job
aws amplify get-job --app-id d1zf2mt5b84s5d --branch-name main --job-id <JOB_ID>
```

You can also check the [Amplify console](https://us-east-1.console.aws.amazon.com/amplify/apps/d1zf2mt5b84s5d) directly.

## Monitoring

- [Google Analytics dashboard](https://analytics.google.com/analytics/web/) — frontend game events (measurement ID: `G-XV5S4WVXQ1`)
- [CloudWatch dashboard (Pharmdle)](https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards/dashboard/Pharmdle) — Lambda invocations, errors, duration, throttles
- [CloudWatch alarms](https://us-east-1.console.aws.amazon.com/cloudwatch/home?region=us-east-1#alarmsV2:) — getDailyDrug errors/latency, rotateDailyDrug errors/missed runs

## Refreshing the Drug Database

To update the game's drug list with new FDA data:

### 1. Obtain new FDA data

Download or place the raw FDA drug database file at `utils/drug-drugsfda-0001-of-0001.json`.

### 2. Generate drug_data.json

```bash
python3 utils/build_drug_data.py
```

This reads the raw FDA data, filters to drugs with alphabetic-only names of 14 characters or fewer, enriches each with hint attributes (route, dosage form, pharmacological class, etc.), and writes `utils/drug_data.json`.

### 3. Regenerate the frontend validation list

```bash
node -e "
const drugs = require('./utils/drug_data.json');
const names = drugs.map(d => d.name).sort();
const ts = 'const validDrugs = new Set<string>([\n' +
  names.map(n => '  \"' + n + '\"').join(',\n') +
  ',\n]);\n\nexport default validDrugs;\n';
require('fs').writeFileSync('src/data/validDrugs.ts', ts);
console.log('Wrote src/data/validDrugs.ts with ' + names.length + ' drugs');
"
```

This generates `src/data/validDrugs.ts`, the static Set used by the frontend to validate guesses.

### 4. Deploy the updated data to S3

```bash
cd terraform
terraform apply
```

Terraform detects changes to `utils/drug_data.json` via its content hash and uploads the new file to S3.

### 5. Trigger a new daily drug (optional)

If you want to immediately pick a new daily drug from the updated list:

```bash
aws lambda invoke --function-name rotateDailyDrug /dev/stdout
```

Otherwise, the EventBridge scheduler will pick a new drug at midnight CT automatically.

## Infrastructure (Terraform)

Backend infrastructure is managed with Terraform in the `terraform/` directory.

### Prerequisites

- [Terraform](https://developer.hashicorp.com/terraform/install) >= 1.0
- AWS CLI configured with credentials (`aws configure`)

### Making Changes

```bash
cd terraform

# Preview what Terraform will do
terraform plan

# Apply changes
terraform apply
```

### Updating Lambda Code

Edit the Lambda source files in `terraform/lambdas/`, then run:

```bash
terraform apply
```

Terraform automatically zips the source directories and detects code changes via `source_code_hash`, so updated code is deployed on the next apply.
