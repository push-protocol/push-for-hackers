# Example

[Example of AWS SNS for Web2.5 platforms](https://docs.epns.io/developers/developer-guides/receiving-notifications/receiving-via-aws-sns)


# EPNS SNS Boilerplate

This boilerplate can be used a starting point to consume the feeds from the EPNS SNS Topic.

# SNS client
​
This library consumes notification events to `AWS SNS` notification service so third party providers can hook onto them really easily.
​
Please note that this notification service template is to push data to your server and does not check for nasty data or lousy content.  The SNS service broadcasts what the chain says. It is up to the consumer to put whatever extra content validations you need in place to fit your standards.
​
## How to authenticate with the `AWS SNS` 
​
You need to supply EPNS a webhook POST URL to `sns` (one for mainnet and one for testnet) to authenticate with and do a handshake request. This code also listens to the incoming notifications. Example is shown below.
​
## How to listen to events from `AWS SNS`
​
This example is in **node.js** and **express.js.** You can, of course, use different tech stacks to consume these notifications.

   
## Signatures

It would be best if you verified the authenticity of a notification, subscription confirmation, or unsubscribe confirmation message sent by Amazon SNS. Using the information in the Amazon SNS message, your endpoint can recreate the string to sign and the signature so that you can verify the message's contents by matching the signature you recreated from the message contents with the signature that Amazon SNS sent with the message.

Please refer this [link](https://docs.aws.amazon.com/sns/latest/dg/sns-verify-signature-of-message.html) on how to validate the authenticity of a notification.

In the example snippet provided, we have used ***sns-payload-validator*** npm module to validate the payload.


## Message Types
		
### SubscriptionConfirmation

This is a one-time message confirming if the SNS subscription is successful.
			
					
 ### Notification

    {
        Type: 'Notification',
        MessageId: '62918f56-9bce-5497-a23e-d422c782a01d',
        TopicArn: 'arn:aws:sns:us-east-1:293359341249:dev-epns-notifications',
        Message: '{"sid":121,"users":["0x35B84d6848D16415177c64D64504663b998A6ab4"],"payload":{"apns":{"payload":{"aps":{"category":"withappicon","mutable-content":1,"content-available":1}},"fcm_options":{"image":"https://gateway.ipfs.io/ipfs/QmQM97KUTGTT6nt6Xd7xAJpdGB8adiJ1LVUJoN8RoFUYfx"}},"data":{"app":"Shunya","sid":"121","url":"https://shunya.fi/","acta":"https://shunya.fi","aimg":"https://shunya.fi/_nuxt/img/shunya.cfece51.png","amsg":"Your portfolio is up by 0.08% since yesterday.","asub":"Assets Daily","icon":"https://gateway.ipfs.io/ipfs/QmQM97KUTGTT6nt6Xd7xAJpdGB8adiJ1LVUJoN8RoFUYfx","type":"3","epoch":"1660554419","appbot":"0","hidden":"0","secret":""},"android":{"notification":{"icon":"@drawable/ic_stat_name","color":"#e20880","image":"https://gateway.ipfs.io/ipfs/QmQM97KUTGTT6nt6Xd7xAJpdGB8adiJ1LVUJoN8RoFUYfx","default_vibrate_timings":true}},"notification":{"body":"Your portfolio is up by 0.08% since yesterday.","title":"Shunya - Assets Daily"}},"epoch":"1660554419","topic":"Notification","subtopic":"Channel"}',
        Timestamp: '2022-08-15T14:37:00.408Z',
        SignatureVersion: '1',
        Signature: 'iqnfhnF/SsQYaqVrhAjWlCFWYoeMSftRLRrkkxje3CppCNm/CATg13ljIz0tChVa7OJEoaVI/tpUERiuhZ9wxuGmDI6ReaGORam4Yda4CC0HqfitqYG8M0AamScXgiqN9hgcGHbbitYQWWIp2vmFKC+P1j9Hq9Lz19fBlHz1/9hJwHlRfKDADqh1I15wERZZGGUu//Z+S6bnJ9k2JrektKDNRukSihSU1u07563RirE+EJ6TCxQGUY4GzuuwlOu6vj9ESsVE4mBdfxnmNLsZoVBl87KHg7/z9Uh1IJTqkdRyN5+XXg4XDE1puYr9qypfhk8abmZQIrn5obrHDe+ZBQ==',
        SigningCertURL: 'https://sns.us-east-1.amazonaws.com/SimpleNotificationService-56e67fcb41f6fec09b0196692625d385.pem',
        UnsubscribeURL: 'https://sns.us-east-1.amazonaws.com/?Action=Unsubscribe&SubscriptionArn=arn:aws:sns:us-east-1:293359341249:dev-epns-notifications:cc473de2-b46e-462c-95d4-178580487a26'
    }

**Message** is field in the above JSON is the actual notification sent from the EPNS in JSON stringified format.

#### Message

A sample message when converted to JSON looks like below

      {
	  	"sid": 121,
	  	"users": ["0x35B84d6848D16415177c64D64504663b998A6ab4"],
	  	"payload": {
	  		"data": {
	  			"app": "Shunya",
	  			"sid": "121",
	  			"url": "https://shunya.fi/",
	  			"acta": "https://shunya.fi",
	  			"aimg": "https://shunya.fi/_nuxt/img/shunya.cfece51.png",
	  			"amsg": "Your portfolio is up by 0.08% since yesterday.",
	  			"asub": "Assets Daily",
	  			"icon": "https://gateway.ipfs.io/ipfs/QmQM97KUTGTT6nt6Xd7xAJpdGB8adiJ1LVUJoN8RoFUYfx",
	  			"type": "3",
	  			"epoch": "1660554419",
	  			"appbot": "0",
	  			"hidden": "0",
	  			"secret": ""
	  		},
	  		"notification": {
	  			"body": "Your portfolio is up by 0.08% since yesterday.",
	  			"title": "Shunya - Assets Daily"
	  		}
	  	},
	  	"epoch": "1660554419",
	  	"topic": "Notification",
	  	"subtopic": "Channel"
	  }

- **sid**       - unique id from the push
- **users**     - list of wallet addresses for which the notification needs to be delivered
- **payload**   - actual payload that needs to be delivered to the user's device
- **epoch**     - timestamp when the payload is generated
- **topic**     -  type of payload, i.e. Notification, Chat etc
- **subtopic**  -  mode of delivery, i.e. Channel or User level
