import { DatePicker, DatePickerProps, Form } from 'antd';
import { RangePickerProps } from 'antd/es/date-picker/generatePicker/interface';
import React, { FC, FocusEvent } from 'react';
import { Dayjs } from 'dayjs';
import { formatDate } from '../../constants/date';

const { RangePicker } = DatePicker;

export const CDatePicker: FC<
  DatePickerProps & { monthCellRenderVN?: boolean }
> = React.memo(({ monthCellRenderVN, ...rest }) => {
  const customMonthCellRender = (date: Dayjs) => {
    const months = [
      'Thg 1',
      'Thg 2',
      'Thg 3',
      'Thg 4',
      'Thg 5',
      'Thg 6',
      'Thg 7',
      'Thg 8',
      'Thg 9',
      'Thg 10',
      'Thg 11',
      'Thg 12',
    ];
    const isSelected = date.isSame(rest.value, 'month');
    const cellStyle: React.CSSProperties = isSelected
      ? {
          backgroundColor: '#005aaa',
          color: 'rgb(255, 255, 255)',
          padding: '0px 8px',
          width: '67.5px',
          position: 'relative',
          zIndex: 2,
          display: 'inline-block',
          minWidth: '27px',
          height: '27px',
          lineHeight: '27px',
          borderRadius: '4px',
          transition: 'background 0.2s',
        }
      : {
          color: '#000',
        };
    return <div style={cellStyle}>{months[date.month()]}</div>;
  };
  return (
    <DatePicker
      needConfirm={false}
      monthCellRender={monthCellRenderVN ? customMonthCellRender : undefined}
      format={[formatDate]}
      {...rest}
    />
  );
});

export const CRangePicker: FC<RangePickerProps> = React.memo(
  ({ id, children, onBlur, ...rest }) => {
    const form = Form.useFormInstance();
    const field = id as string;
    const handleBlur = (
      e: FocusEvent<HTMLElement>,
      info: {
        range?: 'start' | 'end';
      }
    ) => {
      if (form) form?.validateFields([field]);
      if (onBlur) onBlur(e, info);
    };
    return (
      <RangePicker onBlur={handleBlur} format={formatDate} {...rest}>
        {children}
      </RangePicker>
    );
  }
);
