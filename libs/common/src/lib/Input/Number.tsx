import { AnyElement } from '../../types';
import { Input, theme } from 'antd';
import { ReactNode, useRef } from 'react';
import { NumericFormat, NumericFormatProps } from 'react-number-format';

const maxNumber = {
  10: 9_999_999_999,
  11: 9_999_999_9999,
};
export interface NumberInputProps extends NumericFormatProps {
  /** Only working with displayType is input */
  addonAfter?: ReactNode;

  /** Property of Form.Item */
  onChange?: (value: AnyElement) => void;

  /** Property of Form.Item */
  maxLength?: keyof typeof maxNumber;

  maxValue?: number;
}

export const NumberInput: React.FC<NumberInputProps> = ({
  addonAfter,
  onChange,
  maxLength = 11,
  maxValue,
  ...rest
}) => {
  const { hashId } = theme.useToken();
  const ref = useRef<HTMLInputElement>(null);

  return (
    <div className="relative">
      <Input hidden />
      <NumericFormat
        allowNegative={false}
        decimalScale={0}
        isAllowed={({ floatValue }) =>
          floatValue ? floatValue <= (maxValue ?? maxNumber[maxLength]) : true
        }
        getInputRef={ref}
        {...rest}
        thousandSeparator="."
        decimalSeparator=","
        onValueChange={({ floatValue }) => onChange && onChange(floatValue)}
        className={
          rest.displayType === 'text'
            ? ''
            : `ant-input ant-input-outlined ${hashId} ${
                rest['aria-invalid'] === 'true' ? 'ant-input-status-error' : ''
              } ${rest.disabled ? '!text-black' : ''} ${
                addonAfter ? 'pr-8' : ''
              }`
        }
      />
      {rest.displayType !== 'text' && (
        <span className="absolute right-1.5 inline-flex h-full items-center text-xs">
          {addonAfter}
        </span>
      )}
    </div>
  );
};
