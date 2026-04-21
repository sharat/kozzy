import { Transform, type TransformCallback } from 'node:stream'
import { processLines, processJson } from './process.js'
import type { LintResult } from './types.js'

export class CompactStream extends Transform {
  exitCode: number = 0
  private _buffer: Buffer[] = []

  constructor() {
    super()
  }

  override _transform(chunk: Buffer, _encoding: BufferEncoding, cb: TransformCallback): void {
    this._buffer.push(chunk)
    cb()
  }

  override _flush(cb: TransformCallback): void {
    const content = Buffer.concat(this._buffer).toString().trim()
    
    // Try JSON parsing first (ktlint --reporter json)
    // JSON starts with { or [
    const trimmed = content.trimStart()
    let dataMap: Map<string, LintResult[]>
    
    if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
      dataMap = processJson(content)
      // If JSON parsing returned empty, fallback to text parsing
      if (dataMap.size === 0) {
        const lines = content.split('\n')
        dataMap = processLines(lines)
      }
    } else {
      // Regular ktlint text output
      const lines = content.split('\n')
      dataMap = processLines(lines)
    }
    
    this.exitCode = dataMap.size > 0 ? 1 : 0
    cb()
  }
}

export default CompactStream