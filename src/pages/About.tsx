// src/pages/About.tsx
import type { FC } from "react";
import { FaUsers, FaRegCommentDots, FaHeart } from "react-icons/fa";

const About: FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <section className="bg-white shadow-md">
        <div className="container mx-auto px-6 py-16 flex flex-col items-center text-center">
          <img src="/logo.png" alt="Logo" className="w-20 h-20 mb-4" />
          <h1 className="text-4xl font-bold mb-2">Resonance Social</h1>
          <p className="text-lg text-gray-600 max-w-xl">
            Connect. Share. Inspire. <br />A minimalist social platform to share
            your thoughts and engage with friends.
          </p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container mx-auto px-6 py-12 text-center">
        <h2 className="text-2xl font-semibold mb-6">Our Mission & Vision</h2>
        <p className="max-w-2xl mx-auto text-gray-600">
          Our mission is to create a simple, distraction-free social space where
          everyone can share freely and connect meaningfully. <br />
          Our vision is to build a global community that values authenticity and
          simplicity.
        </p>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 py-12">
        <div className="container mx-auto px-6">
          <h2 className="text-2xl font-semibold text-center mb-10">
            Core Features
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <FaUsers className="text-blue-600 text-4xl mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Connect</h3>
              <p className="text-gray-600">
                Find and connect with people who matter to you.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <FaRegCommentDots className="text-green-600 text-4xl mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Share</h3>
              <p className="text-gray-600">
                Post updates, thoughts, and ideas with your friends.
              </p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition">
              <FaHeart className="text-red-500 text-4xl mb-4 mx-auto" />
              <h3 className="text-lg font-semibold mb-2">Engage</h3>
              <p className="text-gray-600">
                Like and comment to engage with your community.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-6 py-12 text-center">
        <h2 className="text-2xl font-semibold mb-6">Meet the Team</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {["Sabrina Haque", "Rifat Alam", "Six Hunters"].map((member, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-lg shadow hover:shadow-md transition"
            >
              <img
                src={`https://i.pravatar.cc/150?img=${idx + 10}`}
                alt={member}
                className="w-20 h-20 rounded-full mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold">{member}</h3>
              <p className="text-gray-600 text-sm">Developer</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white py-12">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-2xl font-semibold mb-4">Join Our Community</h2>
          <p className="mb-6">
            Start sharing today and be part of the Resonance family.
          </p>
          <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow hover:bg-gray-200 transition">
            Get Started
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;
