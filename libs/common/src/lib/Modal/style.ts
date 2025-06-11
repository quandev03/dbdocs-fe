import { Modal } from 'antd';
import styled from 'styled-components';

export const StyledModal = styled(Modal)`
  .ant-modal-content {
    padding: 0px !important;
    .ant-modal-header {
      padding: 16px 30px;
      margin-bottom: 0px !important;
      background: ${({ theme }) => theme.primary};
      .ant-modal-title {
        color: #fff;
      }
    }
    .ant-modal-body {
      padding: 32px;
    }
    .ant-modal-footer {
      padding: 1rem;
      padding-top: 0;
      text-align: center;
      display: flex;
      justify-content: center;
    }
  }
  &.modal-body-shorten .ant-modal-body {
    padding: 32px 32px 16px;
  }
`;
