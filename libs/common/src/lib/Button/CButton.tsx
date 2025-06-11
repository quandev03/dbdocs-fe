import { ButtonProps } from 'antd';
import { FC, memo } from 'react';
import { StyledButton } from './styles';

export const CButton: FC<ButtonProps> = memo(({ ...rest }) => {
  return <StyledButton type="primary" {...rest} />;
});
