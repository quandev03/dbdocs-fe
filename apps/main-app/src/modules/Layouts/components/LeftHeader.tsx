import useConfigAppStore from '../stores';
import { memo } from 'react';
import { IconMenu, IconCollapsed } from '../styled';

const LeftHeader = () => {
  const { collapsedMenu, toggleCollapsedMenu } = useConfigAppStore();
  const handleChange = () => {
    toggleCollapsedMenu();
  };
  return (
    <div>
      <IconMenu>
        <IconCollapsed>
          {collapsedMenu ? (
            <img src={''} alt="Logo" onClick={handleChange} />
          ) : (
            <img src={''} alt="Logo" onClick={handleChange} />
          )}
        </IconCollapsed>
      </IconMenu>
    </div>
  );
};

export default memo(LeftHeader);
