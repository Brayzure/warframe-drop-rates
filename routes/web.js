/*
* ROUTING FOR WEB
*/

const Express = require('express');
const path = require('path');
const router = Express.Router();
const Database = require('../src/Database.js');

router.get('/search', (req, res) => {
	res.sendFile("search/search.html", {root: path.join(__dirname, "..", "public")})
});

router.get('*', (req, res) => {
    res.sendStatus(404);
});

module.exports = router;