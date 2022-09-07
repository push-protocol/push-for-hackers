import { Service, Inject } from 'typedi';
import config from '../config';
import { EventDispatcher, EventDispatcherInterface } from '../decorators/eventDispatcher';
import events from '../subscribers/events';

// Load the AWS SDK for Node.js
var AWS = require('aws-sdk');
const SES_CONFIG = {
    accessKeyId: config.accessKeyId,
    secretAccessKey: config.secretAccessKey,
    region: 'us-east-1',
    apiVersion: '2010-12-01'
};

const AWS_SES = new AWS.SES(SES_CONFIG);
// Set the region
AWS.config.update({region: 'us-east-1'});

@Service()
export default class AuthService {
  constructor(
    @Inject('logger') private logger,
    @EventDispatcher() private eventDispatcher: EventDispatcherInterface,
  ) {}

  // to generate server tokens for auhtnetication
  /**
   * Send Mail using Amazon SES
   * @param from Mail's sender
   * @param name Sender's Name
   * @param topic Email Topic
   * @param sub Email Subject
   * @param msg Email Message
   */
  public async sendMailSES(from, name, topic, sub, msg) {
    const logger = this.logger;

    return await new Promise ((resolve, reject) => {
      // Create sendEmail params
      var params = {
        Destination: { /* required */
          CcAddresses: [

          ],
          ToAddresses: [
            `${config.supportMailName} <${config.supportMailAddress}>`
          ]
        },
        Message: { /* required */
          Body: { /* required */
            Html: {
             Charset: "UTF-8",
             Data: this.returnHTMLEmail(from, name, topic, sub, msg)
            }
           },
           Subject: {
            Charset: 'UTF-8',
            Data: `Support Required | ${topic} | ${sub}`
           }
          },
        Source: `${config.sourceMailName} <${config.supportMailAddress}>`, /* required */
        ReplyToAddresses: [
           `${name} <${from}>`
        ],
      };

      // Create the promise and SES service object
      var sendPromise = AWS_SES.sendEmail(params).promise();

      // Handle promise's fulfilled/rejected states
      sendPromise.then(function(data) {
          logger.info("Message sent with ID: %o", data.MessageId);
          resolve(data);
        }).catch(function(err) {
          logger.info("Message failed with error: %o | stack: %o", err, err.stack);
          reject(err);
        });
    });
  }

  /**
   * Send Mail using Amazon SES
   * @param from Mail's sender
   * @param name Sender's Name
   * @param topic Email Topic
   * @param sub Email Subject
   * @param msg Email Message
   */
  public returnHTMLEmail(from, name, topic, sub, msg) {
    const html=`
      <html>
        <head>
        <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
        <title>Ethereum Push Notification Service Support Ticket</title>
        </head>

        <body>
        <center>
        <table width="800" height=auto border="1" bordercolor="#DDD">
          <tr>
            <td width="200" height="100" rowspan="2"><center><img src="https://backend.epns.io/assets/logoanim.gif" width="90" height="90" alt="Ethereum Push Notification Service Icon" longdesc="Ethereum Push Notification Service Icon" /></center></td>

            <td height="80" colspan="3" bgcolor="#674c9f"><p><strong><FONT FACE="courier" color="#FFFFFF">&nbsp;Turning it OFF and ON didn't work!</FONT></strong></p></td>
          </tr>
          <tr>
            <td width="200" height="40" bgcolor="#674c9f"><strong><FONT FACE="courier" color="#FFFFFF">&nbsp;E-mail</FONT></strong></td>
            <td width="200" height="40" colspan="2"><FONT FACE="courier"><center><a href="mailto://${from}">${from}</a></center></FONT></td>
          </tr>
          <tr>
            <td width="200" height="40" bgcolor="#674c9f"><strong><FONT FACE="courier" color="#FFFFFF">&nbsp;Name</FONT></strong></td>
            <td width="200" height="40" colspan="3"><FONT FACE="courier"><center>${name}</center></FONT></td>
          </tr>
          <tr>
            <td width="200" height="40" colspan="4" bgcolor="#EEEEEE"></td>
          </tr>
          <tr>
            <td width="200" height="40" bgcolor="#674c9f"><strong><FONT FACE="courier" color="#FFFFFF">&nbsp;Subject</FONT></strong></td>
            <td width="200" height="40" colspan="3"><FONT FACE="courier"><center>${sub}</center></FONT></td>
           </tr>
          <tr>
            <td width="200" height="40" bgcolor="#674c9f"><strong><FONT FACE="courier" color="#FFFFFF">&nbsp;Topic</FONT></strong></td>
            <td width="200" height="40" colspan="3"><FONT FACE="courier"><center>${topic}</center></FONT></td>
          </tr>
          <tr>
            <td width="200" height="40" colspan="4" bgcolor="#674c9f"><strong><FONT FACE="courier" color="#FFFFFF">&nbsp;Messsage</FONT></strong></td>
          </tr>
          <tr>
            <td width="200" height="40" colspan="4"><FONT FACE="courier"><left>${msg}</left></FONT></td>
          </tr>
        </table>
        <br>
        <sub><font color="#e20880">Powered by Awesome Developers, Designers and Marketeers of <a href="https://epns.io">Ethereum Push Notification Service</a></font></sub>
        </center>
        </body>
        </html>
      `;

      return html;
  }
}
