import { Request, Response } from 'express';

async function getBTCTocker(req: Request, res: Response, next: any) {
  res.send('Ok');
}

export default {
  getBTCTocker
};