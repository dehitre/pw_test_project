export class MainPage {
    constructor(page) {
        this.page = page;
        this.productCards = page.locator('#tbodyid .card');
        this.topMenuLogin = page.locator('#login2');
        this.topMenuCart = page.locator('#cartur');
        this.loggedInUserName = page.locator('#nameofuser');
        this.itemList = page.locator('#tbodyid .card');
        this.prices = page.locator('#tbodyid .card h5');
        this.itemLink = page.locator('#tbodyid .card a');
        this.cardTitle = page.locator('.card-title');
    }

    async getItemsCount() {
        return await this.productCards.count();
    }

    async getItemPrice(itemIndex) {
        const priceText = await this.prices.nth(itemIndex).textContent();
        return Number(priceText.replace('$', '').trim());
    }

    async clickItemLink(itemIndex) {
        await this.itemLink.nth(itemIndex).click();
    }

}
