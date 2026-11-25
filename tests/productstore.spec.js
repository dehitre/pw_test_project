import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { CheckoutPage } from '../pages/checkout_page';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
});


test('Main page has 6 items', async ({ page }) => {
  await expect(page.locator('#tbodyid .card')).toHaveCount(6);
});


test('Login user', async ({ page }) => {
  await page.locator('#login2').click();
  await expect(page.locator('#loginusername')).toBeVisible();

  await page.locator('#loginusername').fill(process.env.USER_LOGIN);
  await page.locator('#loginpassword').fill(process.env.USER_PASSWORD);
  await page.getByRole('button', { name: 'Log in' }).click();

  await expect(page.locator('#nameofuser')).toHaveText(`Welcome ${process.env.USER_LOGIN}`);
});


test('Check price matches for main page and card', async ({ page }) => {
  const items =  page.locator('#tbodyid .card');
  const countItems = await items.count();
  const randomIndex =  Math.floor(Math.random() * countItems); 
  const priceText = await page.locator('#tbodyid .card h5').nth(randomIndex).textContent();
  const price = Number(priceText.replace('$', '').trim());

  await page.locator('#tbodyid .card a').nth(randomIndex).click(); 
  await expect(page.locator('.price-container')).toBeVisible();
  
  const productPriceText = await page.locator('.price-container').textContent();
  const productPrice = Number(productPriceText.split(' ')[0].replace('$', '').trim());

  expect(productPrice).toEqual(price);
});


test('Check each item has name with more then 1 symbol', async ({ page }) => {
  const items =  page.locator('#tbodyid .card');
  await expect(items.first()).toBeVisible();  
  await expect(items).toHaveCount(9); 
  const countItems = await items.count();
  for(let i = 0; i < countItems; i++){
    const name = await page.locator('.card-title').nth(i).textContent();
    expect(name.length).toBeGreaterThan(1);
  }
});


test('Add to cart', async ({ page }) => {
  const items =  page.locator('#tbodyid .card');
  const countItems = await items.count();
  const randomIndex =  Math.floor(Math.random() * countItems); 
  await page.locator('#tbodyid .card a').nth(randomIndex).click(); 
  await expect(page.locator('.price-container')).toBeVisible();

  const productName = await page.locator('.product-content .name').textContent();

  const dialogPromise = page.waitForEvent('dialog');
  await page.getByRole('link', { name: 'Add to cart' }).click();
  const dialog = await dialogPromise;

  expect(dialog.message()).toBe('Product added');
  await dialog.accept();

  await page.locator('#cartur').click();
  await expect(page).toHaveURL(/cart/);

  const tableRows = await page.locator('#tbodyid tr');
  await expect(tableRows).toHaveCount(1);
  const productCartName = await page.locator('#tbodyid tr td').nth(1).textContent();
  expect(productCartName).toEqual(productName);
});


test('Place an order', async ({ page }) => {
  const checkout = new CheckoutPage(page);
  const items =  page.locator('#tbodyid .card');
  const countItems = await items.count();
  const randomIndex =  Math.floor(Math.random() * countItems); 
  await page.locator('#tbodyid .card a').nth(randomIndex).click(); 
  await expect(page.locator('.price-container')).toBeVisible();

  const productName = await page.locator('.product-content .name').textContent();

  const dialogPromise = page.waitForEvent('dialog');
  await page.getByRole('link', { name: 'Add to cart' }).click();
  const dialog = await dialogPromise;

  expect(dialog.message()).toBe('Product added');
  await dialog.accept();

  await page.locator('#cartur').click();
  await expect(page).toHaveURL(/cart/);

  const tableRows = await page.locator('#tbodyid tr');
  await expect(tableRows).toHaveCount(1);
  const productCartName = await page.locator('#tbodyid tr td').nth(1).textContent();
  expect(productCartName).toEqual(productName);

  await page.getByRole('button', {name: 'Place Order'}).click();
  await expect(page.getByRole('button', {name: 'Purchase'})).toBeVisible();

  const future = faker.date.future();
  const paymentData = {
    name: faker.person.fullName(),
    country: faker.location.country(),
    city: faker.location.city(),
    card: faker.finance.creditCardNumber(),
    month: String(future.getMonth() + 1).padStart(2, '0'),
    year: String(future.getFullYear()).slice(-2),
  };

  await checkout.fillPaymentForm(paymentData);
  await checkout.purchase();

  await expect(page.getByRole('heading', { name: 'Thank you for your purchase!' })).toBeVisible();


});


