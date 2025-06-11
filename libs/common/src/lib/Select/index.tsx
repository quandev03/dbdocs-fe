import { Form, Select, SelectProps, Spin } from 'antd';
import React, { FC } from 'react';
import { AnyElement } from '../../types';
import { StyledWrapSelect } from './styles';

interface Props extends SelectProps {
  children?: React.ReactNode;
  maxCount?: number;
  maxRow?: number;
  isLoading?: boolean;
}

const filterSelect = (input: string, option: AnyElement) =>
  (option?.label?.toLowerCase() ?? '').includes(input?.toLowerCase());

export const CSelect: FC<Props> = React.memo(
  ({
    id,
    onBlur,
    children,
    filterOption,
    maxRow,
    isLoading = false,
    options = [],
    allowClear = true,
    showSearch = true,
    ...rest
  }) => {
    const form = Form?.useFormInstance();
    // check field name of form list yes or no
    const field = id?.includes('_')
      ? id?.split('_').map((i) => (isNaN(+i) ? i : +i))
      : id;
    const handleBlur = (e: AnyElement) => {
      if (onBlur) {
        onBlur(e);
      } else {
        form?.validateFields([field]);
      }
    };

    return (
      <StyledWrapSelect $maxRow={maxRow}>
        <Select
          onBlur={handleBlur}
          showSearch={showSearch}
          filterOption={filterOption || filterSelect}
          options={
            isLoading
              ? [{ key: 'spin', value: (<Spin />) as AnyElement }]
              : options
          }
          allowClear={allowClear}
          id={field?.toString()}
          {...rest}
        >
          {children}
        </Select>
      </StyledWrapSelect>
    );
  }
);
