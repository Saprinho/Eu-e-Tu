import { useState } from 'react'
import type { Session } from '@supabase/supabase-js'
import Publicar from './Publicar'
import PublicarVideo from './PublicarVideo'

type Props = {
  session: Session
  onPublicado: () => void
  onVideoPublicado: () => void
}

export default function PublicarEcra({ session, onPublicado, onVideoPublicado }: Props) {
  const [tipo, setTipo] = useState<'foto' | 'video'>('foto')
  const base = 'flex-1 rounded-full py-2 text-sm font-semibold '
  const ativo = 'bg-gradient-to-r from-roxo to-rosa text-white'
  const inativo = 'border-2 border-roxo text-roxo'

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-3">
        <button onClick={() => setTipo('foto')} className={base + (tipo === 'foto' ? ativo : inativo)}>
          Texto ou foto
        </button>
        <button onClick={() => setTipo('video')} className={base + (tipo === 'video' ? ativo : inativo)}>
          Vídeo
        </button>
      </div>
      {tipo === 'foto' ? (
        <Publicar session={session} onPublicado={onPublicado} />
      ) : (
        <PublicarVideo session={session} onPublicado={onVideoPublicado} />
      )}
    </div>
  )
}
