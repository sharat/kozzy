import { Transform, type TransformCallback } from 'node:stream'
import { processLines } from './process.js'

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
    const lines = Buffer.concat(this._buffer).toString().split('\n')
    const dataMap = processLines(lines)
    this.exitCode = dataMap.size > 0 ? 1 : 0
    cb()
  }
}

export default CompactStream
