import { useState } from 'react'
import { supabase } from './supabase'

type Props = {
  modoInicial: 'criar' | 'entrar'
  onVoltar: () => void
}

export default function Auth({ modoInicial, onVoltar }: Props) {
  const [modo, setModo] = useState(modoInicial)
  const [nome, setNome] = useState('')
  const [utilizador, setUtilizador] = useState('')
  const [telefone, setTelefone] = useState('')
  const [palavra, setPalavra] = useState('')
  const [confirma, setConfirma] = useState('')
  const [termos, setTermos] = useState(false)
  const [erro, setErro] = useState('')
  const [aviso, setAviso] = useState('')
  const [aCarregar, setACarregar] = useState(false)

  const numero = telefone.replace(/\D/g, '')
  const email = numero + '@euetu.app'

  async function enviar() {
    setErro('')
    setAviso('')
    if (numero.length < 9) return setErro('Escreve um número de telefone válido.')
    if (palavra.length < 8) return setErro('A palavra-passe deve ter pelo menos 8 caracteres.')
    if (modo === 'criar') {
      if (nome.trim().length < 3) return setErro('Escreve o teu nome completo.')
      if (utilizador.trim().length < 3) return setErro('Escolhe um nome de utilizador.')
      if (palavra !== confirma) return setErro('As palavras-passe não são iguais.')
      if (!termos) return setErro('Tens de aceitar os termos de utilização.')
    }
    setACarregar(true)
    if (modo === 'criar') {
      const { error } = await supabase.auth.signUp({
        email,
        password: palavra,
        options: {
          data: {
            nome: nome.trim(),
            utilizador: utilizador.trim().toLowerCase(),
            telefone: numero,
          },
        },
      })
      if (error) {
        setErro(
          error.message.includes('already')
            ? 'Este número já tem conta. Toca em Iniciar sessão.'
            : 'Não foi possível criar a conta. Tenta outra vez.'
        )
      } else {
        setAviso('Conta criada com sucesso! Já podes iniciar sessão.')
        setModo('entrar')
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: palavra,
      })
      if (error) setErro('Número ou palavra-passe incorretos.')
      else setAviso('Sessão iniciada com sucesso!')
    }
    setACarregar(false)
  }

  const campo = 'w-full rounded-2xl border border-gray-300 px-4 py-3 text-base'

  return (
    <div className="min-h-screen bg-white px-6 py-8 max-w-md mx-auto">
      <button onClick={onVoltar} className="mb-4 text-roxo font-semibold">
        ← Voltar
      </button>
      <h1 className="text-3xl font-extrabold text-escuro">
        {modo === 'criar' ? 'Criar conta' : 'Iniciar sessão'}
      </h1>

      <div className="mt-6 flex flex-col gap-3">
        {modo === 'criar' && (
          <>
            <input className={campo} placeholder="Nome completo" value={nome} onChange={(e) => setNome(e.target.value)} />
            <input className={campo} placeholder="Nome de utilizador" value={utilizador} onChange={(e) => setUtilizador(e.target.value)} />
          </>
        )}
        <input className={campo} placeholder="Número de telefone" inputMode="tel" value={telefone} onChange={(e) => setTelefone(e.target.value)} />
        <input className={campo} placeholder="Palavra-passe" type="password" value={palavra} onChange={(e) => setPalavra(e.target.value)} />
        {modo === 'criar' && (
          <>
            <input className={campo} placeholder="Confirmar palavra-passe" type="password" value={confirma} onChange={(e) => setConfirma(e.target.value)} />
            <label className="flex items-center gap-2 text-sm text-gray-600">
              <input type="checkbox" checked={termos} onChange={(e) => setTermos(e.target.checked)} />
              Aceito os termos de utilização e a política de privacidade
            </label>
          </>
        )}
      </div>

      {erro && <p className="mt-4 text-red-600 font-medium">{erro}</p>}
      {aviso && <p className="mt-4 text-green-700 font-medium">{aviso}</p>}

      <button
        onClick={enviar}
        disabled={aCarregar}
        className="mt-6 w-full rounded-full bg-gradient-to-r from-roxo to-rosa py-3 text-lg font-semibold text-white shadow-md disabled:opacity-60"
      >
        {aCarregar ? 'Aguarda...' : modo === 'criar' ? 'Criar conta' : 'Entrar'}
      </button>

      <button
        onClick={() => { setErro(''); setAviso(''); setModo(modo === 'criar' ? 'entrar' : 'criar') }}
        className="mt-4 w-full text-roxo font-semibold"
      >
        {modo === 'criar' ? 'Já tenho conta' : 'Ainda não tenho conta'}
      </button>
    </div>
  )
}
