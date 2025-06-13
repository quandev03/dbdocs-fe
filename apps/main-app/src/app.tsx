import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from 'styled-components';
import { ConfigProvider, Spin } from 'antd';
import { RouterProvider } from 'react-router-dom';
import { themeConfig } from '@vissoft-react/common';
import { routers } from './routers';
import { AuthProvider } from './contexts/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
      staleTime: 0,
      notifyOnChangeProps: 'all',
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={themeConfig}>
        <ConfigProvider
          theme={{
            token: {
              fontFamily: 'Inter',
              colorPrimary: themeConfig.primary,
              controlHeight: 36,
            },
            components: {
              Form: {
                itemMarginBottom: 10,
              },
              Input: {
                colorTextDisabled: 'black',
              },
              Select: {
                colorTextDisabled: 'black',
              },
              DatePicker: {
                colorTextDisabled: 'black',
              },
            },
          }}
        >
          <AuthProvider>
            <RouterProvider
              fallbackElement={
                <div className="flex h-screen items-center justify-center">
                  <Spin spinning={true} />
                </div>
              }
              future={{
                v7_startTransition: false,
              }}
              router={routers}
            />
          </AuthProvider>
        </ConfigProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
