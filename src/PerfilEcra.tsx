import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import SecaoFoto from './SecaoFoto'
import SecaoSenha from './SecaoSenha'

type Perfil = {
  nome: string
  utilizador: string
  biografia: string | null
  localizacao: string | null
  foto_url: string | null
}

const QUINZE_DIAS = 15 * 24 * 60 * 60 * 1000

function formatar(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleString('pt-PT', { dateStyle: 'long', timeStyle: 'short' })
}

export default function PerfilEcra({ session }: { session: Session }) {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [novoNome, setNovoNome] = useState('')
  const [bio, setBio] = useState('')
  const [local, setLocal] = useState('')
  const [nomeEm, setNomeEm] = useState<string | null>(null)
  const [senhaEm, setSenhaEm] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState('')
  const [aGuardar, setAGuardar] = useState(false)

  async function carregar() {
    const { data: p } = await supabase
      .from('profiles')
      .select('nome, utilizador, biografia, localizacao, foto_url')
      .eq('id', session.user.id)
      .single()
    if (p) {
      setPerfil(p)
      setNovoNome(p.nome)
      setBio(p.biografia ?? '')
      setLocal(p.localizacao ?? '')
    }
    const { data: pr } = await supabase.rpc('meus_prazos')
    if (pr) {
      setNomeEm(pr.nome_alterado_em)
      setSenhaEm(pr.senha_alterada_em)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  async function guardarNome() {
    setMsg('')
    setErro('')
    setAGuardar(true)
    const { data: res, error } = await supabase.rpc('alterar_nome', { p_nome: novoNome })
    if (error || !res) {
      setErro('Não foi possível alterar o nome. Tenta outra vez.')
    } else if (res.ok) {
      setMsg('Nome alterado com sucesso!')
      await carregar()
    } else if (res.erro === 'prazo') {
      setErro('Já alteraste o teu nome recentemente. Poderás alterá-lo novamente em ' + formatar(res.pode_em) + '.')
    } else {
      setErro('O nome deve ter entre 3 e 60 caracteres.')
    }
    setAGuardar(false)
  }

  async function guardarDados() {
    setMsg('')
    setErro('')
    setAGuardar(true)
    const { error } = await supabase
      .from('profiles')
      .update({ biografia: bio.trim() || null, localizacao: local.trim() || null })
      .eq('id', session.user.id)
    if (error) setErro('Não foi possível guardar. Tenta outra vez.')
    else setMsg('Perfil guardado!')
    setAGuardar(false)
  }

  if (!perfil) return <p className="text-center text-gray-500">A carregar...</p>

  const proximo = nomeEm ? new Date(new Date(nomeEm).getTime() + QUINZE_DIAS) : null
  const bloqueado = proximo ? proximo.getTime() > Date.now() : false
  const campo = 'w-full rounded-2xl border border-gray-300 px-4 py-3 text-base mt-2'

  return (
    <div className="flex flex-col gap-5">
      <SecaoFoto
        session={session}
        nome={perfil.nome}
        utilizador={perfil.utilizador}
        fotoUrl={perfil.foto_url}
        onMudou={carregar}
      />

      <div className="rounded-2xl bg-white p-5 shadow-md">
        <h3 className="font-bold text-escuro">Nome</h3>
        <input className={campo} value={novoNome} onChange={(e) => setNovoNome(e.target.value)} />
        <button
          onClick={guardarNome}
          disabled={aGuardar || bloqueado}
          className="mt-3 w-full rounded-full bg-gradient-to-r from-roxo to-rosa py-3 font-semibold text-white disabled:opacity-50"
        >
          Alterar nome
        </button>
        <p className="mt-2 text-sm text-gray-600">Última alteração: {formatar(nomeEm)}</p>
        <p className="text-sm text-gray-600">
          Estado: {bloqueado && proximo ? 'bloqueado até ' + formatar(proximo.toISOString()) : 'disponível para alterar'}
        </p>
      </div>

      <SecaoSenha session={session} senhaEm={senhaEm} onMudou={carregar} />

      <div className="rounded-2xl bg-white p-5 shadow-md">
        <h3 className="font-bold text-escuro">Sobre ti</h3>
        <textarea className={campo} rows={3} placeholder="Biografia" value={bio} onChange={(e) => setBio(e.target.value)} />
        <input className={campo} placeholder="Localização (opcional)" value={local} onChange={(e) => setLocal(e.target.value)} />
        <button
          onClick={guardarDados}
          disabled={aGuardar}
          className="mt-3 w-full rounded-full border-2 border-roxo py-3 font-semibold text-roxo disabled:opacity-60"
        >
          Guardar
        </button>
      </div>

      {erro && <p className="text-red-600 font-medium">{erro}</p>}
      {msg && <p className="text-green-700 font-medium">{msg}</p>}

      <button
        onClick={() => supabase.auth.signOut()}
        className="w-full rounded-full border-2 border-gray-300 py-3 font-semibold text-gray-600"
      >
        Terminar sessão
      </button>
    </div>
  )
}
