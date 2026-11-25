# Demoblaze — E2E Tests (Playwright)

End-to-end tests for [demoblaze.com](https://demoblaze.com/): catalog, login,
cart, and checkout. Built with Playwright using the Page Object Model and
fake test data generated with Faker.

## Stack

- **Playwright Test** — framework and runner
- **@faker-js/faker** — fake test data
- **dotenv** — credentials from `.env`
- Page Object Model

## Structure

pw_test_project/
├── pages/
│   └── checkout_page.js      — Page Object for the payment form
├── tests/
│   └── productstore.spec.js  — tests
├── .env                      — login and password (git-ignored)
├── playwright.config.js      — baseURL, browsers, reporters
└── package.json

## Setup & Run

    npm install
    npx playwright install

Create a `.env` file in the project root:

    BASE_URL=https://demoblaze.com
    USER_LOGIN=...
    USER_PASSWORD=...

Run:

    npx playwright test              # all tests
    npx playwright test --headed     # with a visible browser
    npx playwright test --ui         # interactive mode
    npx playwright show-report       # HTML report

## Test Coverage

| Test | Task steps | What it checks |
|---|---|---|
| Main page has 6 items | 1–2 | the catalog is displayed on the main page |
| Login user | 3–5 | login succeeds, username shown in the header |
| Price matches | 6–8 | product-card price equals the main-page price |
| Item name longer than 1 char | 9–10 | every product name is longer than 1 character |
| Add to cart | 11–13 | a product is added and appears in the cart |
| Place an order | 14–17 | the order is placed, form filled with Faker data |

## Solution (`tests/productstore.spec.js`)

The shared "open the site" step is extracted into `beforeEach`, so every test
starts on the main page:

    test.beforeEach(async ({ page }) => {
      await page.goto('/');
    });

Key techniques:

- **Credentials from `.env`** — login and password are read via `process.env`,
  never hard-coded.
- **Price check** — the price is read from the card on the main page, then from
  the product page; both are parsed to numbers and compared.
- **"Product added" alert** — captured with `page.waitForEvent('dialog')` before
  the click, then its text is asserted and it is dismissed with `accept()`.
- **Payment form** — extracted into `CheckoutPage`; the test passes it an object
  of Faker data and the page fills the fields.
- **Card expiry** — month and year are generated in the future via
  `faker.date.future()`.

## Notes

- Credentials and `.env` are kept out of the repository (see `.gitignore`).
- Some tests pick a product at random (`Math.random`) so coverage isn't tied to
  a single item.