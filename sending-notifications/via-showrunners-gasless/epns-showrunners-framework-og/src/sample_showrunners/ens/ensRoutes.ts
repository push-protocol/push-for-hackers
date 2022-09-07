import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import EnsExiprationChannel from './ensChannel';
import middlewares from '../../api/middlewares';
import { celebrate, Joi } from 'celebrate';
import { handleResponse } from '../../helpers/utilsHelper';
import { Logger } from 'winston';

const route = Router();

export default (app: Router) => {
  app.use('/showrunners/ensv2', route);

  /**
   * Send Message
   * @description Send a notification via the ensdomain showrunner
   * @param {boolean} simulate whether to send the actual message or simulate message sending
   */
  route.post(
    '/test',
    celebrate({
      body: Joi.object({
        simulate: [Joi.bool(), Joi.object()],
      }),
    }),
    middlewares.onlyLocalhost,
    async (req: Request, res: Response, next: NextFunction) => {
      const logger: Logger = Container.get('logger');
      logger.debug('Calling /showrunners/ensv2/send_message endpoint with body: %o', req.body);
      try {
        const ensDomain = Container.get(EnsExiprationChannel);
        const data: any = await ensDomain.checkDomainExpiryTask(false);
        res.json({ success: true });
      } catch (e) {
        logger.error('🔥 error: %o', e);
        return handleResponse(res, 500, false, 'error', JSON.stringify(e));
      }
    },
  );
};
