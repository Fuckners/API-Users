const express = require('express');
const app = express();
const router = require('./routes/routes');
const cors = require('cors');

const bodyparser = require('body-parser');

app.use(cors());

app.use(bodyparser.urlencoded({ extended: false }));
app.use(bodyparser.json());

app.use('/', router);

const port = 6969;
app.listen(port, () => {
    console.log(`
---------------------------
      Servidor criado!
   http://localhost:${port}/
---------------------------
    `);
});