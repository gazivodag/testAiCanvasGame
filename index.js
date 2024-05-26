const express = require('express');
const path = require("path");
const app = express();

const PORT = process.env.PORT || 3000;

app.set('trust proxy', true)
app.use(express.static('public'))
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './views/game.html'))
})

app.listen(PORT, () => {
    console.log(`App listening on port ${PORT}`)
})