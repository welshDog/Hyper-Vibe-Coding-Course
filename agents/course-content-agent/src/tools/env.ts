export function getRequiredEnv(name: string): string {
  const value = process.env[name]
  if (!value || value.trim().length === 0) {
    throw new Error(`Missing required env var: ${name}`)
  }
  return value
}

export function getOptionalEnv(name: string): string | undefined {
  const value = process.env[name]
  if (!value || value.trim().length === 0) return undefined
  return value
}
