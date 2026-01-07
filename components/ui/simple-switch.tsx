import { Switch } from '@headlessui/react'

interface SimpleSwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  srLabel?: string
}

export function SimpleSwitch({ checked, onChange, disabled, srLabel }: SimpleSwitchProps) {
  return (
    <Switch
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={`${
        checked ? 'bg-purple-600' : 'bg-gray-600'
      } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <span className="sr-only">{srLabel || 'Toggle setting'}</span>
      <span
        className={`${
          checked ? 'translate-x-6' : 'translate-x-1'
        } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
      />
    </Switch>
  )
}
