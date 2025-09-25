import React from "react";

const RightSidebar: React.FC = () => {

  return (
    <aside className="hidden md:block md:col-span-3">
      <div className="sticky top-20 bg-gray-100 dark:bg-gray-800 rounded-lg shadow overflow-hidden">
     <p className="p-10">Stories</p>
      </div>
    </aside>
  );
};

export default RightSidebar;