import { describe, it, expect } from 'vitest'
import { spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { resolve } from 'node:path'

const BIN = resolve(import.meta.dirname, '../../dist/bin/cmd.cjs')
const LINT_LINE = '/src/main/Foo.kt:10:5: Unexpected blank line(s) before "}"'
const KTLINT_JSON = JSON.stringify([
  {
    file: '/src/main/Foo.kt',
    errors: [
      { line: 10, column: 5, ruleId: 'no-consecutive-blank-lines', detail: 'Unexpected blank line(s) before "}"' }
    ]
  }
])

function runCLI(input: string, args: string[] = []) {
  return spawnSync(process.execPath, [BIN, ...args], {
    input,
    encoding: 'utf8',
    timeout: 5000,
  })
}

describe('CLI integration', () => {
  it('built binary exists', () => {
    expect(existsSync(BIN)).toBe(true)
  })

  it('exits with code 0 when there are no lint errors', () => {
    const result = runCLI('BUILD SUCCESSFUL\n', ['--stdin'])
    expect(result.status).toBe(0)
  })

  it('exits with code 1 when lint errors are present', () => {
    const result = runCLI(LINT_LINE + '\n', ['--stdin'])
    expect(result.status).toBe(1)
  })

  it('outputs file paths for lint errors', () => {
    const result = runCLI(LINT_LINE + '\n', ['--stdin'])
    expect(result.stdout + result.stderr).toContain('/src/main/Foo.kt')
  })

  it('handles empty input gracefully', () => {
    const result = runCLI('', ['--stdin'])
    expect(result.status).toBe(0)
  })

  it('handles multiple errors across files', () => {
    const input = [
      '/src/main/Foo.kt:10:5: Error one',
      '/src/main/Bar.kt:3:1: Error two',
      '',
    ].join('\n')
    const result = runCLI(input, ['--stdin'])
    expect(result.status).toBe(1)
    const output = result.stdout + result.stderr
    expect(output).toContain('/src/main/Foo.kt')
    expect(output).toContain('/src/main/Bar.kt')
  })

  it('parses ktlint JSON output', () => {
    const result = runCLI(KTLINT_JSON, ['--stdin'])
    expect(result.status).toBe(1)
    const output = result.stdout + result.stderr
    expect(output).toContain('/src/main/Foo.kt')
  })

  it('handles ktlint JSON with no errors', () => {
    const result = runCLI('[]', ['--stdin'])
    expect(result.status).toBe(0)
  })

  it('handles ktlint JSON object format', () => {
    const json = JSON.stringify({
      errors: [
        {
          file: '/src/main/Bar.kt',
          errors: [
            { line: 5, column: 1, ruleId: 'final-newline', detail: 'Missing newline' }
          ]
        }
      ]
    })
    const result = runCLI(json, ['--stdin'])
    expect(result.status).toBe(1)
    const output = result.stdout + result.stderr
    expect(output).toContain('/src/main/Bar.kt')
  })
})