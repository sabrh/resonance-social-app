import { SearchIcon } from 'lucide-react';
import { useState, type FC } from 'react';
import { MdMenu } from 'react-icons/md';
import type { User, Message } from '../../types/chat';
import { useChat } from '../../context/ChatContext/ChatContext';

interface SidebarProps {
  selectedUser: User | null;
  setSelectedUser: (user: User) => void;
  users: User[];
  onlineUsers: string[];
  unreadCounts: Record<string, number>; 
  messages: Message[];
}

const Sidebar: FC<SidebarProps> = ({ 
  selectedUser, 
  setSelectedUser, 
  users, 
  onlineUsers, 
  unreadCounts 
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const { globalUnreadCount } = useChat();

  //  Filter users by search term
  const filteredUsers = users.filter(user =>
    user.displayName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`bg-[#8185B2]/10 h-full p-5 rounded-r-xl overflow-y-auto text-white
    ${selectedUser ? "max-md:hidden" : ""}`}>
      {/* Header */}
      <div className=' pb-5'>
        <div className='flex justify-between items-center'>
          <h3 className='font-bold text-lg'>Messages</h3>
          
          {globalUnreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
              {globalUnreadCount}
            </span>
          )}
          <div className='relative py-2 group'>
            <MdMenu className='max-h-5 cursor-pointer' />
          </div>
        </div>

        {/*  Search Input */}
        <div className='bg-[#282142] rounded-full flex items-center gap-2 py-3 px-4 mt-5'>
          <SearchIcon className='w-4 h-4' />
          <input
            type='text'
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className='bg-transparent border-none outline-none text-white text-sm placeholder-[#c8c8c8] flex-1'
            placeholder='Search User'
          />
        </div>
      </div>

      {/*  User List */}
      <div className='flex flex-col space-y-2'>
        {filteredUsers.map((user) => (
          <div
            onClick={() => setSelectedUser(user)}
            key={user._id}
            className={`relative flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors
              ${selectedUser?._id === user._id ? 'bg-[#282142]/50' : 'hover:bg-[#282142]/30'}`}
          >
            {/* Profile Image + Online Indicator */}
            <div className="relative">
              <img
                src={user.photoURL || '/default-avatar.png'}
                alt={user.displayName}
                className='w-12 h-12 rounded-full object-cover'
              />
              {onlineUsers.includes(user.uid) && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              )}
            </div>

            {/* Name + Status */}
            <div className='flex flex-col flex-1 min-w-0'>
              <p className='font-medium truncate'>{user.displayName}</p>
              <span className={`text-xs ${onlineUsers.includes(user.uid) ? 'text-green-400' : 'text-gray-400'}`}>
                {onlineUsers.includes(user.uid) ? 'Online' : 'Offline'}
              </span>
            </div>

            {/*  Unread badge */}
            {unreadCounts[user.uid] > 0 && (
              <div className="ml-auto bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                {unreadCounts[user.uid]}
              </div>
            )}
          </div>
        ))}

        {filteredUsers.length === 0 && (
          <div className="text-center text-gray-400 py-8">
            <p>No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;