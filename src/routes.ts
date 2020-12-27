import { Router } from 'express';

import controller from './controller';

const router = Router();

router.get('/btc-bot/mercadobitcoin-ticker', controller.getBTCTocker);

export default router;