import { formatDateBe } from '../../constants/date';
import { AnyElement } from '../../types';
import { decodeSearchParams } from '../../utils';
import {
  Button,
  Checkbox,
  CheckboxProps,
  Divider,
  Form,
  Popover,
  Space,
} from 'antd';
import dayjs from 'dayjs';
import { Fragment, memo, ReactElement, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import { CButton } from '../Button';
import { CCheckbox } from '../Checkbox';
import { WrapperButton } from '../Template';
import { ChevronDown, Funnel, RotateCcw, Search } from 'lucide-react';

export interface ItemFilter {
  label: string;
  value: React.ReactNode;
  key?: string;
  showDefault?: boolean;
  disabled?: boolean;
}

interface Props {
  items: ItemFilter[];
  searchComponent?: React.ReactNode;
  validQuery?: string;
  onRefresh?: () => void;
}

const CFilter = memo((props: Props) => {
  const { items, onRefresh } = props;
  const { pathname } = useLocation();
  const [searchParams, setSearchParams] = useSearchParams();
  const params = decodeSearchParams(searchParams);
  const plainOptions = items?.map((_, index) => index);
  const getFilters = searchParams.get('filters');
  const filters = getFilters ? getFilters?.split(',') : [];
  const isCheckAll = items.length === filters.length;
  const indeterminate = filters.length > 0 && filters.length < items.length;
  const form = Form.useFormInstance();
  const defaultFilter = items
    .map((item, index) => (item.showDefault ? index : -1))
    .filter((index) => index !== -1)
    .join(',');

  const handleUncheckedField = (
    values: string[],
    currentParams: AnyElement
  ) => {
    let [unCheckedKeys, unCheckedName]: [string[], string | undefined] = [
      [],
      undefined,
    ];
    unCheckedKeys = filters.filter((e) => !values?.includes(e));
    if (!unCheckedKeys.length) return;
    unCheckedKeys.forEach((unCheckedKey: string) => {
      const itemValue = items[+unCheckedKey].value as ReactElement;
      unCheckedName = (itemValue?.props as { name?: string })?.name;
      if (unCheckedName) {
        delete currentParams[unCheckedName];
        form.resetFields([unCheckedName]);
      }
    });
  };

  const setFilters = (values: AnyElement) => {
    const currentParams = { ...params, filters: values.join(',') };
    if (filters.length > values?.length) {
      handleUncheckedField(values, currentParams);
    }
    setSearchParams(currentParams, { replace: true });
  };

  const handleCheckAll: CheckboxProps['onChange'] = (e) => {
    setFilters(e.target.checked ? plainOptions : defaultFilter?.split(','));
  };

  const CheckboxRender = () => {
    return (
      <>
        <Checkbox
          indeterminate={indeterminate}
          onChange={handleCheckAll}
          checked={isCheckAll}
        >
          Chọn tất cả
        </Checkbox>
        <Divider className="!my-3" />
        <Checkbox.Group onChange={(e) => setFilters(e)} value={filters}>
          {items?.map((item, index) => {
            return (
              <CCheckbox
                key={index}
                value={index.toString()}
                disabled={item.disabled || item.showDefault}
              >
                {item.label}
              </CCheckbox>
            );
          })}
        </Checkbox.Group>
      </>
    );
  };
  const defaultParam = { filters: defaultFilter };

  const handleRefresh = () => {
    form.resetFields();
    setSearchParams(
      { ...defaultParam, requestTime: dayjs().format(formatDateBe) },
      {
        replace: true,
      }
    );
  };

  useEffect(() => {
    if (defaultFilter) {
      setSearchParams(
        { ...params, filters: params.filters || defaultFilter },
        { replace: true }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <WrapperButton>
      {items?.length > 0 && (
        <Popover
          content={<CheckboxRender />}
          placement="bottom"
          trigger="click"
        >
          <Button type="default">
            <Space>
              <Funnel />
              Bộ lọc
              <ChevronDown />
            </Space>
          </Button>
        </Popover>
      )}
      {props.searchComponent}
      {items?.map((item, i) => (
        <Fragment key={i}>
          {filters?.includes(i.toString()) && item.value}
        </Fragment>
      ))}
      <WrapperButton>
        <CButton icon={<Search />} htmlType="submit">
          Tìm kiếm
        </CButton>
        <RotateCcw
          size="lg"
          className="cursor-pointer self-center"
          onClick={() => (onRefresh ? onRefresh() : handleRefresh())}
        />
      </WrapperButton>
    </WrapperButton>
  );
});

export default CFilter;
