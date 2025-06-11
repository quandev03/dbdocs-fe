import { ButtonProps } from 'antd';
import { Ban } from 'lucide-react';
import { CButton } from './CButton';

export const CButtonRefuse: React.FC<ButtonProps> = ({ ...rest }) => {
  return (
    <CButton
      style={{ backgroundColor: '#ff4d4d', borderColor: '#ff4d4d' }}
      icon={<Ban />}
      {...rest}
    >
      Từ chối
    </CButton>
  );
};
