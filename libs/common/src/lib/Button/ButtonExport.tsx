import { ButtonProps } from 'antd';
import { Upload } from 'lucide-react';
import { CButton } from './CButton';

export const CButtonExport: React.FC<ButtonProps> = ({ ...rest }) => {
  return (
    <CButton icon={<Upload />} {...rest}>
      Xuất excel
    </CButton>
  );
};
