import axios from "axios";
import cheerio from "cheerio";

let numberOfMappedResults = 0;

const getHtml = async (
  searchTerm,
  url = `https://www.ebay.com/sch/i.html?_from=R40&_trksid=p2334524.m570.l1311&_nkw=${searchTerm}&_sacat=0&LH_TitleDesc=0&_pgn=1`
) => {
  try {
    //get the response from the search url
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Node.js",
      },
    });
    console.log(url);
    return data;
  } catch (err) {
    console.log(err.response);
  }
};

const getEbayPrices = ($) => {
  //Function gets the data i want by using cheerio and finding the paths to the info i need
  const pathForItemInfo = $.find("div[class='s-item__info clearfix']");
  const title = pathForItemInfo
    .find("a[class='s-item__link']>h3[class='s-item__title']")
    .text()
    .trim();
  const subTitle = pathForItemInfo
    .find("div[class='s-item__subtitle']")
    .text()
    .trim();
  const pathForPriceInfo = $.find("div[class='s-item__details clearfix']");
  const price = pathForItemInfo
    .find(
      "div[class='s-item__detail s-item__detail--primary'] > span[class='s-item__price']"
    )
    .text()
    .trim();
  const shippingInfo = pathForPriceInfo
    .find(
      "div[class='s-item__detail s-item__detail--primary']> span[class='s-item__shipping s-item__logisticsCost']"
    )
    .text()
    .trim();

  const link = $.find("a[class='s-item__link']").attr("href").trim();
  //returns title of ebay listing, subtitle, shipping,price and the link
  return { title, subTitle, price, shippingInfo, link };
};
const formatResults = async (data) => {
  //this function formats the results, it maps each result on the search results
  //to the getEbayPrices function which gets all the info we want.
  const $ = cheerio.load(data);
  const results = $(
    "ul[class='srp-results srp-list clearfix']> li[class='s-item    s-item--watch-at-corner']"
  );
  const mapResults = results
    .map((ind, ele) => {
      const elementselect = $(ele);
      return getEbayPrices(elementselect);
    })
    //after mapping the results to a new array.
    //get() gets the array from the cheerio object it extracts it.
    .get();
  const numberOfResults = mapResults.length - 1;
  numberOfMappedResults = numberOfResults;

  return `${numberOfResults},${JSON.stringify(mapResults, null, 2)}`;
};
const getClHtml = async (searchTerm) => {
  try {
    const { data } = await axios.get(
      `https://newyork.craigslist.org/d/for-sale/search/sss?query=${searchTerm}&sort=rel`
    );
    return data;
  } catch (err) {
    console.log(`error:${response.err}`);
  }
};
const scrapperEbay = async (searchTerm) => {
  try {
    const htmlData = await getHtml(searchTerm);
    const displayedResults = await formatResults(htmlData);
    console.log(numberOfMappedResults);

    //Recursive approach to pagination doesnt work very buggy requires me to make the getHtml() to recieve a URL as a parameter instead of a searchTerm

    if (numberOfMappedResults === 0) {
      //in order to view the actual data we need to convert the array to a string and return it.
      return displayedResults;
    } else {
      let url = `https://www.ebay.com/sch/i.html?_from=R40&_trksid=p2334524.m570.l1311&_nkw=${searchTerm}&_sacat=0&LH_TitleDesc=0&_pgn=1`;
      //so we need to get the number of the next page which is done by this regular expression.
      // regex gets the last portion of the url which contains the page number
      //it turns the string into a number value with the parseInt function
      //then it adds one to the value that was extracted.
      const numberOfNextPage = parseInt(url.match(/pgn=(\d+)$/)[1], 10) + 1;
      //after the numberOfNextPage is retrieved, concatenate it into the url to retrieve the next page of the search results.
      const nextPage = `https://www.ebay.com/sch/i.html?_from=R40&_trksid=p2334524.m570.l1311&_nkw=${searchTerm}&_sacat=0&LH_TitleDesc=0&_pgn=${numberOfNextPage}`;
      const nextPageDat = await getHtml(searchTerm, nextPage);

      const nextPageRes = await formatResults(nextPageDat);
      console.log(displayedResults.concat(nextPageRes));
      return displayedResults.concat(nextPageRes);
    }
  } catch (error) {
    console.log(error);
  }
};
/*
const getKehData = () => {};
/*const getClprices = ($) => {
  const clSearchRes = $.find(
    'div[class="bq4bzpyk j83agx80 btwxx1t3 lhclo0ds jifvfom9 muag1w35 dlv3wnog enqfppq2 rl04r1d5"]'
  );
  const indvidClSearchRes = clSearchRes
    .find(
      "div[class='rq0escxv j83agx80 cbu4d94t i1fnvgqd muag1w35 pybr56ya f10w8fjw k4urcfbm c7r68pdi suyy3zvx']"
    )
    .text()
    .trim();
  return indvidFbSearchRes;
};
*/
export { scrapperEbay };
