#!/usr/bin/env node

import { parseArgs } from 'node:util'
import { CompactStream } from '../index.js'

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    stdin: { type: 'boolean', default: false },
  },
  allowPositionals: true,
})

if (!process.stdin.isTTY || positionals[0] === '-' || values.stdin) {
  const kozzy = new CompactStream()

  process.on('exit', (code) => {
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
