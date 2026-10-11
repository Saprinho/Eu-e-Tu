import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

type Perfil = {
  nome: string
  utilizador: string
  biografia: string | null
  localizacao: string | null
  foto_url: string | null
}

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
  const [ficheiro, setFicheiro] = useState<File | null>(null)
  const [previa, setPrevia] = useState('')
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
    if (pr) setNomeEm(pr.nome_alterado_em)
  }

  useEffect(() => {
    carregar()
  }, [])

  function limpar() {
    setMsg('')
    setErro('')
  }

  async function guardarNome() {
    limpar()
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
    limpar()
    setAGuardar(true)
    const { error } = await supabase
      .from('profiles')
      .update({ biografia: bio.trim() || null, localizacao: local.trim() || null })
      .eq('id', session.user.id)
    if (error) setErro('Não foi possível guardar. Tenta outra vez.')
    else setMsg('Perfil guardado!')
    setAGuardar(false)
  }

  function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    limpar()
    const f = e.target.files?.[0]
    if (!f) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      return setErro('Escolhe uma fotografia JPG, PNG ou WEBP.')
    }
    if (f.size > 2 * 1024 * 1024) {
      return setErro('A fotografia é grande demais. O máximo é 2 MB.')
    }
    setFicheiro(f)
    setPrevia(URL.createObjectURL(f))
  }

  async function confirmarFoto() {
    if (!ficheiro) return
    limpar()
    setAGuardar(true)
    const ext = ficheiro.type === 'image/png' ? 'png' : ficheiro.type === 'image/webp' ? 'webp' : 'jpg'
    const caminho = session.user.id + '/' + Date.now() + '.' + ext
    const { error: e1 } = await supabase.storage
      .from('avatares')
      .upload(caminho, ficheiro, { contentType: ficheiro.type })
    if (e1) {
      setErro('Não foi possível enviar a fotografia. Tenta outra vez.')
      setAGuardar(false)
      return
    }
    const { data: url } = supabase.storage.from('avatares').getPublicUrl(caminho)
    const { error: e2 } = await supabase
      .from('profiles')
      .update({ foto_url: url.publicUrl })
      .eq('id', session.user.id)
    if (e2) setErro('Não foi possível guardar a fotografia.')
    else {
      setMsg('Fotografia alterada!')
      setFicheiro(null)
      setPrevia('')
      await carregar()
    }
    setAGuardar(false)
  }

  if (!perfil) return <p className="text-center text-gray-500">A carregar...</p>

  const proximo = nomeEm ? new Date(new Date(nomeEm).getTime() + 15 * 24 * 60 * 60 * 1000) : null
  const bloqueado = proximo ? proximo.getTime() > Date.now() : false
  const campo = 'w-full rounded-2xl border border-gray-300 px-4 py-3 text-base'
  const foto = previa || perfil.foto_url

  return (
    <div className="flex flex-col gap-5">
      <div className="rounded-2xl bg-white p-5 shadow-md text-center">
        {foto ? (
          <img src={foto} alt="Fotografia de perfil" className="mx-auto h-24 w-24 rounded-full object-cover" />
        ) : (
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-roxo to-rosa text-4xl font-bold text-white">
            {perfil.nome.charAt(0).toUpperCase()}
          </div>
        )}
        <h2 className="mt-3 text-xl font-bold text-escuro">{perfil.nome}</h2>
        <p className="text-gray-600">@{perfil.utilizador}</p>

        <label className="mt-4 block rounded-full border-2 border-roxo py-3 font-semibold text-roxo">
          Escolher fotografia
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={escolher} className="hidden" />
        </label>
        {ficheiro && (
          <button
            onClick={confirmarFoto}
            disabled={aGuardar}
            className="mt-3 w-full rounded-full bg-gradient-to-r from-roxo to-rosa py-3 font-semibold text-white disabled:opacity-60"
          >
            Confirmar fotografia
          </button>
        )}
        <p className="mt-2 text-xs text-gray-500">Podes mudar a fotografia quando quiseres.</p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-md">
        <h3 className="font-bold text-escuro">Nome</h3>
        <input className={campo + ' mt-2'} value={novoNome} onChange={(e) => setNovoNome(e.target.value)} />
        <button
          onClick={guardarNome}
          disabled={aGuardar || bloqueado}
          className="mt-3 w-full rounded-full bg-gradient-to-r from-roxo to-rosa py-3 font-semibold text-white disabled:opacity-50"
        >
          Alterar nome
        </button>
        <p className="mt-2 text-sm text-gray-600">Última alteração: {formatar(nomeEm)}</p>
        <p className="text-sm text-gray-600">
          Estado: {bloqueado ? 'bloqueado até ' + formatar(proximo!.toISOString()) : 'disponível para alterar'}
        </p>
      </div>

      <div className="rounded-2xl bg-white p-5 shadow-md">
        <h3 className="font-bold text-escuro">Sobre ti</h3>
        <textarea className={campo + ' mt-2'} rows={3} placeholder="Biografia" value={bio} onChange={(e) => setBio(e.target.value)} />
        <input className={campo + ' mt-2'} placeholder="Localização (opcional)" value={local} onChange={(e) => setLocal(e.target.value)} />
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
