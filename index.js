const creds = require('./creds');
const fs = require('fs');

const webdriver = require('selenium-webdriver');
const By = webdriver.By;
const until = webdriver.until;

const driver = new webdriver.Builder()
  .forBrowser('safari')
  .build();

const logFile = '.log';

fs.appendFile(logFile, '\n\n' + new Date() + '\n\n');

const cardSelector = '.mn-person-card.pymk-card:not(.mn-person-card--dismiss):not(mn-person-card--dismiss-complete)';
const nameSelector = '.mn-person-info__name';
const buttonSelector = 'button[data-control-name="invite"]';

driver.get('https://www.linkedin.com/');

driver.wait(until.elementLocated(By.xpath('//*[@id="login-email"]')), 100000);

driver.findElement(By.xpath('//*[@id="login-email"]')).sendKeys(creds.email);
driver.findElement(By.xpath('//*[@id="login-password"]')).sendKeys(creds.pass);
driver.findElement(By.xpath('//*[@id="login-submit"]')).click();

driver.wait(until.urlContains('feed'), 100000);

driver.get('https://www.linkedin.com/mynetwork/');

driver.wait(until.elementLocated(By.css(cardSelector)), 100000);
driver.executeScript('scrollBy(0, 1000)');

let i = 0;

function sendInvitations() {
  console.log("Sending invite count: " + i);
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
    .then(_ => {
      driver.executeScript('scrollBy(0, 1000)');
      i++;
    }).then(_ => {
      setTimeout(sendInvitations, 500);
    })
    .catch((err) => {
      console.error(err);
    });
}

sendInvitations();
