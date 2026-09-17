# OrangeHRM Automation – Playwright + TypeScript

This project runs UI and API tests for the **Employee Lifecycle** scenario on the
[OrangeHRM demo site](https://opensource-demo.orangehrmlive.com/).

## Test scenario

Login runs once in `tests/auth.setup.ts`; the session is saved and reused by every test.

| Step | What the test does |
|------|--------------------|
| 1. Open dashboard | Opens the dashboard with the saved session and checks it is shown |
| 2. Add employee | Adds an employee from `data/employee-data.json` with first name, last name, Employee Id and profile picture, then checks the new record in the list |
| 3. API validation | Gets the employee from the OrangeHRM API and compares it with the UI data |
| 4. Edit employee | Searches by Employee Id, updates Employment Status, then checks the saved value |
| 5. API validation | Checks the updated Employment Status through the API |
| 6. Delete employee | Deletes the employee in the UI, then checks it is gone from the list |

One test runs for **each employee** in `data/employee-data.json`.

After all employee tests, the last test in `employee-lifecycle.spec.ts` logs out and checks the login page.
Logging out ends the saved session on the server, so this test must remain the last one in the run.

## Setup

Requires Node.js 18 or newer.
vscode editor

```bash
npm install
```

```bash
npx playwright install chromium
```

Create a `.env` file in the project root:

```
BASE_URL=https://opensource-demo.orangehrmlive.com/web/index.php/auth/login
API_BASE_URI=https://opensource-demo.orangehrmlive.com/web/index.php/api/v2
ORANGEHRM_USERNAME=...
ORANGEHRM_PASSWORD=...
```

## How to run

```bash
npm run test:headed
```

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests (headless) |
| `npm run test:headed` | Run tests with the browser visible |
| `npm run report` | Open the HTML report |

## Reports and videos

- **HTML report:** `playwright-report/index.html`
- **Videos and screenshots:** `test-results/`. Every test is recorded.

## Framework structure

```
orangehrm-advanced-framework/
├── .github/workflows/playwright-ci.yml   # Runs the tests on GitHub Actions
├── config/
│   ├── environment.config.ts             # URL and login details (from .env)
│   └── constants.ts                      # Shared constants, e.g. saved session path
├── data/
│   ├── employee-data.json                # Test data (one test per employee)
│   └── images/                           # Profile pictures to upload
├── fixtures/base-test.ts                 # Gives tests ready-made page objects and API clients
├── pages/                                # Page Object Model
│   ├── base-page.ts                      # Generic actions/waits/assertions that take a Locator
│   ├── login-page.ts
│   ├── dashboard-page.ts                 # Menu and logout
│   ├── add-employee-page.ts              # Add employee form
│   └── pim-page.ts                       # Employee list: search, edit job, delete
├── api/
│   ├── base-api-client.ts                # Generic request helper
│   └── orange-hrm-api-client.ts          # OrangeHRM API (uses the browser's login session)
├── utils/
│   ├── assertions.ts                     # Soft assertions with log messages
│   └── date-utils.ts                     # Date formatting helpers
├── tests/
│   ├── auth.setup.ts                     # Logs in once and saves the session
│   └── employee-lifecycle.spec.ts        # Data-driven employee tests, then logout
├── playwright.config.ts                  # Projects, browser, video, report settings
└── package.json
```

## How it works

- **Login once:** the `setup` project runs `auth.setup.ts`, which saves cookies to `playwright/.auth/user.json` (git-ignored). The `chromium` project depends on it and starts every test with that `storageState`.
- **Page Object Model:** locators and actions for each page live in `pages/`. The test file only describes the steps.
- **Reusable base page:** `BasePage` has no selectors. It offers generic methods (`click`, `fill`, `uploadFile`, `getText`, `expectVisible`, ...) that take a `Locator`, so it works for any application. Page objects define their locators and call these methods, e.g. `await this.fill(this.usernameInput, username)`. Every page object extends `BasePage` directly.
- **Fixtures:** `fixtures/base-test.ts` creates the page objects, so a test just lists what it needs, for example `async ({ dashboardPage, pimPage }) => ...`.
- **API uses the UI login:** `OrangeHrmApiClient` is built from `page.request`, which shares the browser's cookies, so no separate API login or manual cookie header is needed.
- **Unique test data:** each run creates a new Employee Id, so tests don't clash on the shared demo site.

## Naming conventions

| Item | Convention | Example |
|------|------------|---------|
| Files | kebab-case | `pim-page.ts`, `orange-hrm-api-client.ts` |
| Test files | `*.spec.ts`, setup files `*.setup.ts` | `employee-lifecycle.spec.ts`, `auth.setup.ts` |
| Classes / interfaces | PascalCase with role suffix | `PimPage`, `OrangeHrmApiClient`, `NewEmployee` |
| Methods / functions | camelCase, verb first | `searchByEmployeeId`, `getJobDetails` |
| Variables / fixtures | camelCase | `employeeResponse`, `pimPage` |
| Locator fields | name + element type | `usernameInput`, `loginButton` |
| Constants | UPPER_SNAKE_CASE | `STORAGE_STATE_PATH` |

## Dependencies

- `@playwright/test`: browser automation, test runner, API testing, HTML report, video
- `typescript` and `@types/node`: TypeScript support
- `dotenv`: loads `.env`
- `moment`: date formatting
