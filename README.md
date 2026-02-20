# Pharmdle

A pharmacy-themed word-guessing game inspired by [Wordle](https://www.nytimes.com/games/wordle/index.html). Each day, a new pharmaceutical drug name is selected and players have 8 attempts to guess it using colour-coded feedback.

## How to Play

1. Each puzzle is a pharmaceutical drug name padded to 14 characters with `*` symbols
2. Type your guess using the on-screen keyboard or your physical keyboard (letters A-Z and `*`)
3. Press **Enter** to submit a guess
4. After each guess, tiles flip to reveal colour-coded hints:
   - **Green** — correct letter in the correct position
   - **Yellow** — correct letter in the wrong position
   - **Grey** — letter is not in the word
5. The on-screen keyboard tracks which letters you've used and their best result
6. Guess the drug name within 8 attempts to win

## Architecture

```
Frontend (React) --> Lambda Function URL --> getDailyDrug Lambda --> S3 (reads daily_drug)

EventBridge Scheduler (midnight CT) --> rotateDailyDrug Lambda --> S3 (writes daily_drug)

S3 bucket stores: drug_names (full list), daily_drug (today's pick)
```

### Frontend

- **React 19** with **TypeScript**, bootstrapped with Create React App
- **Material-UI (MUI) v7** for UI components
- **Emotion** for CSS-in-JS styling
- Dark theme with CSS flip/bounce animations
- Responsive layout (mobile, tablet, desktop)

### Backend (AWS)

All backend infrastructure runs in **us-east-1** and is managed via Terraform.

- **S3 bucket** (`842817210846-drug-names`) — stores the list of valid drug names (`drug_names`) and the current daily pick (`daily_drug`)
- **getDailyDrug Lambda** (Node.js 22.x) — reads `daily_drug` from S3 and returns it as plain text. Exposed via a Lambda Function URL with CORS allowing `GET` from `*`
- **rotateDailyDrug Lambda** (Node.js 22.x) — reads `drug_names` from S3, picks a random drug, and writes it to `daily_drug` in S3
- **EventBridge Scheduler** — triggers `rotateDailyDrug` daily at midnight America/Chicago with a 15-minute flexible window
- **IAM** — least-privilege roles per Lambda, scoped to the specific S3 keys each function needs

### Drug List

The drug list is generated from the FDA drug database (`utils/drug-drugsfda-0001-of-0001.json`) using `utils/parse_list.js`, which filters for generic drug names that are alphabetic-only and 14 characters or fewer.

## Project Structure

```
src/
├── App.tsx                        # Root component with header
├── Pharmdle.tsx                   # Game container and state management
├── PharmdleRow.tsx                # Single row of 14 letter cells
├── Keypad.tsx                     # On-screen QWERTY keyboard
├── hooks/
│   └── usePharmdle.ts             # Custom hook for core game logic
├── components/
│   ├── WonGameModal.tsx           # Victory modal
│   └── LostGameModal.tsx          # Game-over modal
└── index.css                      # Global styles and animations

terraform/
├── main.tf                        # Provider, S3 bucket, S3 objects
├── iam.tf                         # IAM roles and inline policies
├── lambda.tf                      # Lambda functions, log groups, Function URL
├── eventbridge.tf                 # Scheduler schedule and scheduler IAM role
├── variables.tf                   # Input variables
├── outputs.tf                     # Function URL, bucket name, Lambda ARNs
├── IMPORT.md                      # Instructions for importing existing AWS resources
└── lambdas/
    ├── getDailyDrug/index.mjs     # getDailyDrug Lambda source
    └── rotateDailyDrug/index.mjs  # rotateDailyDrug Lambda source

utils/
├── parse_list.js                  # Script to extract drug names from FDA data
├── drug_names                     # Generated list of valid drug names
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
