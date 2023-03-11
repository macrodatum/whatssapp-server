const express = require('express')
const fs = require('fs');
const venom = require('venom-bot');
const axios = require('axios');
const app = express()
var bodyParser = require('body-parser')

var jsonParser = bodyParser.json()
var urlencodedParser = bodyParser.urlencoded({ extended: false })

const port = 8080

let clientW = null;

app.use(express.static('public'));

app.post('/send', jsonParser, (req, res)=>{
  try {
    let wsId = req.body.id;
    let message = req.body.message;
    let typeMessage = req.body.type;
    switch (typeMessage) {
      case "text":
        clientW.sendText(wsId+'@c.us', message)
        break;
    
      default:
        clientW.sendText(wsId+'@c.us', "unsupportedType: " + typeMessage +" [text, btn, link, imgb64]:: "+ message)
        break;
    }
    res.sendStatus(200)
  } catch (error) {
      console.log(error)
      res.sendStatus(400)
  }
})
  
app.listen(port, () => {
  venom
  .create(
  'charmss-notifications',
  (base64Qr, asciiQR, attempts, urlCode) => {
    console.log(asciiQR); // Optional to log the QR in the terminal
    console.log("urlCode", urlCode)
    var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
      response = {};

    if (matches.length !== 3) {
      return new Error('Invalid input string');
    }
    response.type = matches[1];
    response.data = new Buffer.from(matches[2], 'base64');

    var imageBuffer = response;
    require('fs').writeFile(
      './public/images/qr.png',
      imageBuffer['data'],
      'binary',
      function (err) {
        if (err != null) {
          console.log(err);
        }
      }
    );
  },
    // statusFind
    (statusSession, session) => {
      console.log('Status Session: ', statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser || initBrowser || openBrowser || connectBrowserWs || initWhatsapp || erroPageWhatsapp || successPageWhatsapp || waitForLogin || waitChat || successChat
      //Create session wss return "serverClose" case server for close
      console.log('Session name: ', session);
    },
  { logQR: false }
  )
  .then((client) => {
      clientW = client;
      start(client)
      console.log(client);
  })
  .catch((erro) => {
      console.log("Error generated for QRCode");
      console.log(erro);
  });
  
    console.log(`Server on ${port}`)
})

  function start(client) {
    let urlPerformer = "https://api.charmss.com/api/account/whatsapp"
    let urlClient = "https://api.charmss.com/api/customer/whatsapp"
    client.onMessage((message) => {
      if (message.body.includes('performer::') && message.isGroupMsg === false) {
        axios.post(urlPerformer, {
          whatsappId: wsId,
        })
        .then((response) => {
          if(response === "ok"){//deberia llegar el nombre de la modelo?
            client
            .sendText(message.from, 'CharmssBOT your number has been registed, please go to https://performers.charmss.com')
            .then((result) => {
              console.log('Result: ', result);
            })
            .catch((erro) => {
              console.error('Error when sending: ', erro);
            });
          }
          else{
            client
            .sendText(message.from, 'CharmssBOT: your whatsapp number is not registered in our system please contact our support team at support@livecharmss.com.co')
            .then((result) => {
              console.log('Result: ', result);
            })
            .catch((erro) => {
              console.error('Error when sending: ', erro);
            });
          }

        }, (error) => {
          console.error(" Error validating whatsappId " + error);
        });
      }
      else if (message.body.includes('client::') && message.isGroupMsg === false) {
        axios.post(urlClient, {
          whatsappId: wsId,
        })
        .then((response) => {
          if(response === "ok"){//deberia llegar el nombre de la modelo?
            client
            .sendText(message.from, 'CharmssBOT your number has been registed, please go to https://www.livecharmss.com')
            .then((result) => {
              console.log('Result: ', result);
            })
            .catch((erro) => {
              console.error('Error when sending: ', erro);
            });
          }
          else{
            client
            .sendText(message.from, 'CharmssBOT: your whatsapp number is not registered in our system please contact our support team at support@livecharmss.com.co')
            .then((result) => {
              console.log('Result: ', result);
            })
            .catch((erro) => {
              console.error('Error when sending: ', erro);
            });
          }

        }, (error) => {
          console.error(" Error validating whatsappId " + error);
        });
      }
    });
  }