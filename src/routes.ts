import { Router } from 'express';

import { formatter, dataTicker, getTicker } from './monitorBTC'

const router = Router();


router.get('/btc-bot/health', async (req, res, next) => {
  const ticker = await getTicker();
  const { maior, menor, ultima, tickerDate, variacao } = dataTicker(ticker);
  res.json({
    message: `${process.env.MS_NAME} is up and running!`,
    checkInterval: `Every ${process.env.INTERVAL_TO_CHECK} seconds`,
    mailRecipient: `${(process.env.MAIL_TO)?.substring(0, 4)}***`,
    downLimiteAlert: `${process.env.BTC_LIMIT_VAR_DOWN}%`,
    topLimiteAlert: `${process.env.BTC_LIMIT_VAR_TOP}%`,
    BTCBase: `${formatter.format(Number(process.env.BTC_BASE_IN_BRL))}`,
    ticker: {
      tickerDate,
      high: maior,
      low: menor,
      last: ultima,
      variation: `${variacao.toFixed(4)}%`
    }
  })
});

export default router;