import { ButtonProps } from 'antd';
import { Trash2 } from 'lucide-react';
import { CButton } from '.';

export const CButtonDelete: React.FC<ButtonProps> = ({
  children,
  icon = <Trash2 />,
  ...rest
}) => {
  return (
    <CButton
      style={{ backgroundColor: '#ff4d4d', borderColor: '#ff4d4d' }}
      icon={icon}
      {...rest}
    >
      {children ?? 'Xóa'}
    </CButton>
  );
};
