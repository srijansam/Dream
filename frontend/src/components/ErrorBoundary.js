import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
        // You can also log the error to an error reporting service here
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="error-boundary p-4 text-center">
                    <h2 className="text-danger mb-3">Oops! Something went wrong</h2>
                    <p className="mb-3">We're sorry for the inconvenience. Please try refreshing the page.</p>
                    <button
                        className="btn btn-primary"
                        onClick={() => window.location.reload()}
                    >
                        Refresh Page
                    </button>
                    {process.env.NODE_ENV === 'development' && this.state.error && (
                        <div className="mt-4 p-3 bg-light text-start">
                            <h5>Debug Information:</h5>
                            <pre className="text-danger">
                                {this.state.error.toString()}
                            </pre>
                            <pre className="text-muted small">
                                {this.state.errorInfo?.componentStack}
                            </pre>
                        </div>
                    )}
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 