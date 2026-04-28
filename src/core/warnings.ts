const warnedMessages = new Set<string>()

const nodeEnv =
  typeof globalThis !== "undefined"
    ? (globalThis as { process?: { env?: { NODE_ENV?: string } } }).process?.env?.NODE_ENV
    : undefined

const isDev = nodeEnv !== "production"

export function warnOnce(message: string): void {
  if (!isDev || warnedMessages.has(message)) {
    return
  }

  warnedMessages.add(message)
  // eslint-disable-next-line no-console
  console.warn(`[endnotes] ${message}`)
}

export function resetWarningsForTests(): void {
  warnedMessages.clear()
}
