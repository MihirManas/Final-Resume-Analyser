"use client";
import React from 'react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/90 text-red-500 p-8 flex-col">
          <h2 className="text-2xl font-bold mb-4">3D Render Error</h2>
          <pre className="bg-red-950 p-4 rounded text-sm w-full max-w-2xl overflow-auto border border-red-500/50">
            {this.state.error?.toString()}
          </pre>
          <p className="mt-4 text-gray-400">Please send a screenshot of this error.</p>
        </div>
      );
    }

    return this.props.children;
  }
}
