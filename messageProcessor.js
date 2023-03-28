const axios = require("axios");
/*
    client: el objeto de conexion de whatsapp
    message: el objeto con el mensaje a procesar
 */
const processMessage = (client, message) => {
  if (isReply(message)) {
    if (message.quotedMsg.body.includes("client::")) {
      processRequest(client, message, "client");
    } else if (message.quotedMsg.body.includes("performer::")) {
      processRequest(client, message, "performer");
    } else {
      // client
      //   .sendText(
      //     message.from,
      //     "LiveCharmss enjoy all experience for you, https://www.livecharmss.com"
      //   )
      //   .then((result) => {
      //     console.log("Result: ", result);
      //   })
      //   .catch((erro) => {
      //     console.error("Error when sending: ", erro);
      //   });
    }
  } else if (isCancel(message) && message.isGroupMsg === false) {
    processCancel(client, message);
  } else if (ErrorRequestAccept(message) && message.isGroupMsg === false) {
    client
      .sendText(
        message.from,
        "Please Reply the security message (that contains a similar text AAAAAA::XXXXXXXXXXXXXXXX) that has come to your WhatsApp with the word accept. support@livecharmss.com.co"
      )
      .then((result) => {
        console.log("Result: ", result);
      })
      .catch((erro) => {
        console.error("Error when sending: ", erro);
      });
  }
};

const isReply = (message) => {
  return message.type === "reply" ? true : false;
};

const isCancel = (message) => {
  return message.body.toLowerCase().includes("cancel") ? true : false;
};

const ErrorRequestAccept = (message) => {
  return message.body.toLowerCase().includes("accept") ? true : false;
};

const processRequest = (client, message, type) => {
  let url = "";
  let site = "";
  if (type === "client") {
    url = "https://charmssapi-test.azurewebsites.net/api/customer/whatsapp";
    site = "https://www.livecharmss.com";
  } else {
    url = "https://charmssapi-test.azurewebsites.net/api/account/whatsapp";
    site = "https://performer.charmss.com";
  }

  let acceptKey = message.body.toLowerCase();
  let quotedMsg = message.quotedMsg.body;

  if (!acceptKey.includes("accept")) {
    client
      .sendText(
        message.from,
        `Please Reply to the security message (${type}::XXXXX-XXXXXXXXXXX) that has come to your WhatsApp with the word accept. support@livecharmss.com.co`
      )
      .then((result) => {
        console.log("Result: ", result);
      })
      .catch((erro) => {
        console.error("Error when sending: ", erro);
      });
  } else {
    axios
      .post(url, {
        whatsappId: message.from,
        token: quotedMsg,
      })
      .then(
        (response) => {
          if (response.data === "ok") {
            client
              .sendImage(
                message.from,
                __dirname + "/public/images/logocharmss.jpg",
                "logocharmss.jpg",
                `CharmssBOT your number has been registed, please go to ${site}. if you want to delete this notifications send message at this contact with the word "cancel"`
              )
              .then((result) => {
                console.log("Result: ", result);
              })
              .catch((erro) => {
                console.error("Error when sending: ", erro);
              });
          } else {
            client
              .sendText(
                message.from,
                "CharmssBOT: your whatsapp number is not registered in our system please contact our support team at support@livecharmss.com.co"
              )
              .then((result) => {
                console.log("Result: ", result);
              })
              .catch((erro) => {
                console.error("Error when sending: ", erro);
              });
          }
        },
        (error) => {
          console.error(" Error validating whatsappId " + error);
        }
      );
  }
};

const processCancel = (client, message) => {
  let urlClientCancel = "https://api.charmss.com/api/customer/whatsappcancel";
  axios
    .post(urlClientCancel, {
      whatsappId: message.from,
    })
    .then(
      (response) => {
        if (response.data.data === "ok") {
          client
            .sendText(
              message.from,
              "CharmssBOT your whatsapp contact has been deleted from https://www.livecharmss.com"
            )
            .then((result) => {
              console.log("Result: ", result);
            })
            .catch((erro) => {
              console.error("Error when sending: ", erro);
            });
        } else {
          client
            .sendText(
              message.from,
              "CharmssBOT: your whatsapp number is not registered in our client system please contact our support team at support@livecharmss.com.co"
            )
            .then((result) => {
              console.log("Result: ", result);
            })
            .catch((erro) => {
              console.error("Error when sending: ", erro);
            });
        }
      },
      (error) => {
        console.error(" Error validating whatsappId " + error);
      }
    );
};

module.exports = processMessage;
