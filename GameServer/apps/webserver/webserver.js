const express = require('express');
const app = express();
const port = 3000;

app.use('/', express.static(__dirname + '/web_root'));
app.get('/', (req, res) => {
    res.send("helloworld");
})



app.listen(port);