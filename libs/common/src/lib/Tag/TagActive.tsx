import { StatusEnum, TypeTagEnum } from '@/constants/enum';
import { TagProps } from 'antd';
import React, { FC } from 'react';
import CTag from '.';
import CTooltip from '../Tooltip';

interface Props extends TagProps {
  value: number;
}

const CTagActive: FC<Props> = React.memo(({ value, ...rest }) => {
  return (
    <CTooltip title={value ? 'Hoạt động' : 'Không hoạt động'}>
      <CTag
        {...rest}
        type={
          value === StatusEnum.ACTIVE ? TypeTagEnum.SUCCESS : TypeTagEnum.ERROR
        }
      >
        {value ? 'Hoạt động' : 'Không hoạt động'}
      </CTag>
    </CTooltip>
  );
});

export default CTagActive;
