import { browser, by, element, promise, ExpectedConditions, ElementFinder } from 'protractor';

export class Page {

  public static getTitleText(): promise.Promise<string> {
    return element.all(by.css('app-root ion-toolbar ion-title')).last().getText();
  }

  public static async clickActionItem(target: ElementFinder, item: string): Promise<void> {
    const menuButton = target.element(by.css('ion-button.menu'));
    await this.scrollIntoView(menuButton);
    await menuButton.click();
    const button = element(by.cssContainingText('ion-item', item));
    await this.waitForElement(button);
    return element(by.cssContainingText('ion-item', item)).click();
  }

  /**
   * Waits for the given element to be clickable, especially
   * when it's already in the DOM due to being on another
   * page.
   */
  public static waitForElement(target: ElementFinder, timeout = 5000): promise.Promise<void> {
    return browser.wait(
      ExpectedConditions.and(
        ExpectedConditions.elementToBeClickable(target),
        ExpectedConditions.presenceOf(target)
      ), timeout);
  }

  public static async waitForText(target: ElementFinder, text: string): Promise<void> {
    await this.waitForElement(target);
    return browser.wait(ExpectedConditions.textToBePresentInElement(target, text), 2500);
  }

  public static async scrollIntoView(target: ElementFinder): Promise<void>  {
    await browser.executeScript(
      'arguments[0].scrollIntoView({ block: "center", behavior: "instant" })',
      target.getWebElement());
    return browser.sleep(200);
  }

  public static waitForToast(timeout = 1000): promise.Promise<void> {
    return browser.wait(ExpectedConditions.presenceOf(element(by.css('ion-toast'))), timeout);
  }

  public static async getToastMessage(timeout = 4000): Promise<string> {
    await this.waitForToast(timeout);
    return element(by.css('ion-toast')).getText();
  }

  public static async expectToastMessage(message: string): Promise<void> {
    expect(await Page.getToastMessage()).toEqual(message);
    return Page.waitForToastGone();
  }

  public static waitForToastGone(timeout = 6000): promise.Promise<void> {
    return browser.wait(
      ExpectedConditions.not(
        ExpectedConditions.presenceOf(
          element(by.css('ion-toast')))), timeout);
  }

  public static waitForLoadingGone(timeout = 3000): promise.Promise<void> {
    return browser.wait(
      ExpectedConditions.not(
        ExpectedConditions.presenceOf(
          element(by.css('ion-loading')))), timeout);
  }
}
