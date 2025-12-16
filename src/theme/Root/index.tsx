import React from 'react';
import NewPostToastContainer from '../NewPostToast';

interface RootProps {
  children: React.ReactNode;
}

export default function Root({ children }: RootProps): React.ReactElement {
  return (
    <>
      {children}
      <NewPostToastContainer />
    </>
  );
}
