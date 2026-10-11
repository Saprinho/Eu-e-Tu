import { useState } from 'react'

type Props = {
  placeholder: string
  value: string
  onChange: (v: string) => void
  className?: string
}

export default function CampoSenha({ placeholder, value, onChange, className }: Props) {
  const [ver, setVer] = useState(false)

  return (
    <div className="relative">
      <input
        className={(className ?? '') + ' pr-20'}
        type={ver ? 'text' : 'password'}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <button
        type="button"
        onClick={() => setVer(!ver)}
        className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-roxo"
      >
        {ver ? 'Ocultar' : 'Ver'}
      </button>
    </div>
  )
}
