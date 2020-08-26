#!/usr/bin/env node

var CompactStream = require('../')
var minimist = require('minimist')

var argv = minimist(process.argv.slice(2), {
    boolean: [
        'stdin'
    ]
})

if (!process.stdin.isTTY || argv._[0] === '-' || argv.stdin) {
    var kozzy = new CompactStream()

    // Set the process exit code based on whether pretty found errors
    process.on('exit', function (code) {
        if (code === 0 && kozzy.exitCode !== 0) {
            process.exitCode = kozzy.exitCode
        }
    })

    process.stdin.pipe(kozzy).pipe(process.stdout)
} else {
    console.error(`
        kozzy: ('brew install ktlint') then run 'ktlint | npx kozzy' instead.
    `)
    process.exitCode = 1
}