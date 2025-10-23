import type { FC } from "react";
import {
  FileText,
  Heart,
  Share2,
  UserCircle,
  Bell,
  MessageSquare,
} from "lucide-react";

const CoreFeatures: FC = () => {
  const features = [
    {
      icon: <FileText className="w-10 h-10 text-primary mb-4" />,
      title: "Post Public/Private",
      desc: "Share your thoughts and images with custom visibility.",
    },
    {
      icon: <Heart className="w-10 h-10 text-secondary mb-4" />,
      title: "Like & Comment",
      desc: "Engage with posts through likes and meaningful comments.",
    },
    {
      icon: <Share2 className="w-10 h-10 text-accent mb-4" />,
      title: "Sharing Content",
      desc: "Easily share posts across the community with friends.",
    },
    {
      icon: <UserCircle className="w-10 h-10 text-info mb-4" />,
      title: "Update Profile",
      desc: "Customize your profile with bio, photos, and more.",
    },
    {
      icon: <Bell className="w-10 h-10 text-warning mb-4" />,
      title: "Live Notifications",
      desc: "Stay updated instantly with real-time alerts.",
    },
    {
      icon: <MessageSquare className="w-10 h-10 text-error mb-4" />,
      title: "Private Messaging",
      desc: "Chat one-on-one securely with your connections.",
    },
  ];

  return (
    <section className="py-5">
      <div className="container">
        <h2 className="text-2xl md:text-3xl font-bold text-center text-base-content">
          Core Features
        </h2>
        <p className="text-center text-base-content/70 mb-5">
          Finding your tribe shouldn't be that hard.
        </p>

        {/* Grid Layout */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
          {features.map((feature, idx) => (
            <div
              key={idx}
              className="flex flex-col items-center text-center p-6 rounded-2xl 
              bg-base-100 border border-base-300/60 shadow-sm
              dark:bg-base-200 dark:border-base-300/50
              hover:shadow-md hover:border-primary/40 
              transition-all duration-300"
            >
              {feature.icon}
              <h3 className="text-lg font-semibold text-base-content mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-base-content/70">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CoreFeatures;
