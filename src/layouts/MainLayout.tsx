import type { FC } from 'react';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router';
import Footer from '../components/Footer';

const MainLayout: FC = () => {
  return (
    <div>
      <header><Navbar /></header>
        <main>
          <div className='min-h-[calc(100vh-68px)] mx-8 md:mx-36 my-2'>
            <Outlet></Outlet>
          </div>
        </main>
        <Footer />
    </div>
  );
};

export default MainLayout;