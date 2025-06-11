import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ButtonProps } from 'antd';
import Button from '.';
const CButtonApprove: React.FC<ButtonProps> = ({ ...rest }) => {
  return (
    <Button icon={<FontAwesomeIcon icon={faPaperPlane} />} {...rest}>
      Phê duyệt
    </Button>
  );
};

export default CButtonApprove;
