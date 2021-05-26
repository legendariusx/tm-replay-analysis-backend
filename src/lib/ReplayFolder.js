const fs = require('fs');
const path = require("path");
const spawn = require('child_process').spawn;

module.exports = class ReplayFolder {
    constructor(folderPath, replays) {
        this.path = path.join(__dirname, "../../uploads/", folderPath);
        this.replays = replays;
    }

    createFolderIfNotExists() {
        if (!fs.existsSync(this.path)){
            fs.mkdirSync(this.path);
        }
    }

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
                }
                resolve(data)
            });
        })
    }
}