import type { FC } from "react";
import { Shield, Lock, MessageCircle, Users } from "lucide-react";

const MissionVision: FC = () => {
  return (
    <section className="py-5">
      <div className="container  grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        {/* Left - Image */}
        <div>
          <img
            src="https://images.pexels.com/photos/3184433/pexels-photo-3184433.jpeg?cs=srgb&dl=pexels-fauxels-3184433.jpg&fm=jpg"
            alt="Team working"
            className="rounded-2xl shadow-lg object-cover w-full h-[400px]"
          />
        </div>

        {/* Right - Content */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Our Mission & Vision
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-8 max-w-lg">
            We aim to build a distraction-free, secure, and meaningful
            social platform that empowers people to connect authentically
            and protect their privacy.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-6">
            {/* Box 1 */}
            <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 shadow rounded-2xl">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-3" />
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Data Privacy
              </h3>
            </div>

            {/* Box 2 */}
            <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 shadow rounded-2xl">
              <Lock className="w-8 h-8 text-green-600 dark:text-green-400 mb-3" />
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Secure Messaging
              </h3>
            </div>

            {/* Box 3 */}
            <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 shadow rounded-2xl">
              <Users className="w-8 h-8 text-purple-600 dark:text-purple-400 mb-3" />
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Meaningful Connections
              </h3>
            </div>

            {/* Box 4 */}
            <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-gray-800 shadow rounded-2xl">
              <MessageCircle className="w-8 h-8 text-red-600 dark:text-red-400 mb-3" />
              <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                Distraction-Free
              </h3>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MissionVision;