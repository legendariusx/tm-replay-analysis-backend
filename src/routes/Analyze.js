const uuid4 = require("uuid").v4;
const { get } = require("lodash");

const ReplayFolder = require("../lib/ReplayFolder");
const Replay = require("../lib/Replay");

const { createReplay } = require("../lib/Database");

const testReplayRoute = (req, res, next) => {
    const replay = new Replay(
        uuid4(),
        "../src/test/riolu_replay.Replay.Gbx",
        ""
    );
    replay
        .extractInputsFromReplay()
        .then((data) => {
            res.send(data);
        })
        .catch((err) => {
            res.send(err);
        });
};

// TODO: Refactor entire route
const analyzeReplaysRoute = (req, res, next) => {
    const files = get(req, "body.files", []);

    if (files && files.length === 1) {
        const replay = new Replay(
            uuid4(),
            files[0].filename,
            files[0].base64Data
        );
        replay
            .saveAndExtractReplay()
            .then((data) => {
                replay.removeFileFromDisk();
                createReplay(data[0]);
                res.send(data);
            })
            .catch((err) => {
                replay.removeFileFromDisk();
                res.send(err);
            });
    } else if (files && files.length > 1) {
        let replays = [];
        let savePromises = [];

        for (const replay of files) {
            replays.push(
                new Replay(uuid4(), replay.filename, replay.base64Data)
            );
        }

        let folderName = uuid4();

        const replayFolder = new ReplayFolder(folderName, replays);

        replayFolder.createFolderIfNotExists();

        for (const replay of replays) {
            replay.addFolderToPath(folderName);
            savePromises.push(replay.saveReplay());
        }

        Promise.all(savePromises).then(() => {
            replayFolder
                .extractReplaysFromFolder()
                .then((data) => {
                    replayFolder.deleteFilesAndFolder();
                    res.send(data);
                })
                .catch((err) => {
                    replayFolder.deleteFilesAndFolder();
                    res.send(err);
                });
        });
    }
};

exports.analyzeReplaysRoute = analyzeReplaysRoute;
exports.testReplayRoute = testReplayRoute;
