import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { extractLine, buildResultMap, printResults, processLines } from '../process.js'

const SAMPLE_LINE = '/src/main/Foo.kt:10:5: Unexpected blank line(s) before "}"'
const SAMPLE_LINE_2 = '/src/main/Bar.kt:3:1: Missing newline before "}"'
const SAMPLE_LINE_SAME_FILE = '/src/main/Foo.kt:22:1: Redundant semicolon'

describe('extractLine', () => {
  it('parses a valid ktlint output line', () => {
    const result = extractLine(SAMPLE_LINE)
    expect(result).toEqual({
      path: '/src/main/Foo.kt',
      line: '10:5',
      message: 'Unexpected blank line(s) before "}"',
    })
  })

  it('returns null for an empty line', () => {
    expect(extractLine('')).toBeNull()
  })

  it('returns null for lines without file extension', () => {
    expect(extractLine('/no/extension:1:1: message')).toBeNull()
  })

  it('returns null for lines missing column info', () => {
    expect(extractLine('/src/Foo.kt: just a message')).toBeNull()
  })

  it('returns null for plain text lines', () => {
    expect(extractLine('some random log line')).toBeNull()
  })

  it('handles Windows-style paths', () => {
    const result = extractLine('C:\\src\\main\\Foo.kt:10:5: Some message')
    expect(result).not.toBeNull()
    expect(result?.message).toBe('Some message')
  })

  it('captures path, line:col, and full message', () => {
    const result = extractLine(SAMPLE_LINE_2)
    expect(result?.path).toBe('/src/main/Bar.kt')
    expect(result?.line).toBe('3:1')
    expect(result?.message).toBe('Missing newline before "}"')
  })
})

describe('buildResultMap', () => {
  it('returns an empty map for lines with no parseable data', () => {
    const map = buildResultMap(['', 'not a lint line', '   '])
    expect(map.size).toBe(0)
  })

  it('groups results by file path', () => {
    const map = buildResultMap([SAMPLE_LINE, SAMPLE_LINE_SAME_FILE, SAMPLE_LINE_2])
    expect(map.size).toBe(2)
    expect(map.get('/src/main/Foo.kt')).toHaveLength(2)
    expect(map.get('/src/main/Bar.kt')).toHaveLength(1)
  })

  it('preserves order of errors within a file', () => {
    const map = buildResultMap([SAMPLE_LINE, SAMPLE_LINE_SAME_FILE])
    const fooErrors = map.get('/src/main/Foo.kt')!
    expect(fooErrors[0].line).toBe('10:5')
    expect(fooErrors[1].line).toBe('22:1')
  })

  it('skips null lines without crashing', () => {
    const map = buildResultMap(['', SAMPLE_LINE, '', ''])
    expect(map.size).toBe(1)
  })
})

describe('printResults', () => {
  let consoleSpy: ReturnType<typeof vi.spyOn>

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    consoleSpy.mockRestore()
  })

  it('prints nothing for an empty map', () => {
    printResults(new Map())
    expect(consoleSpy).not.toHaveBeenCalled()
  })

  it('prints a header and table row per file', () => {
    const map = buildResultMap([SAMPLE_LINE])
    printResults(map)
    expect(consoleSpy).toHaveBeenCalledTimes(2)
    const headerCall = consoleSpy.mock.calls[0][0] as string
    expect(headerCall).toContain('/src/main/Foo.kt')
  })

  it('prints one header per file', () => {
    const map = buildResultMap([SAMPLE_LINE, SAMPLE_LINE_2])
    printResults(map)
    // 2 headers + 2 table blocks
    expect(consoleSpy).toHaveBeenCalledTimes(4)
  })
})

describe('processLines', () => {
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('returns an empty map when there are no lint errors', () => {
    const map = processLines(['', 'BUILD SUCCESSFUL'])
    expect(map.size).toBe(0)
  })

  it('returns a populated map for lint errors', () => {
    const map = processLines([SAMPLE_LINE, SAMPLE_LINE_2])
    expect(map.size).toBe(2)
  })

  it('handles a mixed array of valid and invalid lines', () => {
    const map = processLines(['', SAMPLE_LINE, 'BUILD FAILED', SAMPLE_LINE_SAME_FILE])
    expect(map.size).toBe(1)
    expect(map.get('/src/main/Foo.kt')).toHaveLength(2)
  })
})
