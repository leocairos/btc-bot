import app from "./app";
import { createDatabase } from './model';
import monitorBTC from './monitorBTC';

(async () => {

  try {
    await createDatabase();

    const port = parseInt(`${process.env.PORT}`);
    await app.listen(port);

    console.log(`[${process.env.MS_NAME}] Running on port ${port}...`);

    monitorBTC();

    //getLastData();

  } catch (error) {
    console.log(`${error}`);
  }

})();