import app from "./app";
import monitorBTC from './monitorBTC';

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