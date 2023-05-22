const express = require("express");

const app = express();

(async () => {

    try {

        app.get('/solr/**', (req, res) => {
                res.setHeader('content-type', 'application/json');
                res.end(JSON.stringify({'responseHeader':{'status':0, 'QTime': 6}, 'adds': []}));
        })
        app.post('/solr/**', (req, res) => {
                res.setHeader('content-type', 'application/json');
                res.end(JSON.stringify({'responseHeader':{'status':0, 'QTime': 6}, 'adds': []}));
        })

        app.listen(8983);
        console.log(`Search mocker is online.`);

    } catch (error) {
        console.log(error);
        process.exit(99);
    }

})();