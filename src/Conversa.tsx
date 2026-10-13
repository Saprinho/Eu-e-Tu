import { useEffect, useRef, useState } from 'react'
import { supabase } from './supabase'

type Msg = {
  id: string
  sender_id: string
  texto: string | null
  criado_em: string
  lida_em: string | null
}

type Props = { meuId: string; outroId: string; outroNome: string; onVoltar: () => void }

function hora(d: string) {
  return new Date(d).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
}

export default function Conversa({ meuId, outroId, outroNome, onVoltar }: Props) {
  const [cid, setCid] = useState<string | null>(null)
  const [msgs, setMsgs] = useState<Msg[]>([])
  const [texto, setTexto] = useState('')
  const [erro, setErro] = useState('')
  const fim = useRef<HTMLDivElement>(null)

  async function abrir() {
    const par =
      'and(user_a.eq.' + meuId + ',user_b.eq.' + outroId + '),' +
      'and(user_a.eq.' + outroId + ',user_b.eq.' + meuId + ')'
    const e = await supabase.from('conversations').select('id').or(par).limit(1)
    if (e.data && e.data.length > 0) {
      setCid(e.data[0].id)
      return
    }
    const n = await supabase
      .from('conversations')
      .insert({ user_a: meuId, user_b: outroId })
      .select('id')
      .single()
    if (n.data) setCid(n.data.id)
    else setErro('Não foi possível abrir a conversa.')
  }

  async function carregar(id: string) {
    const { data } = await supabase
      .from('messages')
      .select('id, sender_id, texto, criado_em, lida_em')
      .eq('conversation_id', id)
      .order('criado_em', { ascending: true })
      .limit(100)
    setMsgs((data as Msg[]) ?? [])
    await supabase
      .from('messages')
      .update({ lida_em: new Date().toISOString() })
      .eq('conversation_id', id)
      .neq('sender_id', meuId)
      .is('lida_em', null)
  }

  useEffect(() => {
    abrir()
  }, [outroId])

  useEffect(() => {
    if (!cid) return
    carregar(cid)
    const canal = supabase
      .channel('conversa-' + cid)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'messages', filter: 'conversation_id=eq.' + cid },
        () => carregar(cid)
      )
      .subscribe()
    return () => {
      supabase.removeChannel(canal)
    }
  }, [cid])

  useEffect(() => {
    fim.current?.scrollIntoView()
  }, [msgs])

  async function enviar() {
    const t = texto.trim()
    if (!t || !cid) return
    setTexto('')
    setErro('')
    const { error } = await supabase
      .from('messages')
      .insert({ conversation_id: cid, sender_id: meuId, texto: t })
    if (error) {
      setErro('Não foi possível enviar. Pode haver um bloqueio.')
      setTexto(t)
    } else {
      carregar(cid)
    }
  }

  return (
    <div className="flex h-[calc(100dvh-11rem)] flex-col">
      <div className="mb-2 flex items-center gap-3">
        <button onClick={onVoltar} className="font-semibold text-roxo">
          ←
        </button>
        <p className="font-bold text-escuro">{outroNome}</p>
      </div>

      <div className="flex-1 overflow-y-auto rounded-2xl bg-white p-3 shadow-md">
        {msgs.length === 0 && <p className="text-center text-sm text-gray-500">Diz olá! 👋</p>}
        {msgs.map((m) => {
          const meu = m.sender_id === meuId
          return (
            <div key={m.id} className={'mb-2 flex ' + (meu ? 'justify-end' : 'justify-start')}>
              <div
                className={
                  'max-w-[80%] rounded-2xl px-3 py-2 ' +
                  (meu ? 'bg-gradient-to-r from-roxo to-rosa text-white' : 'bg-gray-50 text-escuro')
                }
              >
                <p className="whitespace-pre-wrap break-words">{m.texto}</p>
                <p className={'mt-1 text-right text-[10px] ' + (meu ? 'text-white/80' : 'text-gray-500')}>
                  {hora(m.criado_em)}
                  {meu ? (m.lida_em ? ' ✓✓' : ' ✓') : ''}
                </p>
              </div>
            </div>
          )
        })}
        <div ref={fim} />
      </div>

      {erro && <p className="mt-1 text-sm text-red-600">{erro}</p>}
      <div className="mt-2 flex gap-2">
        <input
          className="flex-1 rounded-full border border-gray-300 px-4 py-3 text-base"
          placeholder="Escreve uma mensagem"
          maxLength={2000}
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') enviar()
          }}
        />
        <button onClick={enviar} className="rounded-full bg-roxo px-5 py-3 font-semibold text-white">
          Enviar
        </button>
      </div>
    </div>
  )
}
