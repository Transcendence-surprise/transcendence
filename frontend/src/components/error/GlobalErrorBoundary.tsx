import { Component, type ErrorInfo, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import ServerErrorPage from "../../pages/error/500";

type ErrorBoundaryProps = {
  children: ReactNode;
  resetKey: string;
};

type ErrorBoundaryState = {
  hasError: boolean;
};

class ErrorBoundaryImpl extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("Unhandled React error", error, errorInfo);
  }

  componentDidUpdate(prevProps: Readonly<ErrorBoundaryProps>): void {
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return <ServerErrorPage />;
    }

    return this.props.children;
  }
}

export default function GlobalErrorBoundary({
  children,
}: {
  children: ReactNode;
}) {
  const location = useLocation();

  return (
    <ErrorBoundaryImpl resetKey={location.pathname}>
      {children}
    </ErrorBoundaryImpl>
  );
}
