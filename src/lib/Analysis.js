const uuid4 = require("uuid").v4;

const ReplayFolder = require("../lib/ReplayFolder");
const Replay = require("../lib/Replay");

/**
 * Helper class used for analyzing replays
 */
module.exports = class Analysis {
    /**
     * Analyzes provided files
     * @param {Array} files 
     * @returns {Promise} of analysis
     */
    analyze(files) {
        return new Promise((resolve, reject) => {
            const replays = this.getReplaysFromFiles(files);
            const replayFolder = this.createReplayFolder(replays);
            const savePromises = this.saveReplays(
                replayFolder.folderName,
                replays
            );

            Promise.all(savePromises)
                .then(this.extract(replayFolder, resolve, reject))
                .catch((err) => {
                    reject(err);
                });
        });
    }

    /**
     * Instantiates new Replay objects for every file
     * @param {Arary} files 
     * @returns {Array} of files
     */
    getReplaysFromFiles(files) {
        return files.map(
            (file) => new Replay(uuid4(), file.filename, file.base64Data)
        );
    }

    /**
     * Instantiates ReplayFolder object and creates directory
     * @param {Array} replays 
     * @returns {ReplayFolder}
     */
    createReplayFolder(replays) {
        const replayFolder = new ReplayFolder(uuid4(), replays);
        replayFolder.createFolderIfNotExists();
        return replayFolder;
    }

    /**
     * Saves replays on disk and returns array of promises
     * @param {String} folderName 
     * @param {Array} replays 
     * @returns {Array} of save promises
     */
    saveReplays(folderName, replays) {
        return replays.map((replay) => {
            replay.addFolderToPath(folderName);
            return replay.saveReplay();
        });
    }

    /**
     * Extracts replays from files and stores them in database
     * @param {ReplayFolder} replayFolder 
     * @param {function} resolve 
     * @param {fucntion} reject 
     */
    extract(replayFolder, resolve, reject) {
        replayFolder
            .extractReplaysFromFolder()
            .then((data) => {
                replayFolder.deleteFilesAndFolder();
                this.storeAnalysisInDatabase(replayFolder.replays, resolve, reject)
                    .then(() => resolve(data))
                    .catch((err) => reject(err));
            })
            .catch((err) => {
                replayFolder.deleteFilesAndFolder();
                reject(err);
            });
    }

    /**
     * Stores replays in database if they don't exist
     * @param {Array} replays 
     * @returns {Array} of save promises
     */
    storeAnalysisInDatabase(replays) {
        const promises = replays.map((replay) => replay.saveExtractedReplayToDatabaseIfNotExists());
        return Promise.all(promises);
    }
};
