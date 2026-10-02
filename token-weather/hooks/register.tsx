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
  const next: Weather = { tokens: context.tokens, window: context.window, percent: context.percent }
  await update($, latest, () => next)
  const f = forecast(next.percent)
  $.ui.status(`${f.icon} ${f.label} ${next.percent}% (${Math.round(next.tokens / 1000)}k/${Math.round(next.window / 1000)}k)`)
  return next
}

export const register: Register = on => {
  on('turn.complete', async ($, e, next) => {
    if (e.agentId !== undefined) return next(e)
    const w = await refresh($)
    const f = w === null ? null : forecast(w.percent)
    $.ui.log(
      w === null || f === null
        ? '☁ トークン量を取得できませんでした'
        : `${f.icon} ${f.label} ${w.percent}% (${k(w.tokens)} / ${k(w.window)} tokens)`
    )
    return next(e)
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
