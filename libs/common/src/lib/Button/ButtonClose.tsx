import { ButtonProps } from 'antd';
import { X } from 'lucide-react';
import { CButton } from './CButton';

export const CButtonClose: React.FC<ButtonProps> = ({ children, ...rest }) => {
  return (
    <CButton icon={<X />} type="default" {...rest}>
      {children ?? 'Đóng'}
    </CButton>
  );
};
