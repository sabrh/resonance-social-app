import type { FC } from 'react';
import Lottie from 'lottie-react';
import errorAnimation from '../assets/lottieFiles/error.json'
import { NavLink } from 'react-router';

const ErrorPage: FC = () => {
  return (
     <>      
      <div className="flex flex-col items-center justify-center mt-4">
          <Lottie animationData={errorAnimation} className="w-100" />
            
      </div>
      <div className='flex justify-center'>
          <NavLink to="/" className="btn btn-neutral mx-auto rounded-full">
          BACK TO HOME</NavLink>
      </div>
      </> 
  );
};

export default ErrorPage;