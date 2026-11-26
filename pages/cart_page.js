export class CartPage {
  constructor(page) {
    this.page = page;
    this.rows = page.locator('#tbodyid tr');
    this.cell = page.locator('#tbodyid tr td');
    this.purchaseButton = page.getByRole('button', {name: 'Place Order'});
  }

}