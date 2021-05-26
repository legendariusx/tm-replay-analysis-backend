require('dotenv').config()

const express = require("express");
const _ = require('lodash');
const bodyParser = require('body-parser');
const cors = require('cors');
const uuid4 = require('uuid').v4;

const Replay = require('./lib/Replay');
const ReplayFolder = require('./lib/ReplayFolder');

const app = express();
const port = process.env.PORT || 3001;

app.use(bodyParser.json({ limit: '1mb' }));
app.use(cors());

app.get('/status', (req, res) => {
    res.send({ status: 'running', version: process.env.VERSION })
});

app.get('/testReplay', (req, res) => {
    const replay = new Replay('../src/test/riolu_replay.Replay.Gbx', '');
    replay.extractInputsFromReplay()
    .then(data => {
        res.send(data)
    })
    .catch(err => {
        res.send(err)
    })
})

app.post('/analyze', (req, res) => {
    if (req.body.files && req.body.files.length === 1) {
        const replay = new Replay(uuid4(), req.body.files[0].filename, req.body.files[0].base64Data);
        replay.saveAndExtractReplay()
        .then(data => {
            replay.removeFileFromDisk();
            res.send(data)
        })
        .catch(err => {
            replay.removeFileFromDisk();
            res.send(err)
        })
    }
    else if (req.body.files && req.body.files.length > 1) {
        let replays = []
        let savePromises = []

        for (let replay of req.body.files) {
            replays.push(new Replay(uuid4(), replay.filename, replay.base64Data))
        }

        let folderName = uuid4();

        let replayFolder = new ReplayFolder(folderName, replays);

        replayFolder.createFolderIfNotExists();

        for (let replay of replays) {
            replay.addFolderToPath(folderName);
            savePromises.push(replay.saveReplay())
        }

        Promise.all(savePromises).then(() => {
            replayFolder.extractReplaysFromFolder()
            .then(data => {
                res.send(data)
            })
            .catch(err => {
                res.send(err)
            })
        })
    }  
})

app.listen(port, () => {
    console.log(`Trackmania Replay Analysis API listening at http://localhost:${port}`)
});