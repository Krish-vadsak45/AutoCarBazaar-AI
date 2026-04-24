'use client';

import CarSpinner from './CarSpinner';

const Loading = () => (
  <div className="flex min-h-screen items-center justify-center bg-background relative">
    <CarSpinner />
  </div>
);

export default Loading;
