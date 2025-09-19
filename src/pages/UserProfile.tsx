import type { FC } from "react";

const UserProfile: FC = () => {
  return (
    <div className="max-w-5xl mx-auto bg-white shadow rounded-lg overflow-hidden">
      {/* Banner Photo */}
       <div className="relative h-48 bg-gradient-to-r from-blue-500 to-indigo-600">
        <img
          src="../../public/banner1.jpg"
          alt="Cover"
          className="w-full h-full object-cover"
        />
        {/* Profile Picture */}
        <div className="absolute -bottom-8 left-6">
          <img
            src="../../public/profile1.png"
            alt="Profile"
            className="w-32 h-32 rounded-full border-4 border-white object-cover"
          />
        </div>
      </div>


      



    </div>
  );
};

export default UserProfile;
