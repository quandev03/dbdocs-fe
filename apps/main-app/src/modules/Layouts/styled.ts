import { BellOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { Avatar, Button, Layout, Menu, Modal } from 'antd';

export const StyledItemNotify = styled.div`
  position: relative;
  cursor: pointer;
  transition: all 0.25s linear;
  .title {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin: 0 0 3px;
    padding: 5px 15px 0;

    .time {
      font-size: 12px;
      color: ${({ theme }) => theme.primary};
    }
  }

  .desc {
    padding: 0 15px 5px;
  }

  &:hover {
    background-color: #eee;
  }
`;

export const IconNoti = styled(BellOutlined)`
  color: ${({ theme }) => theme.primary};
  font-size: 20px;
  margin-right: 5px;
  cursor: pointer;
`;
export const StyledBtnViewAllNotify = styled(Button)`
  width: 100%;
`;
export const StyledNoNotify = styled.div`
  text-align: center;
  padding: 30px 0;
  min-height: 30px;
  color: ${({ theme }) => theme.contentPlaceholder} !important;
`;
export const StyledWrapListNotify = styled.div`
  max-height: calc(100vh - 180px);
`;

export const StyledTitleNoti = styled.p`
  /* background-color: ${({ theme }) => theme.primary}; */
  color: ${({ theme }) => theme.menuDefault};
  margin: 0;
  padding: 5px 12px 5px 15px;
  font-size: 16px;
  border-radius: 5px 5px 0 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const StyledLayout = styled(Layout)`
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  min-width: 80rem;
  min-height: 36rem;
  .site-layout {
    background: ${({ theme }) => theme.buttonWhite};
  }

  .logo {
    padding: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .breadcrumb {
    margin: 12px 24px 0 24px;
  }

  .trigger {
    margin-left: 20px;
    font-size: 20px;
  }
  .ant-layout-sider {
    max-width: 20rem !important;
    flex: 0 0 16.25rem !important;
  }

  .ant-layout-sider-collapsed {
    flex: 0 0 5rem !important;
  }
`;

export const HeaderAccount = styled.div`
  display: flex;
  padding-right: 26px;
  justify-content: center;
  align-items: center;
  gap: 20px;
  padding-top: 0.2rem;

  svg {
    color: ${({ theme }) => theme.primary};
  }

  .helperWrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.25s linear;
    height: 100%;

    &:hover {
      opacity: 0.7;
    }

    span {
      line-height: 25px;
      top: 0;
      color: ${({ theme }) => theme.menuDisableDark};
    }
  }
`;
export const AvatarBox = styled(Avatar)`
  background-color: ${({ theme }) => theme.primary};
  cursor: pointer;
`;

export const ContentStyled = styled.div`
  display: flex;
  flex-direction: column;

  .ant-typography {
    cursor: pointer;
    color: ${({ theme }) => theme.contentPlaceholder};
    transition: all 0.25s linear;

    &:hover {
      color: ${({ theme }) => theme.primary};
    }
  }
`;

export const ModalAntd = styled(Modal)`
  .ant-form-item {
    display: flex;
    flex-direction: column;
    margin-bottom: 20px;
  }

  .btnWrap {
    text-align: center;
    .ant-btn {
      min-width: 120px;
      margin: 20px 15px 0;
    }
  }
`;
export const TitleOtp = styled.div`
  text-align: center;
  font-weight: 600;
  font-size: 18px;
  margin-bottom: 25px;
  color: #4a4b4f;
`;

export const StyledMenu = styled(Menu)`
  &.ant-menu-light {
    background: ${({ theme }) => theme.backGroundWhite} !important;
  }
  .ant-menu-item-selected {
    font-weight: 600;
    background: #076ab3b5 !important;
    color: ${({ theme }) => theme.menuColor} !important;
    .ant-menu-title-content {
      font-weight: 600;
    }
  }
  .ant-menu-item,
  .ant-menu-submenu-title {
    color: ${({ theme }) => theme.menuDefault};
    .ant-menu-submenu-arrow {
      inset-inline-end: 12px !important;
    }
  }

  .ant-menu-title-content {
    font-size: 0.875rem;
    font-weight: 500;
  }
  &:where(.css-dev-only-do-not-override-q1ej4k).ant-menu-light:not(
      .ant-menu-horizontal
    )
    .ant-menu-item:not(.ant-menu-item-selected):hover,
  &:where(.css-dev-only-do-not-override-q1ej4k).ant-menu-light
    > .ant-menu:not(.ant-menu-horizontal)
    .ant-menu-item:not(.ant-menu-item-selected):hover {
    background-color: ${({ theme }) => theme.menuBackground} !important;
  }
  &.ant-menu {
    > .ant-menu-submenu-selected {
      > .ant-menu-submenu-title {
        color: ${({ theme }) => theme.menuColor};
        background: ${({ theme }) => theme.primary} !important;
        svg {
          path {
            fill: ${({ theme }) => theme.menuColor};
          }
        }
      }
      > .ant-menu-sub {
        .ant-menu-submenu-selected {
          .ant-menu-submenu-title {
            color: #ffffff !important;
            background: ${({ theme }) => theme.primaryHover} !important;
            svg {
              path {
                fill: #ffffff !important;
              }
            }
          }
        }
      }
    }
  }
  .ant-menu-title-content {
    font-size: 14px;
  }
`;
export const StyledSider = styled(Layout.Sider)`
  min-height: 100vh;

  .wrapMenu {
    height: calc(100% - 100px) !important;
    overflow: auto !important;
  }
`;

export const IconMenu = styled.div`
  cursor: pointer;
  position: absolute;
  left: -13px;
  bottom: 0px;
`;

export const IconCollapsed = styled.div`
  height: 26px;
  width: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.primary};
  border-radius: 50%;
  box-shadow: rgba(0, 0, 0, 0.05);
`;

export const WrapperChangeLanguage = styled.div`
  display: flex;
  justify-content: center;
  position: absolute;
  width: 100%;
  bottom: 0;
  padding: 26px 24px;

  .ant-select-arrow {
    inset-inline-end: 50px;
  }
`;
export const WrapperFlagLanguage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  padding: 9px 7px;
  border-radius: 8px;
  background-color: ${({ theme }) => theme.primary};
`;
export const IconFlag = styled.div`
  display: flex;
  align-items: center;
`;

export const FallbackSpin = styled.div`
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
`;
