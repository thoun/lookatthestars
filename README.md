# What is this project ? 
This project is an adaptation for BoardGameArena of game Look at the Stars edited by Bombyx.
You can play here : https://boardgamearena.com

# How to install the auto-build stack

## Install builders
Intall node/npm then `npm i` on the root folder to get builders.

## Auto build JS and CSS files
In VS Code, add extension https://marketplace.visualstudio.com/items?itemName=emeraldwalk.RunOnSave and then add to config.json extension part :
```json
        "commands": [
            {
                "match": ".*\\.ts$",
                "isAsync": true,
                "cmd": "npm run build:ts"
            },
            {
                "match": ".*\\.scss$",
                "isAsync": true,
                "cmd": "npm run build:scss"
            }
        ]
```
If you use it for another game, replace `lookatthestars` mentions on package.json `build:scss` script and on tsconfig.json `files` property.

## Auto-upload builded files
Also add one auto-FTP upload extension (for example https://marketplace.visualstudio.com/items?itemName=lukasz-wronski.ftp-sync) and configure it. The extension will detected modified files in the workspace, including builded ones, and upload them to remote server.

## Hint
Make sure ftp-sync.json and node_modules are in .gitignore

JSON.stringify(
g_gamelogs.map(log => log.data)
).replaceAll('93453146', '2343492').replaceAll('91603394', '2343493')

gameui.replay = JSON.parse(<paste replay or cleanReplay here>);


    // gameui.debugReplay()
    private cleanReplay() {
        const replay = (this as any).replay;
        const clean = [];
        replay.forEach(line => line.filter(line => typeof this[`notif_${line.type}`] === 'function').map(line => ({ type: line.type, args: line.args })).forEach(sub => clean.push(sub)));
        console.log(clean);
        return JSON.stringify(clean);
    }

    // gameui.playReplay()
    private playReplay() {
        const cleanReplay = (this as any).replay;
        cleanReplay.filter((line, index) => index < 1000).forEach((line, index) => {
            setTimeout(() => {            
                console.log(`notif_${line.type}`, line.args);
                try {
                    this[`notif_${line.type}`](line);
                } catch {}
            }, index * 1000);
        })
    }