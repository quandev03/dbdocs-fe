import { Button, Result } from 'antd';
import { memo } from 'react';
import { useNavigate } from 'react-router-dom';

export const ErrorPage = memo(() => {
  const navigate = useNavigate();

  const handleClickBack = () => {
    navigate(-1);
  };
  return (
    <Result
      status="500"
      title="500"
      subTitle="Sorry, an error orcurred."
      extra={
        <Button type="primary" onClick={handleClickBack}>
          Back
        </Button>
      }
    />
  );
});

export const NotFoundPage = memo(() => {
  const navigate = useNavigate();

  const handleClickBack = () => {
    navigate(-1);
  };

  return (
    <Result
      status="404"
      title="404"
      subTitle="Sorry, the page you visited does not exist."
      extra={
        <Button type="primary" onClick={handleClickBack}>
          Back
        </Button>
      }
    />
  );
});
