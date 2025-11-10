'use client';

import { Oval } from 'react-loader-spinner';

export default function OvalSpinner() {
  return (
    <Oval
      visible={true}
      height="80"
      width="80"
      color="#ecedee"
      ariaLabel="loading"
      wrapperStyle={{}}
      wrapperClass=""
    />
  );
}
