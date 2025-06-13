import { Col, Layout, Row } from 'antd';
import { memo, useEffect, useMemo } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import BreadcrumbComponent from '../components/Breadcrumb';
import LeftHeader from '../components/LeftHeader';
import LeftMenu from '../components/LeftMenu';
import useConfigAppStore from '../stores';
import { ActionsTypeEnum } from '../types';
import { HeaderAccount, StyledLayout } from '../styled';
import { protectedRoutes } from '../../../routers/routes';
import { pathRoutes } from '../../../routers/url';
import AuthRedirect from '../../../components/AuthRedirect';

const { Header, Content } = Layout;

const LayoutDashboard = memo(() => {
  const location = useLocation();
  const { isAuthenticated, menuData, urlsActive, setUrlsActive } =
    useConfigAppStore();
  console.log('isAuthenticated', isAuthenticated);

  useEffect(() => {
    if (!menuData.length) return;
    const allUrlsActive: string[] = ['/'];
    menuData.forEach((item) => {
      allUrlsActive.push(item.uri);
      if (item.actions?.includes(ActionsTypeEnum.CREATE)) {
        allUrlsActive.push(item.uri + '/add');
      }
      if (item.actions?.includes(ActionsTypeEnum.UPDATE)) {
        allUrlsActive.push(item.uri + '/edit/:id');
      }
      if (item.actions?.includes(ActionsTypeEnum.READ)) {
        allUrlsActive.push(item.uri + '/view/:id');
      }
    });
    setUrlsActive(allUrlsActive);
  }, [menuData, setUrlsActive]);

  const RenderContent = useMemo(() => {
    const checkUrl = urlsActive.filter((e) => e !== '/');
    const hasAccess = () => {
      if (!checkUrl.length) return false;
      const currentPath = location.pathname;
      return protectedRoutes.some((route) => {
        if (!route.path) return false;
        return checkUrl.some((url) => {
          const dynamicUrlPattern = url.includes(':id')
            ? url.replace(':id', '[^/]+') // Thay thế :id bằng regex cho bất kỳ chuỗi nào không chứa '/'
            : url;
          const regex = new RegExp(`^${dynamicUrlPattern}`);
          return regex.test(currentPath);
        });
      });
    };
    return hasAccess() || pathRoutes.home === location.pathname ? (
      <Outlet />
    ) : (
      <Navigate to={pathRoutes.notFound} replace={true} />
    );
  }, [urlsActive, location]);

  const LayoutContent = () => (
    <StyledLayout>
      <LeftMenu />
      <Layout className="site-layout">
        <Header className="!h-[60px] border-b border-[#E5E7EB] !bg-[#FFF] !p-0">
          <Row justify="space-between" align="middle" className="h-full">
            <Col>
              <LeftHeader />
              <BreadcrumbComponent />
            </Col>
            <Col>
              <HeaderAccount>
                {/* <Notification /> */}
                {/* <Profile /> */}
              </HeaderAccount>
            </Col>
          </Row>
        </Header>
        <Content className="min-h-72 overflow-auto bg-[#f8f8f8] p-6 pt-3">
          {RenderContent}
        </Content>
      </Layout>
    </StyledLayout>
  );

  // Wrap with AuthRedirect to ensure authentication
  return (
    <AuthRedirect
      authenticatedRedirect="/"
      unauthenticatedRedirect="/login"
      requireAuth={true}
    >
      <LayoutContent />
    </AuthRedirect>
  );
});

export default memo(LayoutDashboard);
