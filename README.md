# btc-bot

Service monit by GET in http://btc-bot.rdlsc.ml:5001/btc-bot/health

### PM2

  * $ sudo npm i -g pm2

  * $ sudo pm2 startup
  
  * ../btc-bot$ sudo pm2 start npm --name btc-bot-service -- start
  
  * $ sudo pm2 restart btc-bot-service --update-env

  * $ sudo pm2 logs btc-bot-service 
  