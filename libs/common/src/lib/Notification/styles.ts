import styled from 'styled-components';

export const StyledTextSuccess = styled.div`
  font-size: 1rem;
  display: flex;
  justify-content: center;
  margin: 1.5rem;
`;

export const StyledTitleSuccess = styled.div`
  border-radius: 8px 8px 0 0;
  font-size: 1rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #01bb00;
  color: white;
`;

export const StyledTitleError = styled(StyledTitleSuccess)`
  background-color: #ff6364;
`;
export const StyledIconX = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  cursor: pointer;
`;

export const StyledTitleWarning = styled.div`
  border-radius: 8px 8px 0 0;
  font-size: 1rem;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #faad14;
  color: white;
`;
