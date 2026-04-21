import pc from 'picocolors'
import table from 'text-table'
import type { KtlintJsonOutput, KtlintFile, LintResult } from './types.js'

const LINE_RE = /(.+\.\w+):(\d+:\d+):\s(.+)/i

// Parse regular ktlint text output (fallback)
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

// Parse ktlint JSON output (primary)
export function parseKtlintJson(json: string): Map<string, LintResult[]> {
  const dataMap = new Map<string, LintResult[]>()
  
  try {
    const parsed = JSON.parse(json) as KtlintJsonOutput | KtlintFile[]
    
    // Handle both formats: { errors: [...] } or [...]
    const files: KtlintFile[] = Array.isArray(parsed) ? parsed : parsed.errors || []
    
    for (const file of files) {
      if (!file.file || !Array.isArray(file.errors)) continue
      
      const results: LintResult[] = file.errors.map((err) => ({
        path: file.file,
        line: `${err.line}:${err.column}`,
        message: err.detail,
      }))
      
      dataMap.set(file.file, results)
    }
  } catch {
    // Not valid JSON, return empty map
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

export function processJson(json: string): Map<string, LintResult[]> {
  const dataMap = parseKtlintJson(json)
  printResults(dataMap)
  return dataMap
}