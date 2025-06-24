
import React, { useRef, forwardRef, useImperativeHandle } from 'react'

declare global {
  interface Window {
    hcaptcha: any
  }
}

interface HCaptchaProps {
  siteKey: string
  onVerify: (token: string) => void
  onError?: () => void
  onExpire?: () => void
}

export interface HCaptchaRef {
  execute: () => void
  reset: () => void
}

const HCaptcha = forwardRef<HCaptchaRef, HCaptchaProps>(({ siteKey, onVerify, onError, onExpire }, ref) => {
  const hcaptchaRef = useRef<HTMLDivElement>(null)
  const widgetId = useRef<string | null>(null)

  useImperativeHandle(ref, () => ({
    execute: () => {
      if (widgetId.current && window.hcaptcha) {
        window.hcaptcha.execute(widgetId.current)
      }
    },
    reset: () => {
      if (widgetId.current && window.hcaptcha) {
        window.hcaptcha.reset(widgetId.current)
      }
    }
  }))

  React.useEffect(() => {
    const loadHCaptcha = () => {
      if (window.hcaptcha && hcaptchaRef.current) {
        widgetId.current = window.hcaptcha.render(hcaptchaRef.current, {
          sitekey: siteKey,
          callback: onVerify,
          'error-callback': onError,
          'expired-callback': onExpire,
          size: 'normal',
          theme: 'light'
        })
      }
    }

    if (window.hcaptcha) {
      loadHCaptcha()
    } else {
      const script = document.createElement('script')
      script.src = 'https://js.hcaptcha.com/1/api.js'
      script.async = true
      script.defer = true
      script.onload = loadHCaptcha
      document.head.appendChild(script)
    }

    return () => {
      if (widgetId.current && window.hcaptcha) {
        window.hcaptcha.remove(widgetId.current)
      }
    }
  }, [siteKey, onVerify, onError, onExpire])

  return <div ref={hcaptchaRef} />
})

HCaptcha.displayName = 'HCaptcha'

export default HCaptcha
