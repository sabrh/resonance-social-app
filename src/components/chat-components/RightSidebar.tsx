import type { User } from "../../types/chat";


interface RightSidebarProps {
  selectedUser: User | null;
}

const RightSidebar: React.FC<RightSidebarProps> = ({ selectedUser }) => {
  // Mock images for demonstration
  const images = [
    'https://images.unsplash.com/photo-1579546929662-711aa81148cf',
    'https://images.unsplash.com/photo-1453728013993-6d66e9c9123a',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d',
  ];

  if (!selectedUser) {
    return (
      <div className={`bg-[#8185B2] text-white w-full h-full flex items-center justify-center max-md:hidden`}>
        <div className="text-center">
          <p className="text-lg">Select a conversation to view details</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-[#8185B2] text-white w-full h-full overflow-y-auto max-md:hidden`}>
      <div className='p-6 flex flex-col items-center gap-4'>
        <img 
          src={selectedUser.photoURL || '/default-avatar.png'} 
          alt={selectedUser.displayName} 
          className='w-24 h-24 rounded-full object-cover border-4 border-white/20' 
        />
        <div className="text-center">
          <h1 className='text-xl font-semibold flex items-center justify-center gap-2'>
            {selectedUser.displayName}
            <span className='w-3 h-3 rounded-full bg-green-400'></span>
          </h1>
          <p className='text-gray-200 mt-1'>{selectedUser.email}</p>
        </div>
        
      </div>

      <hr className='border-white/20 my-4' />
      
      <div className='px-6 pb-6'>
        <p className='font-semibold text-sm uppercase tracking-wider text-gray-200 mb-3'>Shared Media</p>
        <div className='grid grid-cols-2 gap-2'>
          {images.map((url, index) => (
            <div 
              key={index} 
              onClick={() => window.open(url, '_blank')}
              className='cursor-pointer rounded-lg overflow-hidden aspect-square bg-gray-600 hover:opacity-80 transition-opacity'
            >
              <img 
                src={url} 
                alt={`Shared media ${index + 1}`} 
                className='w-full h-full object-cover'
              />
            </div>
          ))}
        </div>
        
        {images.length === 0 && (
          <p className="text-gray-400 text-sm text-center py-4">No media shared yet</p>
        )}
      </div>
    </div>
  );
};

export default RightSidebar;