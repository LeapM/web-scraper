const puppeteer = require("puppeteer");

(async () => {
  const browser = await puppeteer.launch({
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  });

  const page = await browser.newPage();
  page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36"
  );
  await page.goto("https://rally.io/login");
  await page.waitForSelector("input[name=email");
  await page.type("input[name=email]", "rally.rally.rally@outlook.com");
  await page.type("input[name=password]", "Rally2Rally");
  await page.click('button[type="submit"]');
  await page.screenshot({ path: "login.png" });
  await page.waitForXPath('//*[contains(text(),"RallyTheFuture")]');
  await page.screenshot({ path: "aftgerlogin.png" });
  // go to creators page
  await browser.close();
})();
