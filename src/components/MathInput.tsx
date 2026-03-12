import {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
} from 'react'

// MathQuill은 CDN(index.html)으로 로드됨
declare global {
  interface Window {
    MathQuill: {
      getInterface: (version: number) => MQInterface
    }
  }
}

interface MQInterface {
  MathField: (
    el: Element,
    config?: Record<string, unknown>,
  ) => MQField
}

interface MQField {
  latex: (val?: string) => string
  write: (latex: string) => void
  cmd: (cmd: string) => void
  focus: () => void
}

export interface MathInputHandle {
  insertLatex: (latex: string) => void
  cmd: (cmd: string) => void
  focus: () => void
  getLatex: () => string
}

interface Props {
  latex: string
  onChange: (latex: string) => void
  onFocus?: () => void
  placeholder?: string
}

const MathInput = forwardRef<MathInputHandle, Props>(
  ({ latex, onChange, onFocus }, ref) => {
    const spanRef = useRef<HTMLSpanElement>(null)
    const mqRef = useRef<MQField | null>(null)
    const suppressRef = useRef(false)

    useImperativeHandle(ref, () => ({
      insertLatex(val: string) {
        mqRef.current?.write(val)
        mqRef.current?.focus()
      },
      cmd(val: string) {
        mqRef.current?.cmd(val)
        mqRef.current?.focus()
      },
      focus() {
        mqRef.current?.focus()
      },
      getLatex() {
        return mqRef.current?.latex() ?? ''
      },
    }))

    useEffect(() => {
      if (!spanRef.current) return
      if (!window.MathQuill) {
        console.warn('MathQuill이 로드되지 않았습니다. CDN을 확인하세요.')
        return
      }

      const MQ = window.MathQuill.getInterface(2)
      const field = MQ.MathField(spanRef.current, {
        spaceBehavesLikeTab: true,
        handlers: {
          edit: () => {
            if (!suppressRef.current) {
              onChange(field.latex())
            }
          },
        },
      })
      mqRef.current = field

      if (latex) {
        suppressRef.current = true
        field.latex(latex)
        suppressRef.current = false
      }

      if (onFocus) {
        const el = spanRef.current
        const handler = () => onFocus()
        el.addEventListener('focusin', handler)
        return () => el.removeEventListener('focusin', handler)
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    useEffect(() => {
      if (!mqRef.current) return
      const current = mqRef.current.latex()
      if (current !== latex) {
        suppressRef.current = true
        mqRef.current.latex(latex)
        suppressRef.current = false
      }
    }, [latex])

    return (
      <span
        ref={spanRef}
        className="mq-editable-field-wrapper block w-full cursor-text"
        style={{ display: 'block' }}
      />
    )
  },
)

MathInput.displayName = 'MathInput'
export default MathInput
