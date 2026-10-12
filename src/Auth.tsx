import { useState } from 'react'
import { supabase } from './supabase'
import CampoSenha from './CampoSenha'

type Props = { modoInicial: 'criar' | 'entrar'; onVoltar: () => void }

const campo = 'w-full rounded-2xl border border-gray-300 px-4 py-3 text-base'

export default function Auth({ modoInicial, onVoltar }: Props) {
  const [modo, setModo] = useState(modoInicial)
  const [f, setF] = useState({ nome: '', utilizador: '', telefone: '', palavra: '', confirma: '' })
  const [termos, setTermos] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [aCarregar, setACarregar] = useState(false)
  const mudar = (k: string, v: string) => setF({ ...f, [k]: v })
  const numero = f.telefone.replace(/\D/g, '')
  const email = numero + '@euetu.app'
  const criar = modo === 'criar'

  function validar() {
    if (numero.length < 9) return 'Escreve um número de telefone válido.'
    if (f.palavra.length < 8) return 'A palavra-passe deve ter pelo menos 8 caracteres.'
    if (!criar) return ''
    if (f.nome.trim().length < 3) return 'Escreve o teu nome completo.'
    if (f.utilizador.trim().length < 3) return 'Escolhe um nome de utilizador.'
    if (f.palavra !== f.confirma) return 'As palavras-passe não são iguais.'
    if (!termos) return 'Tens de aceitar os termos de utilização.'
    return ''
  }

  async function enviar() {
    setAviso('')
    const problema = validar()
    setErro(problema)
    if (problema) return
    setACarregar(true)
    if (criar) {
      const { error } = await supabase.auth.signUp({
        email,
        password: f.palavra,
        options: { data: { nome: f.nome.trim(), utilizador: f.utilizador.trim().toLowerCase(), telefone: numero } },
      })
      if (error) setErro(error.message.includes('already') ? 'Este número já tem conta. Toca em Iniciar sessão.' : 'Não foi possível criar a conta. Tenta outra vez.')
      else { setAviso('Conta criada com sucesso! Já podes iniciar sessão.'); setModo('entrar') }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password: f.palavra })
      setErro(error ? 'Número ou palavra-passe incorretos.' : '')
    }
    setACarregar(false)
  }

  return (
    <div className="min-h-screen bg-white px-6 py-8 max-w-md mx-auto">
      <button onClick={onVoltar} className="mb-4 text-roxo font-semibold">← Voltar</button>
      <h1 className="text-3xl font-extrabold text-escuro">{criar ? 'Criar conta' : 'Iniciar sessão'}</h1>
      <div className="mt-6 flex flex-col gap-3">
        {criar && <input className={campo} placeholder="Nome completo" value={f.nome} onChange={(e) => mudar('nome', e.target.value)} />}
        {criar && <input className={campo} placeholder="Nome de utilizador" value={f.utilizador} onChange={(e) => mudar('utilizador', e.target.value)} />}
        <input className={campo} placeholder="Número de telefone" inputMode="tel" value={f.telefone} onChange={(e) => mudar('telefone', e.target.value)} />
        <CampoSenha className={campo} placeholder="Palavra-passe" value={f.palavra} onChange={(v) => mudar('palavra', v)} />
        {criar && <CampoSenha className={campo} placeholder="Confirmar palavra-passe" value={f.confirma} onChange={(v) => mudar('confirma', v)} />}
        {criar && (
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={termos} onChange={(e) => setTermos(e.target.checked)} />
            Aceito os termos de utilização e a política de privacidade
          </label>
        )}
      </div>
      {erro && <p className="mt-4 text-red-600 font-medium">{erro}</p>}
      {aviso && <p className="mt-4 text-green-700 font-medium">{aviso}</p>}
      <button onClick={enviar} disabled={aCarregar} className="mt-6 w-full rounded-full bg-gradient-to-r from-roxo to-rosa py-3 text-lg font-semibold text-white shadow-md disabled:opacity-60">
        {aCarregar ? 'Aguarda...' : criar ? 'Criar conta' : 'Entrar'}
      </button>
      <button onClick={() => { setErro(''); setAviso(''); setModo(criar ? 'entrar' : 'criar') }} className="mt-4 w-full text-roxo font-semibold">
        {criar ? 'Já tenho conta' : 'Ainda não tenho conta'}
      </button>
    </div>
  )
}
