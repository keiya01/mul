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
      const links = [];
      for(let i = 0; i < elms.length; i++) {
        const elm = elms[i];
        const aTag = elm.firstChild;
        const link = {
          title: aTag.querySelector('.LC20lb').innerText,
          url: aTag.getAttribute('href'),
        }
        links.push(link);
      }
      return links;
    }
    getUri();
  `);

  browser.close();

  return links;
}

const asyncSearch = (links: Link[], searchWords: string[]) => {
  let index = 0, running = 0, limitRunning = 3, totalCompleted = 0;
  const search = (links: Link[], searchWords: string[]) => {
    if (totalCompleted === searchWords.length) {
      console.log(links);
      process.exit();
    }

    while (running < limitRunning && index < searchWords.length) {
      const word = searchWords[index];
      if (word === "") {
        index++;
        continue;
      }

      console.log(`Searching "${word}" now ...`);
      scrape(word).then((searchResult: SearchResult[]) => {
        running--;
        totalCompleted++;
        links.push({
          searchWord: word,
          links: searchResult
        });
        search(links, searchWords);
      });

      running++;
      index++;
    }
  }
  search(links, searchWords);
}

interface SearchResult {
  title: string;
  url: string;
}

interface Link {
  searchWord: string;
  links: SearchResult[];
}

const main = () => {
  console.log("Search inputted word to find 5 urls of each words");

  const stdin = newStdin();

  process.stdout.write("gsearch > ");
  stdin.on("data", async (_data: string) => {
    const data = _data.slice(0, _data.length - 1);

    // Make user enter data with / break
    const searchWords = data.split("/");

    asyncSearch([], searchWords);
  });
}

main();
