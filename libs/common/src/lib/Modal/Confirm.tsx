import { CButton } from '../Button';
import { themeConfig } from '../../constants';
import { ConfigProvider, Flex, Modal } from 'antd';
import { ReactElement } from 'react';

interface ModalConfirmProps {
  title?: string;
  message?: string | ReactElement;
  handleConfirm: () => void;
  handleCancel?: () => void;
  closable?: boolean;
  iconType?: 'warning' | 'success';
  isDestroyAll?: boolean;
  subtext?: string;
}

export const ModalConfirm = (props: ModalConfirmProps) => {
  const {
    title = 'Xác nhận',
    message,
    handleConfirm,
    handleCancel,
    closable = true,
    subtext,
  } = props;

  const onConfirm = () => {
    handleConfirm();
    modalConfirm.destroy();
  };

  const onCancel = () => {
    modalConfirm.destroy();
    handleCancel?.();
  };

  const modalConfirm = Modal.confirm({
    ...props,
    title: (
      <div className="mt-4 text-center text-lg font-semibold">{title}</div>
    ),
    icon: null,
    footer: null,
    closable: closable,
    centered: true,
    content: (
      <ConfigProvider
        theme={{
          token: {
            fontFamily: 'Inter',
            colorPrimary: themeConfig.secondary,
          },
        }}
      >
        {message && (
          <div className="mb-5 text-center text-base font-medium">
            <p>{message}</p>
            <p className="mt-1 text-center text-base font-medium text-red-600">
              {subtext}
            </p>
          </div>
        )}
        <Flex align="center" justify="center" gap={12} className="mb-5">
          <CButton type="default" onClick={onCancel} className="min-w-[120px]">
            Không
          </CButton>
          <CButton onClick={onConfirm} className="min-w-[120px]">
            Có
          </CButton>
        </Flex>
      </ConfigProvider>
    ),
  });
  return modalConfirm;
};
