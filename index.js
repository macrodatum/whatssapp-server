const express = require("express");
const fs = require("fs");
var url = require("url");
var path = require("path");
const venom = require("venom-bot");
const app = express();
var bodyParser = require("body-parser");
var https = require("https");
var processMessage = require("./messageProcessor");
var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

const port = 8030;

let clientW = null;

app.use(express.static("public"));

app.post("/ping", jsonParser, (req, res) => {
  try {
    let wsId = req.body.id;
    let message = "ping " + new Date().getTime();
    let typeMessage = req.body.type;
    switch (typeMessage) {
      case "text":
        clientW.sendText(wsId + "@c.us", message).then((result) => {
          console.log(result);
        });
        break;

      default:
        clientW
          .sendText(
            wsId + "@c.us",
            "unsupportedType: " +
              typeMessage +
              " [text, btn, link, imgb64]:: " +
              message
          )
          .then((result) => {
            console.log(result);
          });
        break;
    }
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

app.post("/send", jsonParser, (req, res) => {
  try {
    let wsId = req.body.id;
    let message = req.body.message;
    let typeMessage = req.body.type;
    let imageUrl = req.body.imageUrl;
    let imageName = req.body.imageName;
    let fileUriTemp = "";
    switch (typeMessage) {
      case "text":
        clientW.sendText(wsId + "@c.us", message).then((result) => {
          console.log("send text :: " + JSON.stringify(result));
        });
        break;
      case "image":
        downloadImage(imageUrl).then((fileUri) => {
          fileUriTemp = fileUri;
          clientW
            .sendImage(wsId + "@c.us", fileUri, imageName, message)
            .then((result) => {
              deleteImage(fileUriTemp);
              fileUriTemp = "";
              console.log("Result image :: ", result); //return object success
            })
            .catch((erro) => {
              console.error("Error when sending: ", erro); //return object error
            });
        });
        break;

      default:
        clientW
          .sendText(
            wsId + "@c.us",
            "unsupportedType: " +
              typeMessage +
              " [text, btn, link, imgb64]:: " +
              message
          )
          .then((result) => {
            console.log("unknow message type :: " + result);
          });
        break;
    }
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.sendStatus(400);
  }
});

app.listen(port, () => {
  venom
    .create(
      "charmss-notifications",
      (base64Qr, asciiQR, attempts, urlCode) => {
        console.log(asciiQR); // Optional to log the QR in the terminal
        console.log("urlCode", urlCode);
        var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
          response = {};

        if (matches.length !== 3) {
          return new Error("Invalid input string");
        }
        response.type = matches[1];
        response.data = new Buffer.from(matches[2], "base64");

        var imageBuffer = response;
        require("fs").writeFile(
          "./public/images/qr.png",
          imageBuffer["data"],
          "binary",
          function (err) {
            if (err != null) {
              console.log(err);
            }
          }
        );
      },
      // statusFind
      (statusSession, session) => {
        console.log("Status Session: ", statusSession); //return isLogged || notLogged || browserClose || qrReadSuccess || qrReadFail || autocloseCalled || desconnectedMobile || deleteToken || chatsAvailable || deviceNotConnected || serverWssNotConnected || noOpenBrowser || initBrowser || openBrowser || connectBrowserWs || initWhatsapp || erroPageWhatsapp || successPageWhatsapp || waitForLogin || waitChat || successChat
        //Create session wss return "serverClose" case server for close
        console.log("Session name: ", session);
      },
      { logQR: false }
    )
    .then((client) => {
      clientW = client;
      start(client);
      console.log("charmss-notifications started");
    })
    .catch((erro) => {
      console.log("Error generated for QRCode");
      console.log(erro);
    });

  console.log(`Server on ${port}`);
});

function start(client) {
  client.onMessage((message) => {
    console.log(message);
    processMessage(client, message);
  });
}

function downloadImage(urldata) {
  return new Promise((resolve, reject) => {
    var parsed = url.parse(urldata);
    var name = path.basename(parsed.pathname);
    const file = fs.createWriteStream(__dirname + "/temp/" + name);
    const request = https.get(urldata, function (response) {
      response.pipe(file);
      file.on("finish", () => {
        file.close();
        return resolve(__dirname + "/temp/" + name);
      });
    });
  });
}

function deleteImage(fileName) {
  fs.unlink(fileName, (err) => {
    if (err) {
      throw err;
    }
  });
}
