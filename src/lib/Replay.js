const { Buffer } = require("safe-buffer");
const fs = require("fs");
const path = require("path");
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
