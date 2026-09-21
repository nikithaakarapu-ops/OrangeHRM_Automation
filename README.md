# OrangeHRM Automation – Playwright + TypeScript

This project runs UI and API tests for the **Employee Lifecycle** scenario on the
[OrangeHRM demo site](https://opensource-demo.orangehrmlive.com/).

## Test scenarios

`tests/auth.setup.ts` logs in once as Admin, creates an ESS user through the API and saves both sessions
(`playwright/.auth/user.json` and `ess.json`). `tests/auth.teardown.ts` deletes the ESS user after the run.
A test picks its user with `test.use({ storageState: ... })`; the default is Admin.

### Employee lifecycle (`employee-lifecycle.spec.ts`, `@regression`)

| Step | What the test does |
|------|--------------------|
| 1. Open dashboard | Opens the dashboard with the saved session and checks it is shown |
| 2. Add employee | Adds an employee from `data/employee-data.json` with first name, last name, Employee Id, profile picture and **login details** (Create Login Details toggle: username, password, Enabled/Disabled), then checks the new record in the list |
| 3. API validation | Gets the employee and its system user from the OrangeHRM API and compares them with the UI data |
| 4. Edit employee | Searches by Employee Id, updates Employment Status, then checks the saved value |
| 5. API validation | Checks the updated Employment Status through the API |
| 6. Delete employee | Deletes the employee in the UI, then checks it is gone from the list and its login is gone too |

One test runs for **each employee** in `data/employee-data.json`. An `afterEach` hook deletes the employee through the API, so a failed test never leaves data behind.

### Role-based access (`role-based-access.spec.ts`, `@rbac`)

| Test | What it checks |
|------|----------------|
| Admin role | Sees all 12 menus, can open Admin > User Management, admin users API returns 200 |
| ESS role | Sees only Leave, Time, My Info, Performance, Dashboard, Directory, Claim, Buzz; the Admin URL shows "Credential Required"; admin users API returns 403 |

### Authentication (`authentication.spec.ts`, `@smoke`)

Admin login and logout, and "Invalid credentials" for a wrong password. These tests start signed out, so logging out does not affect the saved sessions, and tests can run in parallel.

## Setup

Requires Node.js 18 or newer.
vscode editor

```bash
npm install
```

```bash
npx playwright install chromium
```

Copy `.env.example` to `.env.qa` (and `.env.prod` if needed) and fill in the values. `TEST_ENV=qa|prod` selects the file
(default `qa`); if `.env.<TEST_ENV>` does not exist, `.env` is used. Variables already set in the shell, such as CI secrets, take precedence.

## How to run

```bash
npm run test:headed
```

| Command | Description |
|---------|-------------|
| `npm test` | Run all tests on `qa` (headless, 3 parallel workers; set `WORKERS=n` to change) |
| `npm run test:headed` | Run tests with the browser visible |
| `npm run test:smoke` / `test:regression` / `test:rbac` | Run only the tests with that tag |
| `npm run test:qa` / `test:prod` | Run against `qa` / `prod`. Prod runs only `@smoke` (read-only) tests |
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
│   └── constants.ts                      # Session paths, status codes, tags, user role ids
├── data/
│   ├── employee-data.json                # Test data (one test per employee)
│   └── images/                           # Profile pictures to upload
├── fixtures/base-test.ts                 # Gives tests ready-made page objects and API clients
├── pages/                                # Page Object Model
│   ├── base-page.ts                      # Generic actions/waits/assertions that take a Locator
│   ├── login-page.ts
│   ├── dashboard-page.ts                 # Menu and logout
│   ├── add-employee-page.ts              # Add employee form, including Create Login Details
│   ├── pim-page.ts                       # Employee list: search, edit job, delete
│   └── admin-page.ts                     # Admin > User Management
├── api/
│   ├── base-api-client.ts                # Generic request helper
│   └── orange-hrm-api-client.ts          # OrangeHRM API: employees and system users (read, create, delete)
├── utils/
│   ├── assertions.ts                     # Soft assertions with log messages
│   └── date-utils.ts                     # Date formatting helpers
├── tests/
│   ├── auth.setup.ts                     # Saves the Admin session and creates + saves an ESS session
│   ├── auth.teardown.ts                  # Deletes the ESS user
│   ├── authentication.spec.ts            # Login, logout, invalid credentials
│   ├── employee-lifecycle.spec.ts        # Data-driven employee tests
│   └── role-based-access.spec.ts         # Admin and ESS access checks
├── playwright.config.ts                  # Projects, browser, video, report settings
└── package.json
```

## How it works

- **Login once:** the `setup` project runs `auth.setup.ts`, which saves the Admin and ESS cookies to `playwright/.auth/` (git-ignored). The `chromium` project depends on it and starts every test as Admin; a test or describe block switches user with `test.use({ storageState: ESS_STORAGE_STATE_PATH })`. The `cleanup` project runs `auth.teardown.ts` afterwards.
- **Parallel:** tests do not depend on each other or on order, so `fullyParallel` is on. Only the logout test signs out, and it uses its own session.
- **Tags:** `@smoke`, `@regression`, `@rbac` (see `TAGS` in `config/constants.ts`), used with `--grep`.
- **Page Object Model:** locators and actions for each page live in `pages/`. The test file only describes the steps.
- **Reusable base page:** `BasePage` has no selectors. It offers generic methods (`click`, `fill`, `uploadFile`, `getText`, `expectVisible`, ...) that take a `Locator`, so it works for any application. Page objects define their locators and call these methods, e.g. `await this.fill(this.usernameInput, username)`. Every page object extends `BasePage` directly.
- **Fixtures:** `fixtures/base-test.ts` creates the page objects, so a test just lists what it needs, for example `async ({ dashboardPage, pimPage }) => ...`.
- **API uses the UI login:** `OrangeHrmApiClient` is built from `page.request`, which shares the browser's cookies, so no separate API login or manual cookie header is needed. It can also create and delete employees and system users, which the setup and cleanup use.
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
- `dotenv`: loads `.env` files
- `cross-env`: sets `TEST_ENV` in npm scripts on any OS
- `moment`: date formatting
