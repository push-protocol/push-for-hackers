import axios from 'axios';
import { Container } from 'typedi';
import { Router, Request, Response, NextFunction } from 'express';
import { Logger } from 'winston';
import bent from 'bent';
import assert from 'assert';
import { checkLocalHost } from '../api/middlewares/onlyLocalhost';

const getBuffer = bent('buffer');
const parseUrl = require('parse-url');
const crypto = require('crypto');
const debug = require('debug')('verify-aws-sns-signature');

type payloadHandlerType = (payload: any, simulate?: null) => Promise<any>;

/**
 * A helper used to validate the payload of an AWS SNS webhook
 * @param {Object} payload an json representation of the payloada recieved from sns
 * @returns
 */
export async function validatePayload(payload: any) {
  const { SigningCertURL, Signature, Message, MessageId, SubscribeURL, Subject, Timestamp, Token, TopicArn, Type } =
    payload;

  // validate SubscribeURL
  const url = parseUrl(SigningCertURL);
  assert.ok(
    /^sns\.[a-zA-Z0-9\-]{3,}\.amazonaws\.com(\.cn)?$/.test(url.resource),
    `SigningCertURL host is not a valid AWS SNS host: ${SigningCertURL}`,
  );

  try {
    debug(`retrieving AWS certificate from ${SigningCertURL}`);

    const x509 = await getBuffer(SigningCertURL);
    const publicKey = crypto.createPublicKey(x509);
    const signature = Buffer.from(Signature, 'base64');
    const parameterArray: any =
      'Notification' === Type
        ? [{ Message }, { MessageId }, { Subject }, { Timestamp }, { TopicArn }, { Type }]
        : [{ Message }, { MessageId }, { SubscribeURL }, { Timestamp }, { Token }, { TopicArn }, { Type }];

    const stringToSign = parameterArray.reduce((acc: any, el: any) => {
      const key = el.keys()[0];
      acc += key + '\n' + el[key] + '\n';
    }, '');

    debug(`string to sign: ${stringToSign}`);
    const verified = crypto.verify('sha1WithRSAEncryption', Buffer.from(stringToSign, 'utf8'), publicKey, signature);
    debug(`signature ${verified ? 'has been verified' : 'failed verification'}`);
    return verified;
  } catch (err) {
    return false;
  }
}

/**
 * A route helper used to abstract the logic of aws sns to a seperate file
 * @param {Express.Router} route a route object used to create an endpoint for teh webhook
 * @param {function} payloadHandler a function which is used to handle the payload title and message passed in from aws sns
 */
export async function enableAWSWebhook(route: Router, payloadHandler: payloadHandlerType) {
  route.post('/notification', async (req: Request, res: Response, next: NextFunction) => {
    const logger: Logger = Container.get('logger');
    logger.debug(' /showrunners/notification ticker endpoint with body: %o', req.body);

    try {
      const isLocalhost = await checkLocalHost(req.connection.remoteAddress);
      let payload;
      let simulate = null;

      if (isLocalhost) {
        payload = req.body.payload;
        simulate = req.body.simulate;
      } else {
        // extract the body of the request
        const buffers = [];
        for await (const chunk of req) {
          buffers.push(chunk);
        }
        // extract the body of the request

        // parse the extracted payload
        const data = Buffer.concat(buffers).toString();
        payload = JSON.parse(data);
        // parse the extracted payload
      }

      // validate the payload to make sure it comes from the intended source
      // TODO uncomment after testing and development is done
      if (!validatePayload(payload) && !isLocalhost) {
        throw { statusCode: 400, message: 'Invalid signature' };
      }
      // TODO uncomment after testing and development is done
      // validate the payload to make sure it comes from the intended source
      // check for the different payload types
      if (payload.Type === 'Notification') {
        // go through all the different types of message and dispatch them, this is the core part which differs on a protocol by protocol level
        const response = await payloadHandler(payload, simulate);
        return res.send({ response });
      }

      if (payload.Type === 'SubscriptionConfirmation') {
        const url = payload.SubscribeURL;
        const response = await axios.get(url);
        if (response.status === 200) {
          console.log('Subscription confirmed');
          res.sendStatus(200);
          return;
        } else {
          console.error('Subscription failed');
          res.sendStatus(500);
          return;
        }
      }
      // check for the different payload types
      // const response = await channel.triggerWebhook(req.body);

      return res.status(201).json('response');
    } catch (e) {
      logger.error('🔥 error: %o', e);
      return res.status(500).json({
        message: e.message,
      });
    }
  });
}
