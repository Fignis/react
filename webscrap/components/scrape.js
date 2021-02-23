import axios from "axios";
import cheerio from "cheerio";

const getHtml = async (searchTerm) => {
  //this is the first page of the search term, we dont know the max number of pages per result of search term.
  const url = `https://www.ebay.com/sch/i.html?_from=R40&_trksid=p2334524.m570.l1311&_nkw=${searchTerm}&_sacat=0&LH_TitleDesc=0&_pgn=1`;
  //so we need to get the number of the next page which is done by this regular expression.
  //im not quite familiar with regular expressions however, what this does it gets the last portion of the url which contains the page number
  //it turns the string into a number value with the parseInt function
  //then it adds one to the value that was extracted.
  const numberOfNextPage = parseInt(url.match(/pgn=(\d+)$/)[1], 10) + 1;
  //after the numberOfNextPage is retrieved, concatenate it into the url to retrieve the next page of the search results.
  const nextPage = `https://www.ebay.com/sch/i.html?_from=R40&_trksid=p2334524.m570.l1311&_nkw=${searchTerm}&_sacat=0&LH_TitleDesc=0&_pgn=${numberOfNextPage}`;
  console.log(nextPage);
  try {
    //get the response from the search url
    const { data } = await axios.get(url, {
      headers: {
        "User-Agent": "Node.js",
      },
    });
    return data;
  } catch (err) {
    console.log(err.response);
  }
};

const getEbayPrices = async ($) => {
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
    .find("div[class='s-item__detail s-item__detail--primary']")
    .text()
    .trim();

  const link = $.find("a[class='s-item__link']").attr("href").trim();
  //returns title of ebay listing, subtitle, shipping,price and the link
  return { title, subTitle, price, shippingInfo, link };
};
const formatResults = (data) => {
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
    .get();
  console.log(mapResults);
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
export { getHtml, getEbayPrices, formatResults, getClHtml };
