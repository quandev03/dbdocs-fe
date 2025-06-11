import { Tooltip } from 'antd';
import { RefreshCcw } from 'lucide-react';

interface Props {
  onClick: () => void;
}
export const CReloadButton = (props: Props) => {
  return (
    <Tooltip title="Làm mới">
      <RefreshCcw
        size="lg"
        className="cursor-pointer self-center"
        onClick={props.onClick}
      />
    </Tooltip>
  );
};
