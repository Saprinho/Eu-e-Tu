import { useEffect, useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'
import Auth from './Auth'
import Inicial from './Inicial'
import Principal from './Principal'

export default function App() {
  const [session, setSession] = useState<Session | null>(null)
  const [aCarregar, setACarregar] = useState(true)
  const [ecra, setEcra] = useState<'inicio' | 'criar' | 'entrar'>('inicio')

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setACarregar(false)
    })
    const { data } = supabase.auth.onAuthStateChange((_evento, s) => {
      setSession(s)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  if (aCarregar) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">A carregar...</div>
  }

  if (session) return <Principal session={session} />

  if (ecra !== 'inicio') {
    return <Auth modoInicial={ecra} onVoltar={() => setEcra('inicio')} />
  }

  return <Inicial onCriar={() => setEcra('criar')} onEntrar={() => setEcra('entrar')} />
}
