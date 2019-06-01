import puppeteer from "puppeteer";

const newStdin = () => {
  const stdin = process.stdin;
  stdin.setEncoding("utf-8");
  return stdin;
}

const scrape = async (searchWord: string) => {
  const uri = `https://www.google.co.jp/search?num=5&q=${searchWord}`;
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(uri);

  const links = await page.evaluate(`
    function getUri() {
      const elms = document.querySelector('#rso').querySelectorAll('.r');
      const hrefs = [];
      for(let i = 0; i < elms.length; i++) {
        const elm = elms[i];
        hrefs.push(elm.firstChild.getAttribute("href"));
      }
      return hrefs;
    }
    getUri();
  `);

  browser.close();

  return links;
}

const main = () => {
  console.log("Search inputted word to find 5 urls of each words");

  const stdin = newStdin();
  
  process.stdout.write("gsearch > ");
  stdin.on("data", async (_data: string) => {
    const data = _data.slice(0, _data.length - 1);

    // Make user enter data with / break
    const searchWords = data.split("/");

    const asyncSearch = searchWords.map(async word => {
      if(word === "") {
        console.log("Can not empty");
        process.stdout.write("gsearch > ");
        return;
      }
      
      if(word === "exit\n") {
        console.log("done!\n");
        process.exit();
      }
      
      console.log(`Searching "${word}" now ...`);
      return await scrape(word);
    });

    console.log(await Promise.all(asyncSearch));
    process.stdout.write("gsearch > ");
  });
}

main();
