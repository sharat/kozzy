#!/usr/bin/env node

import { parseArgs } from 'node:util'
import { spawn } from 'node:child_process'
import { CompactStream } from '../index.js'

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  options: {
    stdin: { type: 'boolean', default: false },
    json: { type: 'boolean', default: true },
  },
  allowPositionals: true,
})

function pipeStdin() {
  const kozzy = new CompactStream()

  process.on('exit', (code) => {
    if (code === 0 && kozzy.exitCode !== 0) {
      process.exitCode = kozzy.exitCode
    }
  })

  process.stdin.pipe(kozzy).pipe(process.stdout)
}

function runKtlint() {
  const args = values.json !== false 
    ? ['--reporter', 'json'] 
    : []
  
  const ktlint = spawn('ktlint', args, { stdio: ['ignore', 'pipe', 'pipe'] })
  const kozzy = new CompactStream()

  ktlint.stdout.pipe(kozzy).pipe(process.stdout)
  
  ktlint.stderr.on('data', (data) => {
    process.stderr.write(data)
  })

  ktlint.on('exit', (code) => {
    if (code !== 0 && kozzy.exitCode === 0) {
      process.exitCode = code || 1
    } else if (kozzy.exitCode !== 0) {
      process.exitCode = kozzy.exitCode
    }
  })

  kozzy.on('error', (err) => {
    console.error('kozzy error:', err.message)
    process.exitCode = 1
  })
}

// Check if data is being piped in
if (!process.stdin.isTTY || positionals[0] === '-' || values.stdin) {
  pipeStdin()
} else {
  // Run ktlint internally with JSON reporter
  runKtlint()
}