import { Component, type ErrorInfo, type ReactNode } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  }

  public static getDerivedStateFromError(): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Něco se pokazilo</AlertTitle>
          <AlertDescription>
            Omlouváme se, ale došlo k neočekávané chybě. Prosím, obnovte stránku nebo kontaktujte podporu.
          </AlertDescription>
        </Alert>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

