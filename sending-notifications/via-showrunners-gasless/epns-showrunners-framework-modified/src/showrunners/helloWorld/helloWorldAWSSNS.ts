import { Router, Request, Response, NextFunction } from 'express';
import { Container } from 'typedi';
import HelloWorldChannel from './helloWorldChannel';
import axios from 'axios';
import { Logger } from 'winston';
import { enableAWSWebhook } from '../../helpers/webhookHelper';

const route = Router();

export default (app: Router) => {
  const channel = Container.get(HelloWorldChannel);
  app.use('/showrunners/helloworld', route);

  // enable webhooks
  enableAWSWebhook(route, channel.webhookPayloadHandler.bind(channel)); // add the extra bind method to enable the use of 'this' inside the callback
  // enable webhooks
};
