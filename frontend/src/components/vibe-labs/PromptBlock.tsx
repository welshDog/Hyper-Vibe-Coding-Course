import { useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface Props {
  /** Optional label, e.g. "Paste into Claude" */
  label?: string
  children: string
}

/**
 * A copy-paste prompt. The single most-used action on a lab page, so the
 * copy affordance is explicit and gives unmistakable confirmation feedback.
 */
export function PromptBlock({ label, children }: Props) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(children.trim())
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard blocked — the text is still selectable as a fallback */
    }
  }

  return (
    <div className="relative rounded-hfz-md border border-hfz-border-violet bg-hfz-terminal-black">
      {label && (
        <div className="flex items-center justify-between border-b border-hfz-border-soft px-hfz-4 py-hfz-2">
          <span className="font-mono text-hfz-caption uppercase tracking-hfz-label text-hfz-text-secondary">
            {label}
          </span>
        </div>
      )}
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied to clipboard' : 'Copy prompt'}
        className={[
          'absolute right-hfz-3 top-hfz-3 inline-flex items-center gap-1.5 rounded-hfz-sm px-hfz-3 py-1.5',
          'border border-hfz-border-soft bg-hfz-midnight/80 text-hfz-caption font-semibold',
          'transition-[transform,color,border-color] duration-150 active:scale-[0.97]',
          'outline-none focus-visible:ring-2 focus-visible:ring-hfz-violet-light/70 focus-visible:ring-offset-2 focus-visible:ring-offset-hfz-terminal-black',
          copied
            ? 'border-hfz-mint/40 text-hfz-mint'
            : 'text-hfz-text-secondary hover:text-hfz-cyan hover:border-hfz-border-violet',
        ].join(' ')}
      >
        {copied ? <Check size={13} strokeWidth={3} /> : <Copy size={13} />}
        {copied ? 'Copied' : 'Copy'}
      </button>
      <pre className="overflow-x-auto px-hfz-5 py-hfz-5 pt-hfz-7 font-mono text-hfz-code leading-relaxed text-hfz-cyan/90">
        {children.trim()}
      </pre>
    </div>
  )
}
