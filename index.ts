import puppeteer, { HTTPResponse, Puppeteer } from 'puppeteer'
;(async () => {
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
  })

  const page = await browser.newPage()
  page.setUserAgent(
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.82 Safari/537.36'
  )

  // await login(page)
  // go to creators page
  await gotoCreator(page)

  await scrapeCreator(page)
  await browser.close()
})()

async function scrapeCreator(page: puppeteer.Page) {
  const moreButtonSelector = 'div[class^="CreatorsMarketStats_loadMoreContainer"] button[class]'
  await page.waitForSelector(moreButtonSelector)
  let numOfFailure = 0
  for (let i = 0; i < 100; i++) {
    console.log('processing load more', i)
    const result = await loadMore(page)
    if (result === false) {
      numOfFailure++
    } else {
      numOfFailure = 0
    }
    if (numOfFailure === 3) {
      console.error('failed 3 time in a row, stop')
      break
    }
  }
  await page.waitForTimeout(1000)
  await listCreators(page)
}

async function loadMore(page: puppeteer.Page) {
  await page.emulateNetworkConditions(puppeteer.networkConditions['offline'])
  const moreButtonSelector = 'div[class^="CreatorsMarketStats_loadMoreContainer"] button[class]'
  const offset = await page.evaluate((selector) => {
    // const moreButton = getElementByXpath(xpath)
    const moreButton = document.querySelector<HTMLElement>(selector)
    const offset = moreButton?.offsetTop
    if (!offset) {
      return 0
    }
    window.scrollTo(0, offset - 200)
    return offset
  }, moreButtonSelector)
  await page.waitForTimeout(500)
  if (offset === 0) {
    console.error('skip the click the button')
    return false
  }
  const moreButtonByXpath = await page.waitForSelector(moreButtonSelector)
  await moreButtonByXpath?.click()
  await page.waitForTimeout(500)
  return true
}

async function listCreators(page: puppeteer.Page) {
  const coinIds = await page.evaluate(() => {
    const coinsSelector = 'div[id^="cell-coin-"]'
    const coins = Array.from(document.querySelectorAll(coinsSelector))
    return coins.map((c) => c.parentElement?.innerText.split('\n'))
  })
  console.log(coinIds.join('\n'))
  return coinIds
}

async function gotoCreator(page: puppeteer.Page) {
  // await page.click('a[href="/creator/"]')
  // await page.waitForNavigation()
  await page.goto('https://rally.io/creator')
  await page.waitForSelector('div[id^="cell-coin-"]')
}

async function login(page: puppeteer.Page) {
  await page.goto('https://rally.io/login')
  const emailInput = await page.waitForSelector('input[name=email')
  await emailInput?.type('rally.rally.rally@outlook.com')
  await page.type('input[name=password]', 'Rally2Rally')
  await page.click('button[type="submit"]')
  await page.screenshot({ path: 'login.png' })
  await page.waitForXPath('//*[contains(text(),"RallyTheFuture")]')
  await page.screenshot({ path: 'afterLogin.png' })
}
