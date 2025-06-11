import React, { FC, ReactNode } from 'react';
import { ModalProps, Spin } from 'antd';
import { StyledModal } from './style';
import { X } from 'lucide-react';
interface Props extends ModalProps {
  children?: ReactNode;
}

export const CModal: FC<Props> = React.memo(
  ({ loading, children, ...rest }) => {
    return (
      <StyledModal centered closeIcon={<X />} maskClosable={false} {...rest}>
        <Spin spinning={!!loading}>{children}</Spin>
      </StyledModal>
    );
  }
);
