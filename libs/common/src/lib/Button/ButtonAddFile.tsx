import { ButtonProps } from 'antd';
import { Plus } from 'lucide-react';
import { CButton } from './CButton';

export const CButtonAddFile: React.FC<ButtonProps> = ({ ...rest }) => {
  return (
    <CButton icon={<Plus />} {...rest}>
      Thêm mới file
    </CButton>
  );
};
