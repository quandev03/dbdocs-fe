import { ButtonProps } from 'antd';
import { Info } from 'lucide-react';
import { CButton } from './CButton';

export const CButtonDetail: React.FC<ButtonProps> = ({ ...rest }) => {
  return (
    <CButton type="default" icon={<Info />} {...rest}>
      Chi tiết
    </CButton>
  );
};
