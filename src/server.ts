import app from "./app";
import monitorBTC from './monitorBTC';
import { getLastData, createDatabase } from './model';

(async () => {

  try {
    await createDatabase();

    const port = parseInt(`${process.env.PORT}`);
    await app.listen(port);

    console.log(`[${process.env.MS_NAME}] Running on port ${port}...`);

    monitorBTC();

    getLastData();

  } catch (error) {
    console.log(`${error}`);
  }

})();