import { Container } from 'typedi';
import { Logger } from 'winston';
import config from '../config';

var mysql = require('mysql');
// const MySQLEvents = require('@rodrigogs/mysql-events');

var pool = mysql.createPool({
  connectionLimit: 10,
  host: config.dbhost,
  user: config.dbuser,
  password: config.dbpass,
  database: config.dbname,
});
export default {
  pool,
  query: function() {
    const Logger: Logger = Container.get('logger');

    var sql_args = [];
    var args = [];
    for (var i = 0; i < arguments.length; i++) {
      args.push(arguments[i]);
    }

    var callback = args[args.length - 1]; //last arg is callback
    pool.getConnection(function(err, connection) {
      if (err) {
        Logger.error(err);

        return callback(err);
      }

      if (args.length > 2) {
        sql_args = args[1];
      }

      connection.query(args[0], sql_args, function(err, results) {
        connection.release(); // always put connection back in pool after last query

        if (err) {
          Logger.error(err);

          return callback(err);
        }

        callback(null, results);
      });
    });
  },
};

/* EXAMPLE
var db = require('../helpers/dbHelper');

db.query(
  'Select * from `sessions` where `Active`=1 and Expires>?;',
  [~~(new Date()/1000)],
  function(err, results){

    if(err){
      console.log(err);
    }
    else{
      console.log(results);
    }

  }
);
*/
