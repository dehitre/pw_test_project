export class ProductPage {
  constructor(page) {
    this.page = page;
    this.productPrice = page.locator('.price-container');
    this.productName = page.locator('.product-content .name');
    this.addToCartButton = page.getByRole('link', { name: 'Add to cart' });
  }

  async getProductPrice(){
    const productPriceText = await this.productPrice.textContent();
    return Number(productPriceText.split(' ')[0].replace('$', '').trim());
  }

  async clickAddToCart(){
    await this.addToCartButton .click();
  }

  
}