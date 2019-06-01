import puppeteer from "puppeteer";

const recieveRequest = (searchWrod: string) => {
  return `https://www.google.co.jp/search?num=10&q=${searchWrod}`;
}

const scrape = async () => {
  const uri = recieveRequest("typescript scraping");
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(uri);

  const links = await page.evaluate(`
    function getUri() {
      const elms = document.querySelector('#rso').firstChild.querySelectorAll('.r');
      const hrefs = [];
      for(let i = 0; i < elms.length; i++) {
        const elm = elms[i];
        hrefs.push(elm.firstChild.getAttribute("href"));
      }
      return hrefs;
    }
    getUri();
  `);

  console.log(links);

  browser.close();

  return;
}

scrape();
