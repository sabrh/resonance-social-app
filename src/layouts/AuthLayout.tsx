import React from 'react';
import type { FC } from 'react';
import { Outlet } from 'react-router';

const AuthLayout: FC = () => {
  return (
    <div className='w-120 mx-auto mt-10'>
        <Outlet></Outlet>
    </div>
  );
};

export default AuthLayout;