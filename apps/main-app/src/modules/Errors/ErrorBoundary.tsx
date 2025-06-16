import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button, Result, Typography } from 'antd';
import { HomeOutlined, ReloadOutlined } from '@ant-design/icons';
import './ErrorPage.css';

const { Paragraph, Text } = Typography;

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // You can also log the error to an error reporting service
    console.error('Uncaught error:', error, errorInfo);
    this.setState({ errorInfo });
  }

  private handleReload = (): void => {
    window.location.reload();
  };

  private handleGoHome = (): void => {
    window.location.href = '/';
  };

  public render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <Result
            status="error"
            title="Something went wrong"
            subTitle="We're sorry, an unexpected error has occurred."
            extra={[
              <Button
                type="primary"
                key="home"
                icon={<HomeOutlined />}
                onClick={this.handleGoHome}
              >
                Back to Home
              </Button>,
              <Button
                key="reload"
                icon={<ReloadOutlined />}
                onClick={this.handleReload}
              >
                Reload Page
              </Button>,
            ]}
          >
            <div className="error-details">
              {process.env.NODE_ENV === 'development' && (
                <>
                  <Paragraph>
                    <Text strong>Error Details (visible in development mode only):</Text>
                  </Paragraph>
                  <Paragraph>
                    <Text code>{this.state.error?.toString()}</Text>
                  </Paragraph>
                  {this.state.errorInfo && (
                    <Paragraph>
                      <Text code>
                        {this.state.errorInfo.componentStack}
                      </Text>
                    </Paragraph>
                  )}
                </>
              )}
            </div>
          </Result>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 