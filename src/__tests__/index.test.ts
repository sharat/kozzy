import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { Readable } from 'node:stream'
import { CompactStream } from '../index.js'

function streamToString(stream: CompactStream): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    stream.on('data', (chunk: Buffer) => chunks.push(chunk))
    stream.on('end', () => resolve(Buffer.concat(chunks).toString()))
    stream.on('error', reject)
  })
}

function pipeInput(input: string, stream: CompactStream): void {
  const readable = Readable.from([Buffer.from(input)])
  readable.pipe(stream)
}

describe('CompactStream', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('can be instantiated', () => {
    const stream = new CompactStream()
    expect(stream).toBeInstanceOf(CompactStream)
    expect(stream.exitCode).toBe(0)
  })

  it('sets exitCode to 0 when input has no lint errors', async () => {
    const stream = new CompactStream()
    pipeInput('BUILD SUCCESSFUL\n', stream)
    await streamToString(stream)
    expect(stream.exitCode).toBe(0)
  })

  it('sets exitCode to 1 when input has lint errors', async () => {
    const stream = new CompactStream()
    pipeInput('/src/Foo.kt:10:5: Unexpected blank line\n', stream)
    await streamToString(stream)
    expect(stream.exitCode).toBe(1)
  })

  it('buffers multiple chunks before processing', async () => {
    const stream = new CompactStream()
    const readable = Readable.from([
      Buffer.from('/src/Foo.kt:10:5: Error one\n'),
      Buffer.from('/src/Bar.kt:3:1: Error two\n'),
    ])
    readable.pipe(stream)
    await streamToString(stream)
    expect(stream.exitCode).toBe(1)
  })

  it('sets exitCode to 0 for completely empty input', async () => {
    const stream = new CompactStream()
    pipeInput('', stream)
    await streamToString(stream)
    expect(stream.exitCode).toBe(0)
  })

  it('handles input with mixed valid and invalid lines', async () => {
    const stream = new CompactStream()
    pipeInput('not a lint line\n/src/Foo.kt:1:1: Some error\nmore noise\n', stream)
    await streamToString(stream)
    expect(stream.exitCode).toBe(1)
  })

  it('is a writable and readable stream', () => {
    const stream = new CompactStream()
    expect(typeof stream.write).toBe('function')
    expect(typeof stream.read).toBe('function')
    expect(typeof stream.pipe).toBe('function')
  })
})
