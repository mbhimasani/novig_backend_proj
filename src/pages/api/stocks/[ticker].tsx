import type { NextApiRequest, NextApiResponse, GetStaticProps, GetStaticPaths  } from 'next';
import { Data, Article, getStockInfo } from '../../../lib/utils';
import redis from '../../../lib/redis';

interface ExtendedNextApiRequest extends NextApiRequest {
  query: {
    ticker: string;
  };
}

export default async function getTicker(req: ExtendedNextApiRequest, res:NextApiResponse<Data>) {
  if (!req.query) {return res.json({symbol: 'none'})}

  // set up URL to FMP API
  const baseURL = process.env.API_URL;
  const apiKey = 'apikey=' + process.env.API_KEY;
  const symbol = req.query.ticker.toUpperCase();
  let todayEnd = new Date().setHours(23, 59, 59, 999);

  const cache = await redis.get(symbol)
  if (cache) {
    console.log("found cache")
    return res.json(JSON.parse(cache))
  } else {
  
    // paths
    const currPriceEndpt = "quote-short/"+symbol+"?";
    const dt = (new Date().getFullYear()-1) + "-" +  ('0' + (new Date().getMonth()+1)).slice(-2) + "-" + new Date().getDate();
    const histPriceEndpt = "historical-price-full/"+symbol+"?from="+dt+"&to="+dt+"&";
    const deltaPriceEndpt = "stock-price-change/"+symbol+"?";
    const profileEndpt = "profile/"+symbol+"?";

    return await Promise.all([
      getStockInfo(baseURL, currPriceEndpt, apiKey), 
      getStockInfo(baseURL, histPriceEndpt, apiKey),
      getStockInfo(baseURL, deltaPriceEndpt, apiKey),
      getStockInfo(baseURL, profileEndpt, apiKey)
    ])
    .then(function (results) {
      // const currPr = results[0].data[0];
      // const histPr = results[1].data.historical[0];
      // const deltaPr = results[2].data[0];
      // const profile = results[3].data[0];

      const [
        {
          data: [currPrice]
        },
        {
          data: {
            historical: [histPrice]
          },
        },
        {
          data: [deltaPrice]
        },
        {
          data: [profile]
        },
      ] = results

      const info = { 
        symbol: symbol,
        currentPrice: currPrice.price,
        historical: {
          date: histPrice.date,
          open: histPrice.open,
          high: histPrice.high,
          low: histPrice.low,
          close: histPrice.close
        },
        changeOverTime: deltaPrice["1Y"],
        profile: {
          companyName: profile.companyName,
          ceo: profile.ceo,
          sector: profile.sector,
          state: profile.state,
          country: profile.country,
          fullTimeEmployees: profile.fullTimeEmployees,
          ipoDate: profile.ipoDate,
          description: profile.description
        }
      }
      redis.set(symbol, JSON.stringify(info), 'EX', Math.floor(todayEnd/1000))
      res.json(info)
    })
    .catch(function (error) {
      if (error.response) {
        res.status(error.response.status).send({symbol: symbol, error: error.code});
      }
      else {
        console.log(error.message)
        res.status(400).send({symbol: symbol, error: 'Invalid Ticker'});
      }
    })
  }
}

// Omitted: Stocks news, sometimes the endpoint works and 
// sometimes it doesn't. I think it has a limit on calls.
// const newsEndpt = "stock_news?tickers="+symbol+"&limit=5&";
// getStockInfo(baseURL, newsEndpt, apiKey)
// let articles: Article[] = [];
// const news = results[4].data[0];
// news.data.forEach((story: Article) => {
//   articles.push({
//     title: story.title,
//     publishedDate: story.publishedDate,
//     text: story.text,
//     url: story.url
//   })
// });
// Omitted: ESG Score is a special endpoint - not available in the free plan
// const baseURLV4 = process.env.API_URL_V4;
// const esgEndpt = "esg-environmental-social-governance-data?"+symbol+"&";
// getStockInfo(baseURLV4, esgEndpt, apiKey),
// const esgScore = results[5];
