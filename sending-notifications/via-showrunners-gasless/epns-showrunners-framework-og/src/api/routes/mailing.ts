import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import EmailService from '../../services/emailService';
import middlewares from '../middlewares';
import { celebrate, Joi } from 'celebrate';

const route = Router();

export default (app: Router) => {
  app.use('/mailing', route);

  // to add an incoming payload
  route.post(
    '/send_mail',
    celebrate({
      body: Joi.object({
        from: Joi.string().required(),
        name: Joi.string().required(),
        topic: Joi.string().required(),
        sub: Joi.string().required(),
        msg: Joi.string().required(),
      }),
    }),
    middlewares.onlyTrustedSource,
    async (req: Request, res: Response, next: NextFunction) => {
      const Logger: any = Container.get('logger');
      Logger.debug('Calling /mailing/send_mail endpoint with body: %o', req.body);
      try {
        const email = Container.get(EmailService);
        const { success, msg } = await email.sendMailSES(
          req.body.from,
          req.body.name,
          req.body.topic,
          req.body.sub,
          req.body.msg,
        );

        return res.status(201).json({ success, msg });
      } catch (e) {
        Logger.error('🔥 error: %o', e);
        return next(e);
      }
    },
  );
};
