const Nexmo = require('nexmo')

const app = require('express')()
const bodyParser = require('body-parser')

const request = require('request')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
  extended: true
}))

app.listen(3000)

const nexmo = new Nexmo({
  apiKey: process.env.NEXMO_API_KEY,
  apiSecret: process.env.NEXMO_API_SECRET,
  applicationId: process.env.NEXMO_APPLICATION_ID,
  privateKey: process.env.NEXMO_APPLICATION_PRIVATE_KEY_PATH
});

var text = "👋Hello from Nexmo";

app.post('/webhooks/inbound', (req, res) => {
  console.log(req.body)
  request(`http://numbersapi.com/${req.body.text}`, (error, response, body) => {
    if (error) {
      text = "The Numbers API has thrown an error."
    } else {
      text = body
    }

    nexmo.channel.send(
      { "type": "sms", "number": process.env.TO_NUMBER },
      { "type": "sms", "number": req.body.msisdn },
      {
        "content": {
          "type": "text",
          "text": text
        }
      },
      (err, responseData) => {
        if (err) {
          console.log("Message failed with error:", err);
        } else {
          console.log(`Message ${responseData.message_uuid} sent successfully.`);
        }
      }
    );

    res.status(200).end();
  })
});
