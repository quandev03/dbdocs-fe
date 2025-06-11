import React, { FC } from 'react';
import { Upload, UploadProps } from 'antd';
import { StyledWrapUpload } from './styles';

interface Props extends UploadProps {
  children?: React.ReactNode;
}

export const CUpload: FC<Props> = React.memo(({ children, ...rest }) => {
  return (
    <StyledWrapUpload>
      <Upload {...rest}>{children}</Upload>
    </StyledWrapUpload>
  );
});
