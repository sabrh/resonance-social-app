import type { FC } from "react";

const Banner: FC = () => {
  return (
    <div className="relative pt-70 py-10 flex items-center justify-center text-center">

      <img
        src="https://images.pexels.com/photos/109919/pexels-photo-109919.jpeg?cs=srgb&dl=pexels-hikaique-109919.jpg&fm=jpg" 
        alt="People walking"
        className="absolute inset-0 w-full h-full object-cover rounded-2xl"/>

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/60"></div>

      {/* Content */}
      <div className="relative z-10 text-white px-6">
        <h1 className="text-3xl md:text-4xl font-bold mb-4">
          Resonance Social
        </h1>
        <p className="text-lg md:text-2xl mb-5 max-w-2xl mx-auto">
          A community-driven platform to connect, share, and resonate with the
          world. Join us and be part of something meaningful.
        </p>
        <a href='#join-us'>
          <button className="btn btn-info text-white rounded-full px-8 py-3 text-lg">
          Get Started
        </button>
        </a>
      </div>
    </div>
  );
};

export default Banner;