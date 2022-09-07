import { Container } from 'typedi';
import LoggerInstance from './logger';
import CacheInstance from './cache';


export default ({ models }: { models: { name: string; model: any }[] }) => {
  try {
    LoggerInstance.info('✌️   Loading Mongo DB Models');

    models.forEach(m => {
      LoggerInstance.info('   --  ✔️  Loading Mongo DB Model: %s', m)
      Container.set(m.name, m.model);
    });

    LoggerInstance.info('✔️   All Mongo DB Models loaded!');

    Container.set('logger', LoggerInstance);
    LoggerInstance.info('✔️   Logger Injected');

    Container.set('cached', CacheInstance);
    LoggerInstance.info('✔️   Cache (with Redis) Loaded! 🐳🐳🐳');

    // Container.set('dbpool', MysqlInstance)
    // LoggerInstance.info('✌️   Databse Injected');

    return null;
  } catch (e) {
    LoggerInstance.error('🔥  Error on dependency injector loader: %o', e);
    throw e;
  }
};
