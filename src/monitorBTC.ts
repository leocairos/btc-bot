import { CronJob } from 'cron';
import axios from 'axios';

import sendMail from './sendMail';

const intervalToCheck = parseInt(`${process.env.INTERVAL_TO_CHECK}`);

const getVariacaoInf = (last: number, high: number) => {
  return (1 - last / high) * -1;
}
const limiteInf = parseInt(`${process.env.BTC_ALERT_DOWN}`) / 100;

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

const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  minimumFractionDigits: 2
})

const htmlMessage = (parms: IOriginalTicker) => {
  const { high, low, last, date } = parms;
  const maior = formatter.format(Number(high));
  const menor = formatter.format(Number(low));
  const ultima = formatter.format(Number(last));
  const tickerDate = new Date(date * 1000).toUTCString();

  const variacaoInf = getVariacaoInf(Number(last), Number(high));

  let html = `${tickerDate} <h3> Bitcoin (BTC):</h3>`
  html += `<ul><li><strong>Ultima cotação ${ultima}</strong></li>`;
  html += `<li>Menor cotação ${menor}</li>`;
  html += `<li>Maior cotação em ${maior}</li>`;
  html += `<li>Variação ${(variacaoInf * 100).toFixed(2)}% (ultima/maior)</li></ul>`;

  html += `<br>Limite alerta configurado: ${(limiteInf * 100).toFixed(2)}%.`;
  html += `<br><h4>Ticker</h4><pre>${JSON.stringify(parms, null, 2)}</pre>`


  return html;
}

const monitorBTC = () => {
  console.log(`Every ${intervalToCheck} seconds check BTC value`);
  let isRunning = false;
  try {
    const job = new CronJob(
      `*/${process.env.INTERVAL_TO_CHECK} * * * * *`,
      () => {
        if (!isRunning) {
          isRunning = true;
          setTimeout(async () => {
            //Retorna informações com o resumo das últimas 24 horas de negociações.
            const { data } = await axios
              .get('https://www.mercadobitcoin.net/api/BTC/ticker/');
            const originalTicker = data.ticker as IOriginalTicker;
            const tickerDate = new Date(originalTicker.date * 1000).toUTCString();
            console.log('originalTicker', originalTicker, tickerDate);

            const variacaoInf = getVariacaoInf(Number(originalTicker.last), Number(originalTicker.high));
            console.log(`Variação ${(variacaoInf * 100).toFixed(2)}% | Limite ${(limiteInf * 100).toFixed(2)}%.`)

            if (variacaoInf * -1 >= limiteInf) { // identificar queda maior que X%
              const html = htmlMessage(originalTicker);
              await sendMail({ subject: 'BTC-Bot Alert', html })
            }
            isRunning = false;
          }, 1000);
        }
      });
    job.start();
  } catch (err) {
    console.log(`Finished with error: ${err}`);
  }
}

export default monitorBTC;