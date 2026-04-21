import pc from 'picocolors'
import table from 'text-table'
import type { LintResult } from './types.js'

const LINE_RE = /(.+\.\w+):(\d+:\d+):\s(.+)/i

export function extractLine(line: string): LintResult | null {
  const match = line.match(LINE_RE)
  if (match == null || match.length < 4) return null
  return {
    path: match[1],
    line: match[2],
    message: match[3],
  }
}

export function buildResultMap(lines: string[]): Map<string, LintResult[]> {
  const dataMap = new Map<string, LintResult[]>()
  for (const line of lines) {
    const data = extractLine(line)
    if (data == null) continue
    if (!dataMap.has(data.path)) {
      dataMap.set(data.path, [])
    }
    dataMap.get(data.path)!.push(data)
  }
  return dataMap
}

export function printResults(dataMap: Map<string, LintResult[]>): void {
  dataMap.forEach((results, filePath) => {
    console.log('\n' + pc.underline(filePath))
    const rows = results.map((r) => [pc.gray(r.line), r.message])
    console.log(table(rows))
  })
}

export function processLines(lines: string[]): Map<string, LintResult[]> {
  const dataMap = buildResultMap(lines)
  printResults(dataMap)
  return dataMap
}