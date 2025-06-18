import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import './ErrorPage.css';

const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="error-container">
      <Result
        status="404"
        title="Page Not Found"
        subTitle="Sorry, the page you visited does not exist."
        extra={[
          <Button type="primary" key="back-home" onClick={() => navigate('/')}>
            Back to Home
          </Button>,
          <Button key="back" onClick={() => navigate(-1)}>
            Go Back
          </Button>,
        ]}
      />
    </div>
  );
};

export default NotFound; 