export interface LintResult {
  path: string
  line: string
  message: string
}

// ktlint JSON reporter format
export interface KtlintViolation {
  line: number
  column: number
  ruleId: string
  detail: string
}

export interface KtlintFile {
  file: string
  errors: KtlintViolation[]
}

export interface KtlintJsonOutput {
  errors: KtlintFile[]
}