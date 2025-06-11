import { Tooltip } from 'antd';
import Search, { SearchProps } from 'antd/es/input/Search';
import React, { ChangeEvent, ClipboardEvent, FocusEvent } from 'react';
import { AnyElement } from '../../types';
import { CButton } from '../Button';
import { CInput } from '../Input';
import { StyledSearch } from '../Template';

interface Props extends SearchProps {
  onSearch: (value: string) => void;
  loading?: boolean;
  disabled?: boolean;
  value?: string;
  setValue?: React.Dispatch<React.SetStateAction<string>>;
  tooltip?: string;
  textSearch?: string;
}

export const CustomSearch = (props: Props) => {
  const { onSearch, loading, disabled, value, setValue, tooltip, ...rest } =
    props;

  const onBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (setValue) setValue(e.target.value.trim());
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (setValue) setValue((e.target as HTMLInputElement).value);
  };

  const onPates = async (e: ClipboardEvent<HTMLInputElement>) => {
    setTimeout(() => {
      if (setValue) setValue((e.target as HTMLInputElement).value.trim());
    }, 0);
  };

  const handleKeyPress = (event: AnyElement) => {
    if (event.key === 'Enter') {
      if (value) onSearch(value.trim());
    }
  };

  return (
    <>
      <Tooltip
        title={tooltip || 'Tìm kiếm'}
        placement="right"
        overlayClassName="quickSearchOverlay"
      >
        <CInput
          maxLength={100}
          placeholder={tooltip || 'Tìm kiếm'}
          prefix={<Search />}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onPaste={onPates}
          onPressEnter={handleKeyPress}
          className="w-60"
          {...rest}
        />
      </Tooltip>
      <CButton
        loading={loading}
        disabled={disabled}
        icon={<Search />}
        onClick={() => {
          if (value) onSearch(value.trim());
        }}
        htmlType="submit"
      >
        Tìm kiếm
      </CButton>
    </>
  );
};

export const ButtonSearch = (props: Props) => {
  const { onSearch, loading, disabled, value, setValue, tooltip, ...rest } =
    props;

  const onBlur = (e: FocusEvent<HTMLInputElement>) => {
    if (setValue) setValue(e.target.value.trim());
  };

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (setValue) setValue((e.target as HTMLInputElement).value);
  };

  const onPates = async (e: ClipboardEvent<HTMLInputElement>) => {
    setTimeout(() => {
      if (setValue) setValue((e.target as HTMLInputElement).value.trim());
    }, 0);
  };

  return (
    <Tooltip
      title={tooltip || 'Tìm kiếm'}
      placement="right"
      overlayClassName="quickSearchOverlay"
    >
      <StyledSearch
        onSearch={onSearch}
        onBlur={onBlur}
        value={value}
        onChange={onChange}
        loading={loading}
        disabled={disabled}
        onPaste={onPates}
        enterButton="Tìm kiếm"
        placeholder={tooltip || 'Tìm kiếm'}
        {...rest}
        prefix={<Search />}
      />
    </Tooltip>
  );
};
