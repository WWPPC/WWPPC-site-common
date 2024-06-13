import fs from 'fs';

const toScan = ['src/'];
while (toScan.length > 0) {
    let currDir = toScan.shift();
    const paths = fs.readdirSync(currDir);
    for (const path of paths) {
        if (fs.lstatSync(currDir + path).isDirectory()) {
            toScan.push(currDir + path + '/');
        } else if (path.endsWith('.d.ts') || path.endsWith('.js')) {
            fs.rmSync(currDir + path);
        }
    }
}