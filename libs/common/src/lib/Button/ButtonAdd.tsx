import { ButtonProps } from 'antd';
import { Search } from 'lucide-react';
import { CButton } from './CButton';

export const CButtonAdd: React.FC<ButtonProps> = ({ ...rest }) => {
  return (
    <CButton icon={<Search />} {...rest}>
      Thêm mới
    </CButton>
  );
};
