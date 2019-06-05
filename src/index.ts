import puppeteer from "puppeteer";
import Loader from "./loader";

interface SearchResult {
  title: string;
  url: string;
}

interface Link {
  searchWord: string;
  links: SearchResult[];
}

const color = (colorNum: string) => (text: string) => `\u001b[${colorNum}m${text}\u001b[0m`;
const Colors = {
  red: color('31'),
  magenta: color('35'),
  cyan: color('36'),
};

const loader = new Loader();

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

const formatSearchResult = (searchResult: Link[]) => {
  process.stdin.write("\n");
  searchResult.map(({ searchWord, links }) => {
    console.log(`${Colors.magenta(searchWord)}`);
    links.map(({ title, url }) => {
      console.log(` - ${title}`);
      console.log(`   ${Colors.cyan(url)}`);
    });
    process.stdin.write("\n");
  });
}

const asyncSearch = (links: Link[], searchWords: string[]) => {
  let index = 0, running = 0, limitRunning = 3, totalCompleted = 0;
  loader.print(0, searchWords[0]);
  const search = (links: Link[], searchWords: string[]) => {
    if (totalCompleted === searchWords.length) {
      loader.print(100, "");
      formatSearchResult(links);
      process.exit();
    }
    
    while (running < limitRunning && index < searchWords.length) {
      const word = searchWords[index];
      if (word === "") {
        index++;
        continue;
      }
      
      scrape(word).then((searchResult: SearchResult[]) => {
        loader.print(loader.percentage + 3, word);
        running--;
        totalCompleted++;
        links.push({
          searchWord: word,
          links: searchResult
        });
        loader.print(totalCompleted / searchWords.length * 100, word);
        search(links, searchWords);
      }).catch(() => {
        running--;
        totalCompleted++;
        console.log(Colors.red(`[ERROR] Could not fetch this data: ${word}`));
        loader.print(totalCompleted / searchWords.length * 100, word);
        search(links, searchWords);
      });

      running++;
      index++;
    }
  }
  search(links, searchWords);
}

const main = () => {
  const cmdArgs = process.argv;

  let isSetCmd = false;
  const searchWords: string[] = [];
  cmdArgs.forEach(arg => {
    if (isSetCmd) {
      searchWords.push(arg);
      return;
    }

    if (arg === "-s" || arg === "--set") {
      isSetCmd = true;
      return;
    }
  });

  if (searchWords.length !== 0) {
    asyncSearch([], searchWords);
  }
}

main();
