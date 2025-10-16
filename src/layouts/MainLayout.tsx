import type { FC } from 'react';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router';
import Footer from '../components/Footer';
import { ChatProvider } from '../context/ChatContext/ChatContext';

const MainLayout: FC = () => {
  return (
    <div>
      <ChatProvider>
        <header><Navbar /></header>
        <main>
          <div className='min-h-[calc(100vh-68px)] mx-8 md:mx-36 my-2'>
            <Outlet></Outlet>
          </div>
        </main>
        <Footer />
      </ChatProvider>
    </div>
  );
};

export default MainLayout;