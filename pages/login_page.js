export class LoginPage {
  constructor(page) {
    this.page = page;
    this.userName = page.locator('#loginusername');
    this.userPassword = page.locator('#loginpassword');
    this.loginButton = page.getByRole('button', { name: 'Log in' });
  }

  async login(username, password) {
    await this.userName.fill(username);
    await this.userPassword.fill(password);
    await this.loginButton.click();
  }
}