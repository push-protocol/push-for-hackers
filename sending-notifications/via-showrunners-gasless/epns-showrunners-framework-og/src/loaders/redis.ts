const redis = require('async-redis');
import config from '../config';

const ReddisInstance = redis.createClient({ config.redisURL });

export default ReddisInstance;
