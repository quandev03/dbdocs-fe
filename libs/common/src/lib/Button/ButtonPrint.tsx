import { ButtonProps } from 'antd';
import { Printer } from 'lucide-react';
import { CButton } from './CButton';

export const CButtonPrint: React.FC<ButtonProps> = ({ children, ...rest }) => {
  return (
    <CButton icon={<Printer />} {...rest}>
      {children ?? 'In'}
    </CButton>
  );
};
