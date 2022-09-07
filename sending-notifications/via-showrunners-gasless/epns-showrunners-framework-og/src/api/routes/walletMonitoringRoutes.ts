import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import walletMonitoringHelper from '../../services/walletMonitoring';
import middlewares from '../middlewares';
import { celebrate, Joi } from 'celebrate';
import { Logger } from 'winston';

const route = Router();

export default (app: Router) => {
  app.use('/showrunners/wallet_monitoring', route);

  route.post(
    '/check_wallets',
    celebrate({
      body: Joi.object({
        simulate: [Joi.bool(), Joi.object()],
      }),
    }),
    middlewares.onlyLocalhost,
    async (req: Request, res: Response, next: NextFunction) => {
      const Logger: Logger= Container.get('logger');
      Logger.debug('Calling /showrunners/wallet_monitoring/check_wallets endpoint with body: %o', req.body )
      try {
        const walletMonitor = Container.get(walletMonitoringHelper);
        const result = await walletMonitor.processWallets(req.body.simulate);

        return res.status(201).json({result});
      } catch (e) {
        Logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );

  route.post(
    '/check_main_wallet',
    celebrate({
      body: Joi.object({
        simulate: [Joi.bool(), Joi.object()],
      }),
    }),
    middlewares.onlyLocalhost,
    async (req: Request, res: Response, next: NextFunction) => {
      const Logger: Logger = Container.get('logger');
      Logger.debug('Calling /showrunners/wallet_monitoring/check_main_wallet endpoint with body: %o', req.body )
      try {
        const walletMonitor = Container.get(walletMonitoringHelper);
        const result = await walletMonitor.processMainWallet(req.body.simulate);

        return res.status(201).json({result});
      } catch (e) {
        Logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
};
