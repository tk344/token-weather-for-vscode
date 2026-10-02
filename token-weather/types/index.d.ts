export type Weather = { tokens: number; window: number; percent: number }

declare module 'claude-code' {
  interface PluginState {
    'token-weather': { latest: Weather | null }
  }
}
