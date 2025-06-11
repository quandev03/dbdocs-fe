import { StyledInput } from './styles';
import { InputProps } from 'antd';
import { Eye } from 'lucide-react';

interface ViewInputProps extends InputProps {
  onView?: () => void;
}

export const ViewInput: React.FC<ViewInputProps> = ({ onView, ...rest }) => {
  return (
    <StyledInput
      {...rest}
      disabled
      suffix={<Eye className="cursor-pointer text-black" onClick={onView} />}
    />
  );
};
