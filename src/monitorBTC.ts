import { CronJob } from 'cron';
import axios from 'axios';

import sendMail from './sendMail';

const intervalToCheck = parseInt(`${process.env.INTERVAL_TO_CHECK}`);

const limiteVarDow = Number(`${process.env.BTC_LIMIT_VAR_DOWN}`) / 100;
const limiteVarTop = Number(`${process.env.BTC_LIMIT_VAR_TOP}`) / 100;
const BTCBase = Number(`${process.env.BTC_BASE_IN_BRL}`);

const calculateVariation = (last: number) => {
  const variation = (last / BTCBase);
  let varTopDow = variation >= 1
    ? (variation - 1) * 100
    : (1 - variation) * -100;

  return varTopDow;
}

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

export const formatter = new Intl.NumberFormat('pt-BR', {
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

  const variacao = calculateVariation(Number(last));

  let html = `${tickerDate} <h3> Bitcoin (BTC):</h3>`
  html += `<ul><li><strong>Ultima cotação ${ultima}</strong></li>`;
  html += `<li>Menor valor ${menor}</li>`;
  html += `<li>Maior valor ${maior}</li>`;
  html += `<li>Variação ${(variacao).toFixed(2)}% (ultima/Base)</li></ul>`;

  html += `<br>Base BTC: ${formatter.format(Number(BTCBase))}.`;
  html += `<br>Limite alerta Top: ${(limiteVarTop * 100).toFixed(2)}%.`;
  html += `<br>Limite alerta Dow: ${(limiteVarDow * 100).toFixed(2)}%.`;
  html += `<br><h4>Ticker</h4><pre>${JSON.stringify(parms, null, 2)}</pre>`

  return html;
}

export const checkAndAlert = async (originalTicker: IOriginalTicker) => {

  const variacao = calculateVariation(Number(originalTicker.last));
  console.log(`   Base: ${formatter.format(Number(BTCBase))} Variação ${(variacao).toFixed(2)}%`)
  console.log(`   Limite Top: ${(limiteVarTop * 100).toFixed(2)}%.`);
  console.log(`   Limite Dow: ${(limiteVarDow * 100).toFixed(2)}%.`);

  const alertTop = ((variacao >= 0) && (variacao >= limiteVarTop * 100));
  const alertDow = ((variacao < 0) && (variacao <= limiteVarDow * -100));

  //console.log(variacao, limiteVarTop, limiteVarDow, (variacao >= limiteVarTop), (variacao <= limiteVarDow * -1))
  const subject = alertTop
    ? 'BTC-Bot Alert (TOP)'
    : alertDow
      ? 'BTC-Bot Alert (DOW)'
      : 'BTC-Bot Alert';

  if (alertTop || alertDow) {
    const html = htmlMessage(originalTicker);
    await sendMail({ subject, html })
  }
}

const monitorBTC = () => {
  console.log(`Every ${intervalToCheck} seconds check BTC value.`);
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
            console.log('\nCheck in ', tickerDate, 'LastValue: ', formatter.format(Number(originalTicker.last)));

            await checkAndAlert(originalTicker);
            /*if (variacaoInf * -1 >= limiteInf) { // identificar queda maior que X%
              const html = htmlMessage(originalTicker);
              await sendMail({ subject: 'BTC-Bot Alert', html })
            }*/
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