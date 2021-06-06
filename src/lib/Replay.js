const { Buffer } = require('safe-buffer');
const fs = require('fs');
const path = require("path");
const spawn = require('child_process').spawn;

module.exports = class Replay {
    /**
     * 
     * @param {String} filename Name of replay file
     * @param {Blob} base64Data Base64-encoded data of replay file
     */
    constructor(id, filename, base64Data) {
        this.id = id;
        this.filename = filename;
        this.path = path.join(__dirname, '../../uploads/' + filename);
        this.base64Data = base64Data;
    }

    addFolderToPath(folderName) {
        this.path = path.join(__dirname, '../../uploads/' + folderName + "/" + this.filename);
    }

    saveReplay() {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.path, Buffer.from(this.base64Data, 'base64'), (err) => {
                if (err) reject(err);
                resolve();
            })
        })
    }

    /**
     * Saves base64Data to disk and extracts inputs from replay
     * @returns {Promise} File save and input extraction
     */
    saveAndExtractReplay() {
        return new Promise((resolve, reject) => {
            fs.writeFile(this.path, Buffer.from(this.base64Data, 'base64'), (err) => {
                if (err) reject({ status: 'failed', error: err });
                this.extractInputsFromReplay()
                .then(data => resolve(data))
                .catch(e => reject({ status: 'failed', error: e }));
            })
        })
    }

    /**
     * Extracts inputs from replay file using Python script created by donadigo
     * @returns {Promise} Extracted inputs from replay file
     */
    extractInputsFromReplay() {
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
                const replay = JSON.parse(output)[0]
                replay.id = this.id
                resolve([ replay ])
            });
        })
    }

    removeFileFromDisk() {
        fs.rmSync(this.path);
    }
}