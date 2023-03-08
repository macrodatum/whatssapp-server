const express = require('express')
const fs = require('fs');
const venom = require('venom-bot');
const app = express()

const port = 8080

let clientW = null;

app.use(express.static('public'));

app.get('/register', (req, res) => {
  
    res.send('Iniciando BOT-CHARMSS')
})

app.get('/send', (req, res)=>{
  //1. desempacar el codigicado/encriptado
  //2. obtener la parte del telefono y de correo al cual se va a enviar la informacion
  //3. validar la existencia del telefono en el sistem mediante un servicio
  //4. si el proceso es true enviar la informacion mediante un mensaje 
  //5. si no es true, registrar enviar un reporte por el servicio de logs de charmss.com
    clientW.sendText('573202649850@c.us', 'Welcome Venom 🕷')
    res.send('OK')
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
  undefined,
  { logQR: false }
  )
  .then((client) => {
      clientW = client;
      start(client)
  })
  .catch((erro) => {
      console.log(erro);
  });
  
    console.log(`Server on ${port}`)
})

  function start(client) {
    client.onMessage((message) => {
      if (message.body === 'performer::' && message.isGroupMsg === false) {
        //1. consultar un servicio para revisar si el correo con el telefono coinciden en la base de datos.
        //2. obtener la respuesta del servidor 
        //3. si la respuesta es ok, enviar mensaje de registrado
        //4. si el mensaje es diferente a ok, imprimir el error en un mensaje de caso en un mensaje de whatsapp
        client
          .sendText(message.from, 'Whastapp registered-please go to https://performers.charmss.com')
          .then((result) => {
            console.log('Result: ', result);
          })
          .catch((erro) => {
            console.error('Error when sending: ', erro);
          });
      }
    });
  }