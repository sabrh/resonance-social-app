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
      </div>
    </div>
  );
};

export default UserProfile;
