import { ButtonProps } from 'antd';
import { Save } from 'lucide-react';
import { CButton } from './CButton';

export const CButtonSave: React.FC<ButtonProps> = ({ children, ...rest }) => {
  return (
    <CButton icon={<Save />} {...rest}>
      {children ?? 'Lưu'}
    </CButton>
  );
};
