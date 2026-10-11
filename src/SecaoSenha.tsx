import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

const QUINZE_DIAS = 15 * 24 * 60 * 60 * 1000

function formatar(d: string) {
  return new Date(d).toLocaleString('pt-PT', { dateStyle: 'long', timeStyle: 'short' })
}

type Props = {
  session: Session
  senhaEm: string | null
  onMudou: () => void
}

export default function SecaoSenha({ session, senhaEm, onMudou }: Props) {
  const [atual, setAtual] = useState('')
  const [nova, setNova] = useState('')
  const [confirma, setConfirma] = useState('')
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState('')
  const [aGuardar, setAGuardar] = useState(false)

  const proxima = senhaEm ? new Date(new Date(senhaEm).getTime() + QUINZE_DIAS) : null
  const bloqueada = proxima ? proxima.getTime() > Date.now() : false
  const campo = 'w-full rounded-2xl border border-gray-300 px-4 py-3 text-base mt-2'

  async function guardar() {
    setMsg('')
    setErro('')
    if (nova.length < 8) {
      setErro('A nova palavra-passe deve ter pelo menos 8 caracteres.')
      return
    }
    if (nova !== confirma) {
      setErro('As palavras-passe novas não são iguais.')
      return
    }
    setAGuardar(true)
    const { error: e1 } = await supabase.auth.signInWithPassword({
      email: session.user.email ?? '',
      password: atual,
    })
    if (e1) {
      setErro('A palavra-passe atual está incorreta.')
      setAGuardar(false)
      return
    }
    const { error: e2 } = await supabase.auth.updateUser({ password: nova })
    if (e2) {
      setErro('Não foi possível alterar. Verifica se já passaram 15 dias.')
      onMudou()
    } else {
      setMsg('Palavra-passe alterada com sucesso!')
      setAtual('')
      setNova('')
      setConfirma('')
      onMudou()
    }
    setAGuardar(false)
  }

  return (
    <div className="rounded-2xl bg-white p-5 shadow-md">
      <h3 className="font-bold text-escuro">Palavra-passe</h3>
      <input
        className={campo}
        type="password"
        placeholder="Palavra-passe atual"
        value={atual}
        onChange={(e) => setAtual(e.target.value)}
      />
      <input
        className={campo}
        type="password"
        placeholder="Nova palavra-passe"
        value={nova}
        onChange={(e) => setNova(e.target.value)}
      />
      <input
        className={campo}
        type="password"
        placeholder="Confirmar nova palavra-passe"
        value={confirma}
        onChange={(e) => setConfirma(e.target.value)}
      />
      <button
        onClick={guardar}
        disabled={aGuardar || bloqueada}
        className="mt-3 w-full rounded-full bg-gradient-to-r from-roxo to-rosa py-3 font-semibold text-white disabled:opacity-50"
      >
        Alterar palavra-passe
      </button>
      <p className="mt-2 text-sm text-gray-600">
        Última alteração: {senhaEm ? formatar(senhaEm) : '—'}
      </p>
      <p className="text-sm text-gray-600">
        Estado: {bloqueada && proxima ? 'bloqueada até ' + formatar(proxima.toISOString()) : 'disponível para alterar'}
      </p>
      {erro && <p className="mt-2 text-red-600 font-medium">{erro}</p>}
      {msg && <p className="mt-2 text-green-700 font-medium">{msg}</p>}
    </div>
  )
}
