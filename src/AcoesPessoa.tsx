import { useEffect, useState } from 'react'
import { supabase } from './supabase'

type Amizade = { id: string; requester_id: string; addressee_id: string; status: string }
type Props = { meuId: string; outroId: string; onMudou?: () => void }

export default function AcoesPessoa({ meuId, outroId, onMudou }: Props) {
  const [seguindo, setSeguindo] = useState(false)
  const [amizade, setAmizade] = useState<Amizade | null>(null)
  const [bloqueado, setBloqueado] = useState(false)
  const [ocupado, setOcupado] = useState(false)
  const [msg, setMsg] = useState('')

  async function carregar() {
    const par =
      'and(requester_id.eq.' + meuId + ',addressee_id.eq.' + outroId + '),' +
      'and(requester_id.eq.' + outroId + ',addressee_id.eq.' + meuId + ')'
    const s = await supabase.from('follows').select('follower_id').eq('follower_id', meuId).eq('followed_id', outroId)
    const a = await supabase.from('friendships').select('id, requester_id, addressee_id, status').or(par)
    const b = await supabase.from('blocks').select('blocker_id').eq('blocker_id', meuId).eq('blocked_id', outroId)
    setSeguindo((s.data ?? []).length > 0)
    setAmizade(((a.data ?? [])[0] as Amizade) ?? null)
    setBloqueado((b.data ?? []).length > 0)
  }

  useEffect(() => {
    carregar()
  }, [outroId])

  async function fazer(op: () => PromiseLike<{ error: unknown }>) {
    setOcupado(true)
    setMsg('')
    const r = await op()
    if (r.error) setMsg('Não foi possível. Tenta outra vez.')
    await carregar()
    if (onMudou) onMudou()
    setOcupado(false)
  }

  function seguir() {
    fazer(() => supabase.from('follows').insert({ follower_id: meuId, followed_id: outroId }))
  }
  function deixarDeSeguir() {
    fazer(() => supabase.from('follows').delete().eq('follower_id', meuId).eq('followed_id', outroId))
  }
  function pedirAmizade() {
    fazer(() => supabase.from('friendships').insert({ requester_id: meuId, addressee_id: outroId }))
  }
  function aceitar() {
    if (amizade) fazer(() => supabase.from('friendships').update({ status: 'aceite' }).eq('id', amizade.id))
  }
  function removerAmizade() {
    if (amizade) fazer(() => supabase.from('friendships').delete().eq('id', amizade.id))
  }
  function desbloquear() {
    fazer(() => supabase.from('blocks').delete().eq('blocker_id', meuId).eq('blocked_id', outroId))
  }
  function bloquear() {
    if (!window.confirm('Bloquear esta pessoa?')) return
    fazer(async () => {
      const r = await supabase.from('blocks').insert({ blocker_id: meuId, blocked_id: outroId })
      if (!r.error) {
        await supabase.from('follows').delete().eq('follower_id', meuId).eq('followed_id', outroId)
        if (amizade) await supabase.from('friendships').delete().eq('id', amizade.id)
      }
      return r
    })
  }

  const cheio = 'rounded-full bg-gradient-to-r from-roxo to-rosa px-4 py-2 text-sm font-semibold text-white disabled:opacity-60'
  const vazio = 'rounded-full border-2 border-roxo px-4 py-2 text-sm font-semibold text-roxo disabled:opacity-60'

  if (bloqueado) {
    return (
      <div className="mt-3">
        <p className="text-sm text-gray-600">Bloqueaste esta pessoa.</p>
        <button disabled={ocupado} onClick={desbloquear} className={vazio + ' mt-2'}>
          Desbloquear
        </button>
      </div>
    )
  }

  const euPedi = amizade?.requester_id === meuId

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      {seguindo ? (
        <button disabled={ocupado} onClick={deixarDeSeguir} className={vazio}>A seguir ✓</button>
      ) : (
        <button disabled={ocupado} onClick={seguir} className={cheio}>Seguir</button>
      )}
      {!amizade && (
        <button disabled={ocupado} onClick={pedirAmizade} className={vazio}>Adicionar amigo</button>
      )}
      {amizade && amizade.status === 'pendente' && euPedi && (
        <button disabled={ocupado} onClick={removerAmizade} className={vazio}>Pedido enviado · Cancelar</button>
      )}
      {amizade && amizade.status === 'pendente' && !euPedi && (
        <>
          <button disabled={ocupado} onClick={aceitar} className={cheio}>Aceitar</button>
          <button disabled={ocupado} onClick={removerAmizade} className={vazio}>Recusar</button>
        </>
      )}
      {amizade && amizade.status === 'aceite' && (
        <button disabled={ocupado} onClick={removerAmizade} className={vazio}>Amigos ✓ · Remover</button>
      )}
      <button disabled={ocupado} onClick={bloquear} className="px-2 py-2 text-sm font-semibold text-rosa">
        Bloquear
      </button>
      {msg && <p className="w-full text-sm text-red-600">{msg}</p>}
    </div>
  )
}
