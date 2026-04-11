// src/components/ErrorBoundary.tsx
// React class component — Error Boundaries MUST be class-based (React limitation).
// Catches any render/lifecycle crash in the subtree and shows a friendly UI
// instead of a blank white screen.
//
// Usage — wrap your whole app:
//   <ErrorBoundary><App /></ErrorBoundary>
//
// Usage — wrap a single risky section:
//   <ErrorBoundary fallback={<p>Section unavailable</p>}><RiskyComponent /></ErrorBoundary>

import { Component, ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorId: string | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null, errorId: null }
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = Math.random().toString(36).slice(2, 8).toUpperCase()
    return { hasError: true, error, errorId }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary] Uncaught render error:', {
      message: error.message,
      stack: error.stack,
      componentStack: info.componentStack,
      errorId: this.state.errorId,
      timestamp: new Date().toISOString(),
    })
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, errorId: null })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback

      return (
        <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-gray-900 border border-red-500/30 rounded-2xl p-8 text-center shadow-2xl">
            <div className="text-5xl mb-4">⚡</div>
            <h1 className="text-2xl font-bold text-white mb-2">Something glitched</h1>
            <p className="text-gray-400 mb-6 text-sm leading-relaxed">
              The app hit an unexpected error. Your progress is safe —
              this is a display issue, not a data issue.
            </p>
            {this.state.errorId && (
              <p className="text-xs text-gray-600 mb-6 font-mono">
                Error ref: <span className="text-gray-400">{this.state.errorId}</span>
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Try again
              </button>
              <button
                onClick={() => { window.location.href = '/' }}
                className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                Go home
              </button>
            </div>
            {import.meta.env.DEV && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-400">
                  Dev details
                </summary>
                <pre className="mt-2 text-xs text-red-400 bg-gray-950 rounded-lg p-3 overflow-auto max-h-40 whitespace-pre-wrap break-all">
                  {this.state.error.message}{'\n\n'}{this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
