import type { FC } from 'react';

const Home: FC = () => {
  return (
    <div className='mt-12 px-4 sm:px-7 md:px-12 lg:px-20 2xl:px-20 '>
      {/* post section */}
      <div className='w-full'>
        <div></div>
        {/* main post box */}
        <div className='rounded-sm px-5 py-6'>
          <button className='btn bg-blue-600 text-white'>News feed</button>
          <div className='mt-3 shadow-2xl bg-[#f6ecec] rounded-xl px-4 py-4'>
            <p className='text-xl font-bold'>Create New Post</p>
            <input className='bg-white rounded-2xl h-[50px] w-full mt-3' type="text" />
            <div className='mt-5 ml-6 flex gap-8'>
              <p className='text-xl font-bold flex gap-2 items-center cursor-pointer'><i className="fa-solid fa-images text-4xl text-green-600"></i><span>Photos</span></p>
              <p className='text-xl font-bold flex gap-2 items-center cursor-pointer'><i className="fa-regular fa-face-smile text-4xl text-yellow-600"></i><span>Feelings/Activity</span></p>

              <button className='btn bg-green-600 text-white ml-7'>Post</button>
              
            </div>
          </div>
        </div>
        <div></div>
      </div>
    </div>
  );
};

export default Home;
