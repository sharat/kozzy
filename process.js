const chalk = require('chalk')
const table = require('text-table')

async function processResults(lines) {

    var dataMap = new Map()
    for (const line of lines) {

        console.log(line)

        const data = extractLines(line)

        if(data == null) continue // Inoperable line, continue

        var fileData = dataMap.get(data.path);

        if (!dataMap.has(data.path)) {
            fileData = []
        }

        fileData.push(data)
        dataMap.set(data.path, fileData)
    }

    printMapData(dataMap);
    return dataMap;
}  
   

const printMapData = (dataMap) => {
    dataMap.forEach((value, key, map) => {
        console.log("\n" + chalk.underline(key))

        var rows = []
        value.forEach(element => rows.push([chalk.gray(element.line), element.message]))
        console.log(table(rows))
    });
}


const extractLines = (line) => {

    var re = new RegExp(/(.+\.\w+):(\d+:\d+):\s(.+)/, 'i')
    var match = line.match(re)

    if (match == null || match.length < 4 ) {
        return null;
    }

    return {
        path: match[1],
        line: match[2],
        message: match[3]
    }
    
}

module.exports = processResults;