import type { FC } from "react";
import Signup from "../../pages/auth/Signup";

const JoinUs: FC = () => {
  return (
    <section id="join-us" className="relative py-5">
      {/* Background Image */}
      <img
        src="https://i.ibb.co.com/qMxybX9h/people.jpg"
        alt="Join Us Background"
        className="absolute inset-0 w-full h-full object-cover rounded-2xl"/>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative container mx-auto px-4 md:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
        
        {/* Left Side */}
        <div className="text-white space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold">
            Join Us Today
          </h2>
          <p className="text-lg text-gray-200 max-w-lg">
            Become part of the Resonance community — a place where privacy,
            meaningful connections, and authentic conversations thrive.
            Sign up today and start resonating with people who matter.
          </p>
        </div>

        {/* Right Side - Signup Form Placeholder */}
        <div className=" rounded-xl shadow-md">
          <Signup />
        </div>
      </div>
    </section>
  );
};

export default JoinUs;