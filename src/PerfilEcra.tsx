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

const QUINZE_DIAS = 15 * 24 * 60 * 60 * 1000

function formatar(d: string | null | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleString('pt-PT', { dateStyle: 'long', timeStyle: 'short' })
}

async function comprimir(f: File): Promise<Blob> {
  const img = await createImageBitmap(f)
  const max = 800
  const escala = Math.min(1, max / Math.max(img.width, img.height))
  const w = Math.round(img.width * escala)
  const h = Math.round(img.height * escala)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas')
  ctx.drawImage(img, 0, 0, w, h)
  return new Promise((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error('blob'))), 'image/jpeg', 0.8)
  )
}

export default function PerfilEcra({ session }: { session: Session }) {
  const [perfil, setPerfil] = useState<Perfil | null>(null)
  const [novoNome, setNovoNome] = useState('')
  const [bio, setBio] = useState('')
  const [local, setLocal] = useState('')
  const [nomeEm, setNomeEm] = useState<string | null>(null)
  const [senhaEm, setSenhaEm] = useState<string | null>(null)
  const [atual, setAtual] = useState('')
  const [nova, setNova] = useState('')
  const [confirma, setConfirma] = useState('')
  const [ficheiro, setFicheiro] = useState<Blob | null>(null)
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
    if (pr) {
      setNomeEm(pr.nome_alterado_em)
      setSenhaEm(pr.senha_alterada_em)
    }
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

  async function guardarSenha() {
    limpar()
    if (nova.length < 8) return setErro('A nova palavra-passe deve ter pelo menos 8 caracteres.')
    if (nova !== confirma) return setErro('As palavras-passe novas não são iguais.')
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
      await carregar()
      setErro('Não foi possível alterar a palavra-passe. Verifica se já passaram 15 dias desde a última alteração.')
    } else {
      setMsg('Palavra-passe alterada com sucesso!')
      setAtual('')
      setNova('')
      setConfirma('')
      await carregar()
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

  async function escolher(e: React.ChangeEvent<HTMLInputElement>) {
    limpar()
    const f = e.target.files?.[0]
    if (!f) return
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(f.type)) {
      return setErro('Escolhe uma fotografia JPG, PNG ou WEBP.')
    }
    if (f.size > 15 * 1024 * 1024) {
      return setErro('A fotografia é grande demais. O máximo é 15 MB.')
    }
    try {
      const pequena = await comprimir(f)
      setFicheiro(pequena)
      setPrevia(URL.createObjectURL(pequena))
    } catch {
      setErro('Não foi possível pr
