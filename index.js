const config = require('./config');
const fs = require('fs');

const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;

const driver = new webdriver.Builder()
  .forBrowser('safari')
  .build();

const logFile = '.log';

fs.appendFile(logFile, '\n\n' + new Date() + '\n\n');

const cardSelector = '.mn-pymk-list__card:not(.mn-pymk-list__card--dismissed)';
const nameSelector = '.mn-person-info__name';
const buttonSelector = 'button[data-control-name="invite"]';

driver.get('https://www.linkedin.com/');

driver.wait(until.elementLocated(By.xpath('//*[@id="login-email"]')), 100000);

driver.findElement(By.xpath('//*[@id="login-email"]')).sendKeys(config.email);
driver.findElement(By.xpath('//*[@id="login-password"]')).sendKeys(config.pass);
driver.findElement(By.xpath('//*[@id="login-submit"]')).click();

driver.wait(until.urlContains('feed'), 100000);

driver.get('https://www.linkedin.com/mynetwork/');

driver.wait(until.elementLocated(By.css(cardSelector)), 100000);
driver.executeScript('scrollBy(0, 1000)');

const maxCount = config.inviteCount;
let   count = 0;

function sendInvitation() {
  console.log("Sending invite count: " + (count + 1));
  driver.findElement(By.css(cardSelector))
    .then(card => {
      card.findElement(By.css(buttonSelector)).click();
      return card.findElement(By.css(nameSelector));
    })
    .then(name => name.getText())
    .then(text => {
      console.log(text.trim());
      fs.appendFile(logFile, text.trim() + '\n');
    })
    .then(_ => driver.executeScript('scrollBy(0, 1000)'))
    .then(_ => {
      if (++count >= maxCount)
        return;

      setTimeout(sendInvitation, 500);
    })
    .catch((err) => {
      console.error(err);
    });
}

sendInvitation();
