import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import middlewares from '../../api/middlewares';
import { celebrate, Joi } from 'celebrate';
import aaveChannel from './aaveChannel';
import { Logger } from 'winston';
import { handleResponse } from '../../helpers/utilsHelper';

const route = Router();

export default (app: Router) => {
  app.use('/showrunners/aave', route);

  /**
   * Send Message
   * @description Send a notification via the aave showrunner
   * @param {boolean} simulate whether to send the actual message or simulate message sending
   */
  route.post(
    '/send_message',
    celebrate({
      body: Joi.object({
        simulate: [Joi.bool(), Joi.object()],
      }),
    }),
    middlewares.onlyLocalhost,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling /showrunners/aave/send_message endpoint with body: %o', req.body);
      try {
        const aave = Container.get(aaveChannel);
        const data = await aave.sendMessageToContract(req.body.simulate);
        return res.status(200).json({ success: true, data: data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return handleResponse(res, 500, false, 'error', JSON.stringify(e));
      }
    },
  );

  route.post(
    '/checkHealthFactor',
    celebrate({
      body: Joi.object({
        simulate: [Joi.bool(), Joi.object()],
      }),
    }),
    middlewares.onlyLocalhost,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling /showrunners/aave/send_message endpoint with body: %o', req.body);
      try {
        const aave = Container.get(aaveChannel);
        const data = await aave.checkHealthFactor(null, null, null, req.body.simulate);

        return res.status(200).json({ success: true, data: data });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return handleResponse(res, 500, false, 'error', JSON.stringify(e));
      }
    },
  );
};
