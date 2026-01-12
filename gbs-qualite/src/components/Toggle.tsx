'use client'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}

export default function Toggle({ checked, onChange, disabled = false }: ToggleProps) {
  return (
    <button
      type="button"
      onClick={() => !disabled && onChange(!checked)}
      className={`toggle ${checked ? 'active' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled}
    />
  )
}
