const express = require('express');
const app = express();
const router = require('./routes/routes');

const bodyparser = require('body-parser');

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use('/', router);

const port = 8080;
app.listen(port, () => {
    console.log(`
---------------------------
      Servidor criado!
   http://localhost:${port}/
---------------------------
    `);
});