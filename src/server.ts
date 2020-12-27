import { CronJob } from 'cron';
import axios from 'axios';

import app from "./app";
import sendMail from './sendMail';

const intervalToCheck = parseInt(`${process.env.INTERVAL_TO_CHECK}`);

interface IOriginalTicker {
  high: string;
  low: string;
  vol: string;
  last: string;
  buy: string;
  sell: string;
  open: string;
  date: number;
}

const htmlMessage = (parms: IOriginalTicker) => {
  const { high, low, last, date } = parms;
  const maior = new Intl.NumberFormat('pt-BR').format(Number(high));
  const menor = new Intl.NumberFormat('pt-BR').format(Number(low));
  const ultima = new Intl.NumberFormat('pt-BR').format(Number(last));
  const tickerDate = new Date(date * 1000).toUTCString();
  let html = `Em ${tickerDate} o Bitcoin apresentou:<br> `
  html += `Ultima cotação em R$ ${ultima}<br>`;
  html += `Menor cotação em R$ ${menor}<br>`;
  html += `Maior cotação em R$ ${maior}<br>`;

  return html;
}

const monitorBTC = () => {
  console.log(`Every ${intervalToCheck} seconds check BTC value`);
  try {
    const job = new CronJob(
      `*/${process.env.INTERVAL_TO_CHECK} * * * * *`,
      () => {
        setTimeout(async () => {
          //Retorna informações com o resumo das últimas 24 horas de negociações.
          const { data } = await axios
            .get('https://www.mercadobitcoin.net/api/BTC/ticker/');
          const originalTicker = data.ticker as IOriginalTicker;
          const tickerDate = new Date(originalTicker.date * 1000).toUTCString();
          console.log('originalTicker', originalTicker, tickerDate);

          const variacaoInf = 1 - Number(originalTicker.last) / Number(originalTicker.high);
          const limiteInf = parseInt(`${process.env.BTC_ALERT_DOWN}`) / 100;
          console.log(`Variação de ${variacaoInf} limite ${limiteInf}`)

          if (variacaoInf >= limiteInf) { // identificar queda maior que X%
            const html = htmlMessage(originalTicker);
            sendMail({ subject: 'BTC-Bot Alert', html })
          } else {
            console.log(`Variação de ${limiteInf}`)
          }

        }, 2000);
      });
    job.start();
  } catch (err) {
    console.log(`Finished with error: ${err}`);
  }
}

(async () => {

  try {
    const port = parseInt(`${process.env.PORT}`);

    await app.listen(port);
    console.log(`[${process.env.MS_NAME}] Running on port ${port}...`);

    monitorBTC();

  } catch (error) {
    console.log(`${error}`);
  }

})();