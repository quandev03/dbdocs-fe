import { render } from '@testing-library/react';

import DbmlEditor from './dbml-editor';

describe('DbmlEditor', () => {
  it('should render successfully', () => {
    const { baseElement } = render(<DbmlEditor />);
    expect(baseElement).toBeTruthy();
  });
});
