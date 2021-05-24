require('dotenv').config()

const express = require("express");
const { once } = require('events');
const path = require("path");
const fs = require('fs');
const _ = require('lodash');
const bodyParser = require('body-parser');
const cors = require('cors');
const spawn = require('child_process').spawn;
const { Buffer } = require('safe-buffer');

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(cors());

app.get('/status', (req, res) => {
    res.send({ status: 'Running', version: process.env.VERSION })
});

app.get('/testReplay', (req, res) => {
    const ls = spawn('python3', [path.join(__dirname, 'scripts/generate_input_file.py'), path.join(__dirname, 'scripts/riolu_replay.Replay.Gbx')])

    ls.stdout.on('data', (data) => {
        res.send({ status: 'success', data: JSON.parse(data) })
    });
    
    ls.stderr.on('data', (data) => {
        res.send({ status: 'failed', error: data })
    });
})

app.get('/uploadedReplay', (req, res) => {
    fs.writeFile(path.join(__dirname, '../uploads/' + req.body.filename), Buffer.from(req.body.data, 'base64'), (err) => {
        if (err) res.send({ status: 'failed', error: err });
        const ls = spawn('python3', [path.join(__dirname, 'scripts/generate_input_file.py'), path.join(__dirname, '../uploads/' + req.body.filename)])

        ls.stdout.on('data', (data) => {
            res.send({ status: 'success', data: JSON.parse(data) })
        });
        
        ls.stderr.on('data', (data) => {
            res.send({ status: 'failed', error: data })
        });
    })
    
})

app.listen(port, () => {
    console.log(`Trackmania Replay Analysis API listening at http://localhost:${port}`)
});