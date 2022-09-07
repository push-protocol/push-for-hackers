import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';

import middlewares from '../../api/middlewares';
import { celebrate, Joi } from 'celebrate';
import ProofOfHumanityChannel from './proofOfHumanityChannel';

const route = Router();

export default (app: Router) => {
  app.use('/showrunners/poh', route);

  route.post(
    '/challenges',
    celebrate({
      body: Joi.object({
        simulate: [Joi.bool(), Joi.object()],
      }),
    }),
    middlewares.onlyLocalhost,
    async (req: Request, res: Response, next: NextFunction) => {
      const Logger: any = Container.get('logger');
      Logger.debug('Calling /showrunners/poh ticker endpoint with body: %o', req.body);
      try {
        const poh = Container.get(ProofOfHumanityChannel);
        await poh.checkChallenges(req.body.simulate);

        return res.status(201).json({ success: true });
      } catch (e) {
        Logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.post(
    '/evidences',
    celebrate({
      body: Joi.object({
        simulate: [Joi.bool(), Joi.object()],
      }),
    }),
    middlewares.onlyLocalhost,
    async (req: Request, res: Response, next: NextFunction) => {
      const Logger: any = Container.get('logger');
      Logger.debug('Calling /showrunners/poh ticker endpoint with body: %o', req.body);
      try {
        const poh = Container.get(ProofOfHumanityChannel);
        await poh.checkRecentEvidences(req.body.simulate);

        return res.status(201).json({ success: true });
      } catch (e) {
        Logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.post(
    '/profileStatus',
    celebrate({
      body: Joi.object({
        simulate: [Joi.bool(), Joi.object()],
      }),
    }),
    middlewares.onlyLocalhost,
    async (req: Request, res: Response, next: NextFunction) => {
      const Logger: any = Container.get('logger');
      Logger.debug('Calling /showrunners/poh ticker endpoint with body: %o', req.body);
      try {
        const poh = Container.get(ProofOfHumanityChannel);
        await poh.checkForAcceptedProfiles(req.body.simulate);

        return res.status(201).json({ success: true });
      } catch (e) {
        Logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.post(
    '/removalRequests',
    celebrate({
      body: Joi.object({
        simulate: [Joi.bool(), Joi.object()],
      }),
    }),
    middlewares.onlyLocalhost,
    async (req: Request, res: Response, next: NextFunction) => {
      const Logger: any = Container.get('logger');
      Logger.debug('Calling /showrunners/poh ticker endpoint with body: %o', req.body);
      try {
        const poh = Container.get(ProofOfHumanityChannel);
        await poh.removalRequestTask(req.body.simulate);

        return res.status(201).json({ success: true });
      } catch (e) {
        Logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.post(
    '/expiration',
    celebrate({
      body: Joi.object({
        simulate: [Joi.bool(), Joi.object()],
      }),
    }),
    middlewares.onlyLocalhost,
    async (req: Request, res: Response, next: NextFunction) => {
      const Logger: any = Container.get('logger');
      Logger.debug('Calling /showrunners/poh ticker endpoint with body: %o', req.body);
      try {
        const poh = Container.get(ProofOfHumanityChannel);
        const response = await poh.checkForExpiration(req.body.simulate);

        return res.status(201).json(response);
      } catch (e) {
        Logger.error('🔥 error: %o', e);
        return next(e);
      }
    }, 
  );
};
