
import type { FC } from 'react';
import { Link, Outlet } from 'react-router';

const AuthLayout: FC = () => {
  return (
    <div>
      <header>
        <div className="navbar bg-base-100 shadow px-8 md:px-36"> 
            <div className="navbar-start"> 
              <Link to="/" className="font-bold text-3xl">resonance</Link> 
            </div>
        </div>
      </header>
      <div className='w-120 mx-auto mt-10'>
        <Outlet></Outlet>
    </div>
    </div>
    
  );
};

export default AuthLayout;