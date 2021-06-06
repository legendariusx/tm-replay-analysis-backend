const { Buffer } = require("safe-buffer");
const fs = require("fs");
const path = require("path");
const spawn = require("child_process").spawn;
const { getReplay, createReplay } = require("./Database");

/**
 * Class for handling replays
 */
module.exports = class Replay {
    /**
     * @param {String} filename Name of replay file
     * @param {Blob} base64Data Base64-encoded data of replay file
     */
    constructor(id, filename, base64Data) {
        this.id = id;
        this.filename = filename;
        this.path = path.join(__dirname, "../../uploads/" + filename);
        this.base64Data = base64Data;
        this.data = {};
    }

    /**
     * Adds folderName to path
     * @param {String} folderName 
     */
    addFolderToPath(folderName) {
        this.path = path.join(
            __dirname,
            "../../uploads/" + folderName + "/" + this.filename
        );
    }

    /**
     * Saves replay on disk
     * @returns {Promise} of file save
     */
    saveReplay() {
        return new Promise((resolve, reject) => {
            fs.writeFile(
                this.path,
                Buffer.from(this.base64Data, "base64"),
                (err) => {
                    if (err) reject(err);
                    resolve();
                }
            );
        });
    }

    /**
     * Saves base64Data to disk and extracts inputs from replay
     * @returns {Promise} File save and input extraction
     */
    saveAndExtractReplay() {
        return new Promise((resolve, reject) => {
            fs.writeFile(
                this.path,
                Buffer.from(this.base64Data, "base64"),
                (err) => {
                    if (err) reject({ status: "failed", error: err });
                    this.extractInputsFromReplay()
                        .then((data) => resolve(data))
                        .catch((e) => reject({ status: "failed", error: e }));
                }
            );
        });
    }

    /**
     * Extracts inputs from replay file using Python script created by donadigo
     * @returns {Promise} Extracted inputs from replay file
     */
    extractInputsFromReplay() {
        return new Promise((resolve, reject) => {
            const ls = spawn("python3", [
                path.join(__dirname, "../scripts/extract_replay.py"),
                this.path,
            ]);

            let output = "";

            ls.stdout.on("data", (data) => {
                output += data;
            });

            ls.stderr.on("data", (data) => {
                reject(data);
            });

            ls.stdout.on("end", () => {
                const replay = JSON.parse(output)[0];
                replay.id = this.id;
                this.data = replay;
                resolve([replay]);
            });
        });
    }

    /**
     * Creates replay in database if no replay with same replayUID exists
     * @returns {Promise}
     */
    saveExtractedReplayToDatabaseIfNotExists() {
        return new Promise((resolve, reject) => {
            getReplay({ replayUID: this.data.replayUID })
                .then((replay) => {
                    if (replay !== null) resolve();
                    else createReplay(this.data)
                        .then(() => resolve())
                        .catch((err) => reject(err));
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    /**
     * Deletes file from disk if exists
     */
    removeFileFromDisk() {
        if (fs.existsSync(this.path)) {
            fs.rmSync(this.path);
        }
    }
};
