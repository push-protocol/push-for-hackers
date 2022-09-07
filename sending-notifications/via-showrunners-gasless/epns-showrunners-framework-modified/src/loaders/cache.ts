const redis = require('async-redis');
import config from '../config';

class CacheInstance {
  private ReddisInstance;
  constructor() {
    this.ReddisInstance = redis.createClient(config.redisURL);
  }
  /**
   * Set cache
   * @description adds a part
   * @param {String} key Cache Key
   * @param {String} value Cache Value
   * @return {Promise<{ null }>}
   */
  public async setCache(key: String, value: Number) {
    return this.ReddisInstance.set(key, value);
  };

  /**
   * push lcache
   * @description adds to a cache like an array
   * @param {String} key Cache Key
   * @param {String} value Cache Value
   * @return {Promise<{ null }>}
   */
  public async pushLCache(key: String, value: Number) {
    return this.ReddisInstance.rpush(key, value);
  };

  /**
   * get lcache
   * @description get all items in a list
   * @param {String} key Cache Key
   * @return {Promise<{ null }>}
   */
  public async getLCache(key: String) {
    return this.ReddisInstance.lrange(key, 0, -1);
  };

  /**
   * Add caches
   * @description adds to already existing value in cache
   * @param {String} key Cache Key
   * @param {Number} value Value to be added
   * @return {Promise<{ null }>}
   */
  public async addCache(key: String, value: Number) {
    const prev: Number = Number(await this.getCache(key));
    if (prev != 0) {
      value = Number(prev) + Number(value);
      value = Number(value) / 2
    }
    return this.ReddisInstance.set(key, value);
  };

  /**
   * Remove cache
   * @description deletes a cache key and its associated values
   * @param {String} key Cache Key
   * @return {Promise<{ null }>}
   */
  public async removeCache(key: String) {
    return this.ReddisInstance.del(key);
  };

  /**
   * Get cache
   * @description retrieves the value of a cache key
   * @param {String} key Cache Key
   * @return {Promise<{ String }>}
   */
  public async getCache(key: String) {
    return this.ReddisInstance.get(key);
  };

}


export default new CacheInstance();
