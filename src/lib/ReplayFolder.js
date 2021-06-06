const fs = require('fs');
const path = require("path");
const spawn = require('child_process').spawn;

/**
 * Class for handling multiple replays with a folder
 */
module.exports = class ReplayFolder {
    /**
     * @param {String} folderName 
     * @param {Array} replays 
     */
    constructor(folderName, replays) {
        this.folderName = folderName;
        this.path = path.join(__dirname, "../../uploads/", folderName);
        this.replays = replays;
    }

    /**
     * Creates folder on disk if not exists
     */
    createFolderIfNotExists() {
        if (!fs.existsSync(this.path)){
            fs.mkdirSync(this.path);
        }
    }

    /**
     * Extracts all replays from folder with script
     * @returns {Promise}
     */
    extractReplaysFromFolder() {
        return new Promise((resolve, reject) => {
            const ls = spawn('python3', [path.join(__dirname, '../scripts/extract_replay.py'), this.path])
        
            let output = "";

            ls.stdout.on('data', (data) => {
                output += data
            });
            
            ls.stderr.on('data', (data) => {
                reject(data)
            });

            ls.stdout.on('end', () => {
                const data = JSON.parse(output)
                for(let i = 0; i < data.length; i++) {
                    data[i].id = this.replays[i].id
                    this.replays[i].data = data[i];
                }
                resolve(data)
            });
        })
    }

    /**
     * Deletes replay files and folder if exists
     */
    deleteFilesAndFolder() {
        for (const replay of this.replays) {
            replay.removeFileFromDisk();
        }

        if (fs.existsSync(this.path)){
            fs.rmdirSync(this.path);
        }
    }
}