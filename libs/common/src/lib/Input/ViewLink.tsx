import { ReactNode } from 'react';

interface ViewLinkInputProps {
  children?: ReactNode;
  onView?: () => void;
}

export const ViewLinkInput: React.FC<ViewLinkInputProps> = ({
  children,
  onView,
}) => {
  return (
    <div className="bg-[#0000000a] border border-[#d9d9d9] rounded-md py-1.5 px-2.5">
      <span className="text-link underline cursor-pointer" onClick={onView}>
        {children}
      </span>
    </div>
  );
};
