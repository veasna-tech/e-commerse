import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger m-3">
          <h4>Something went wrong</h4>
          <p>Please try refreshing the page</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 