import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { Weather } from '../types'

const latest = atom({ plugin: 'token-weather', key: 'latest' } as const, null)

const forecast = (percent: number) => {
  if (percent >= 90) return { icon: '↯', label: 'もうすぐ圧縮', color: 'red' }
  if (percent >= 75) return { icon: '☇', label: '嵐', color: 'magenta' }
  if (percent >= 50) return { icon: '☂', label: '雨', color: 'blue' }
  if (percent >= 25) return { icon: '☁', label: '曇り', color: 'cyan' }
  return { icon: '☀', label: '快晴', color: 'yellow' }
}

const k = (n: number) => `${Math.round(n / 1000)}k`

const refresh = async ($: EngineInterface): Promise<Weather | null> => {
  const { context } = await $.session.usage()
  if (context.tokens === undefined || context.percent === undefined) return null
  const weather: Weather = { tokens: context.tokens, window: context.window, percent: context.percent }
  await update($, latest, () => weather)
  const f = forecast(weather.percent)
  $.ui.status(`${f.icon} ${f.label} ${weather.percent}% (${k(weather.tokens)}/${k(weather.window)})`)
  return weather
}

// 取得できなかったときに、前回の値が状態行と帯に残らないようにする
const clear = async ($: EngineInterface) => {
  $.ui.status(undefined)
  await update($, latest, () => null)
}

export const register: Register = on => {
  on('turn.complete', async ($, e, next) => {
    if (e.agentId !== undefined) return next(e)

    let line = '？ トークン量を取得できませんでした'
    try {
      const w = await refresh($)
      if (w === null) {
        await clear($)
      } else {
        const f = forecast(w.percent)
        line = `${f.icon} ${f.label} ${w.percent}% (${k(w.tokens)} / ${k(w.window)} tokens)`
      }
    } catch {
      await clear($).catch(() => {})
    }

    // 1行は text で返す。VS Code の会話画面は ui.log を描画せず、
    // ターミナルでは ui.log と text の両方を出すと同じ行が二重になる
    const result = await next(e)
    return { ...result, text: line }
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const w = await read($, latest)
    if (e.props.hasSurvey || w === null) return next(e)

    const { Box, Text } = $.ui.resolve(e)
    const f = forecast(w.percent)

    return (
      <Box>
        <Text color={f.color}>
          {f.icon} {f.label} {w.percent}%
        </Text>
        <Text dimColor> ({k(w.tokens)} / {k(w.window)})</Text>
      </Box>
    )
  })
}
