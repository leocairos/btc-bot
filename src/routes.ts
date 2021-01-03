import { Router } from 'express';

import { formatter, dataTicker, getTicker } from './monitorBTC';

import { insertData } from './model';
import { config } from './config';
import ensureKeyAuthorization from './ensureKeyAuthorization';

const router = Router();

router.get('/btc-bot/health', async (req, res, next) => {
  try {
    const configs = await config();

    const ticker = await getTicker();
    const { maior, menor, ultima, tickerDate, variacao } = dataTicker(ticker);
    res.json({
      message: `${process.env.MS_NAME} is up and running!`,
      checkInterval: `Every ${configs.intervalToCheck} minutes`,
      mailRecipient: `${(configs.mailTo)?.substring(0, 4)}***`,
      downLimiteAlert: `${configs.downLimit}%`,
      topLimiteAlert: `${configs.topLimit}%`,
      BTCBase: `${formatter.format(Number(configs.btcBase))}`,
      ticker: {
        tickerDate,
        high: maior,
        low: menor,
        last: ultima,
        variation: `${variacao.toFixed(3)}%`
      }
    })

  } catch (error) {
    console.log(`${error}`);
  }


});

router.post('/btc-bot/preferences', ensureKeyAuthorization, async (req, res, next) => {
  const { interval, topLimit, downLimit, email, btcBase } = req.body;
  const result = await insertData(interval, email, topLimit, downLimit, btcBase);
  return res.json(result);
})

export default router;