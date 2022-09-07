import { Container } from 'typedi';
import { Logger } from 'winston';
import config from '../../config';

/**
 * @param {*} req Express req Object
 * @param {*} res  Express res Object
 * @param {*} next  Express next Function
 */
const onlyTrustedSource = async (req, res, next) => {
  const Logger: Logger = Container.get('logger');
  try {
    // Check if ip is localhost and only continue
    var url = req.headers.origin;

    if (config.trusterURLs.indexOf(url) == -1) {
      // Not in the array
      return res.sendStatus(403).json({ info: 'Only meant for trusted urls' });
    }

    return next();
  } catch (e) {
    Logger.error('🔥 Error attaching Only Trusted Source middleware to url: %o | req: %o | err: %o', url, req, e);
    return next(e);
  }
};

export default onlyTrustedSource;
