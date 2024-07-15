const express = require("express");
const venom = require("venom-bot");

const app = express();
app.use(express.json());
const port = 3001;

venom.create({
  session: 'apizap'

})
  .then((client) => start(client))
  .catch((err) => {
    console.log(err)
  })

const start = (client) => {
  app.post("/send-message", async (req, res) => {
    const { to, message } = req.body;
    await client.sendText(to + "@c.us", message)
    res.json("menssagem enviada")
  })
  client.onMessage((message) => {
    if (message.body === 'BMK API diz: Solicitando confirmação de configuração de api' && message.isGroupMsg === false) {
      client
        .sendText(message.from, '*AUTH API - Pedro diz*: API CONECTADA COM SUCESSO!')
        .then((result) => {
          console.log('Result: ', result); //return object success
        })
        .catch((erro) => {
          console.error('Error when sending: ', erro); //return object error
        });
    } else {
      let messageReceived = message.body
      let fullInfo = message
      let responseId
      fetch('https://gameoverday.com/_functions/sendToCrm', {
        method: 'POST',
        body: JSON.stringify({
          "whatsapp": fullInfo.from,
          "nome": fullInfo.notifyName || fullInfo.sender.pushname || fullInfo.sender.name || "",
          "message": fullInfo.body,

        }),
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      })
        .then((response) => {
          responseId = response
          if (!response.ok) {
            return response.text().then(text => {
              throw new Error(text || 'Network response was not ok');
            });
          }
          // Check if the response has a body
          if (response.headers.get('Content-Length') === '0') {
            return {};
          }
          return response.json();
        })
        .then(async (json) => {
          console.log('Lead salvo com sucesso - Success:', responseId);


        })
        .catch((error) => {
          console.error('Error:', error);
        })
        .finally(() => {

        });

    }
  });
}

app.listen(port, () => {
  console.log("servidor rodando na porta " + port)
})