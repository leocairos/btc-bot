import { Router } from 'express';

const router = Router();

router.get('/btc-bot/health', (req, res, next) => {
  res.json({
    message: `${process.env.MS_NAME} is up and running!`,
    checkInterval: `Every ${process.env.INTERVAL_TO_CHECK} seconds`,
    mailRecipient: `${(process.env.MAIL_TO)?.substring(0, 4)}***`,
    downLimiteAlert: `${process.env.BTC_ALERT_DOWN}%`,
  })
});

export default router;