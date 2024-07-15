const express = require('express');
const venom = require('venom-bot');
const appqr = express();
const server = require('http').createServer(appqr);
const io = require('socket.io')(server, {cors: {origin: "*"}});

appqr.set("view engine", "ejs");

appqr.get('/home', (req, res) => {
    res.render('home');
  });

appqr.use(express.static(__dirname + '/images'));

server.listen(3000, () => {
  console.log('listening on port 3000')
})

io.on('connection', (socket) => {
  
  console.log('User connected:' + socket.id);

  socket.on("message", () => {
      venom
      .create({
        session: 'sessionName',
        catchQR: (base64Qr, asciiQR) => {
          console.log(asciiQR); // Optional to log the QR in the terminal
          var matches = base64Qr.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/),
            response = {};

          if (matches.length !== 3) {
            return new Error('Invalid input string');
          }
          response.type = matches[1];
          response.data = new Buffer.from(matches[2], 'base64');
          
          var imageBuffer = response;

          require('fs').writeFile(
            './images/out.png',
            imageBuffer['data'],
            'binary',
            function (err) {
              if (err != null) {
                console.log(err);
              }
            }
          );
        },
        
        logQR: false,
      })
      .then((client) => {start(client);})
      .catch((error) => console.log(error));
      
    
    });
    const start = (client) => {      
          client.onStateChange((state) => {
          
          });

        setTimeout(() => {
            testarApi()
            .then((res)=>{
                console.log("resultado do envio ", res)
            })
        }, 6000);
         
        appqr.post("/send-message-cf", async (req, res) => {
          const {to, message } = req.body;
          await client.sendText(to + "@c.us", message)
          res.json("menssagem enviada")
        })
        client.onMessage((message) => {
          if (message.body === '*AUTH API - Pedro diz*: API CONECTADA COM SUCESSO!' && message.isGroupMsg === false) {
            let wppNumber = message.body+"numero configurado: " + message.to
            socket.emit('wppNumber', wppNumber );          
            client
              .sendText(message.from, 'Configuração finalizada, Envio e leitura de mensagens: OK - Salvando em CRM: OK')
              .then((result) => {
                console.log('Result: ', result); //return object success
              })
              .catch((erro) => {
                console.error('Error when sending: ', erro); //return object error
              });
          } else {
            let messageReceived = message.body
             

            let fullInfo = message
            console.log(fullInfo)
            socket.emit('wppNumber', fullInfo.to);
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
                console.log('Lead salvo com sucesso - Success:');
      
      
              })
              .catch((error) => {
                console.error('Error:', error);
              })
              .finally(() => {
      
              });
      
          }
        });
       async function testarApi(){
          
                const to = "556294245957"
                const message = "BMK API diz: Solicitando confirmação de configuração de api"
                await client.sendText(to + "@c.us", message)
                socket.emit('message', "CONNECTED");
                return ("menssagem enviada")
                
             
          }
      }

  socket.on("ready", () => {
      setTimeout(function () {
            socket.emit('ready', './out.png');
          },3000);
    });

    // socket.on("ready", () => {
    //   for (i = 0; i < 5; i++) {
    //     (function() {
    //       var j = i;
    //       setTimeout(function () {
    //         console.log(j);
    //         socket.emit('ready', j);
    //       }, Math.floor(Math.random() * 1000));
    //     })();
    //   }
    // });

  });