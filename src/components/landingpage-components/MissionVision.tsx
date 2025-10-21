import type { FC } from "react";
import { Shield, Lock, MessageCircle, Users } from "lucide-react";

const MissionVision: FC = () => {
  return (
    <section className="py-5">
      <div className="container grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
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
          <h2 className="text-2xl md:text-3xl font-bold text-base-content mb-4">
            Our Mission & Vision
          </h2>

          <p className="text-base-content/70 mb-8 max-w-lg">
            We aim to build a distraction-free, secure, and meaningful social
            platform that empowers people to connect authentically and protect
            their privacy.
          </p>

          {/* Features */}
          <div className="grid grid-cols-2 gap-6">
            {/* Box 1 */}
            <div className="flex flex-col items-center justify-center p-6 bg-base-100 shadow rounded-2xl">
              <Shield className="w-8 h-8 text-primary mb-3" />
              <h3 className="text-sm font-semibold text-base-content">
                Data Privacy
              </h3>
            </div>

            {/* Box 2 */}
            <div className="flex flex-col items-center justify-center p-6 bg-base-100 shadow rounded-2xl">
              <Lock className="w-8 h-8 text-secondary mb-3" />
              <h3 className="text-sm font-semibold text-base-content">
                Secure Messaging
              </h3>
            </div>

            {/* Box 3 */}
            <div className="flex flex-col items-center justify-center p-6 bg-base-100 shadow rounded-2xl">
              <Users className="w-8 h-8 text-accent mb-3" />
              <h3 className="text-sm font-semibold text-base-content">
                Meaningful Connections
              </h3>
            </div>

            {/* Box 4 */}
            <div className="flex flex-col items-center justify-center p-6 bg-base-100 shadow rounded-2xl">
              <MessageCircle className="w-8 h-8 text-info mb-3" />
              <h3 className="text-sm font-semibold text-base-content">
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
