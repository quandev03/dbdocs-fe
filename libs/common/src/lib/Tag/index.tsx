import React, { FC } from 'react';
import { Tag, TagProps } from 'antd';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  MinusCircleOutlined,
  SyncOutlined,
} from '@ant-design/icons';
import { TypeTagEnum } from '../../constants';

interface Props extends TagProps {
  children?: React.ReactNode;
  type: TypeTagEnum;
}

const IconType = {
  [TypeTagEnum.SUCCESS]: <CheckCircleOutlined />,
  [TypeTagEnum.PROCESSING]: <SyncOutlined />,
  [TypeTagEnum.ERROR]: <CloseCircleOutlined />,
  [TypeTagEnum.WARNING]: <ExclamationCircleOutlined />,
  [TypeTagEnum.WAITING]: <ClockCircleOutlined />,
  [TypeTagEnum.STOP]: <MinusCircleOutlined />,
};

const ColorType = {
  [TypeTagEnum.SUCCESS]: 'success',
  [TypeTagEnum.PROCESSING]: 'processing',
  [TypeTagEnum.ERROR]: 'error',
  [TypeTagEnum.WARNING]: 'warning',
  [TypeTagEnum.WAITING]: 'default',
  [TypeTagEnum.STOP]: 'default',
};
export const CTag: FC<Props> = React.memo(({ children, type, ...rest }) => {
  return (
    <Tag
      bordered={false}
      color={ColorType[type]}
      icon={IconType[type]}
      {...rest}
    >
      {children}
    </Tag>
  );
});
