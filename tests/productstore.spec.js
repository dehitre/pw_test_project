import { test, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { CheckoutPage } from '../pages/checkout_page';
import { MainPage } from '../pages/main_page';
import { LoginPage } from '../pages/login_page';
import { ProductPage } from '../pages/product_page';
import { CartPage } from '../pages/cart_page';

let mainPage;

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  mainPage = new MainPage(page);
});


test('Main page has 6 items', async ({ page }) => {
  await expect(mainPage.productCards).toHaveCount(6);
});


test('Login user', async ({ page }) => {
  await mainPage.topMenuLogin.click();
  const loginPage = new LoginPage(page);
  await expect(loginPage.userName).toBeVisible();
  await loginPage.login(process.env.USER_LOGIN, process.env.USER_PASSWORD);
  await expect(mainPage.loggedInUserName).toHaveText(`Welcome ${process.env.USER_LOGIN}`);
});


test('Check price matches for main page and card', async ({ page }) => {
  const countItems = await mainPage.getItemsCount();
  const randomIndex =  Math.floor(Math.random() * countItems); 
  const price = await mainPage.getItemPrice(randomIndex);

  await mainPage.clickItemLink(randomIndex);
  const productPage = new ProductPage(page);
  await expect(productPage.productPrice).toBeVisible();

  const productPrice = await productPage.getProductPrice();

  expect(productPrice).toEqual(price);
});


test('Check each item has name with more then 1 symbol', async ({ page }) => {
  const items =  mainPage.productCards;
  await expect(items.first()).toBeVisible();  
  await expect(items).toHaveCount(9); 
  const countItems = await items.count();
  for(let i = 0; i < countItems; i++){
    const name = await mainPage.cardTitle.nth(i).textContent();
    expect(name.length).toBeGreaterThan(1);
  }
});


test('Add to cart', async ({ page }) => {
  const countItems = await mainPage.getItemsCount();
  const randomIndex =  Math.floor(Math.random() * countItems); 
  await mainPage.clickItemLink(randomIndex);
  const productPage = new ProductPage(page);
  await expect(productPage.productPrice).toBeVisible();

  const productName = await productPage.productName.textContent();

  const dialogPromise = page.waitForEvent('dialog');
  await productPage.clickAddToCart();
  const dialog = await dialogPromise;

  expect(dialog.message()).toBe('Product added');
  await dialog.accept();

  await mainPage.topMenuCart.click();
  await expect(page).toHaveURL(/cart/);

  const cartPage = new CartPage(page);

  const tableRows = await cartPage.rows;
  await expect(tableRows).toHaveCount(1);
  const productCartName = await cartPage.cell.nth(1).textContent();
  expect(productCartName).toEqual(productName);
});


test('Place an order', async ({ page }) => {
  const checkout = new CheckoutPage(page);
  const countItems = await mainPage.getItemsCount();
  const randomIndex =  Math.floor(Math.random() * countItems); 
  await mainPage.clickItemLink(randomIndex);
  const productPage = new ProductPage(page);
  await expect(productPage.productPrice).toBeVisible();

  const productName = await productPage.productName.textContent();

  const dialogPromise = page.waitForEvent('dialog');
  await productPage.clickAddToCart();
  const dialog = await dialogPromise;

  expect(dialog.message()).toBe('Product added');
  await dialog.accept();

  await mainPage.topMenuCart.click();
  await expect(page).toHaveURL(/cart/);

  const cartPage = new CartPage(page);

  const tableRows = await cartPage.rows;
  await expect(tableRows).toHaveCount(1);
  const productCartName = await cartPage.cell.nth(1).textContent();
  expect(productCartName).toEqual(productName);
  
  await cartPage.purchaseButton.click();
  await expect(cartPage.purchaseButton).toBeVisible();

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


