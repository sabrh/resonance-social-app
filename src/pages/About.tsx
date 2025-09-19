// src/pages/About.tsx
import type { FC } from "react";
import { FaUsers, FaRegCommentDots, FaHeart, FaBullseye, FaEye } from "react-icons/fa";

const About: FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 mt-10">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white h-[80vh] shadow-md">
        <div className="container mx-auto px-6 py-20 flex flex-col items-center text-center">
          <img src="/logo.png" alt="Logo" className="w-24 h-24 mb-6 drop-shadow-lg" />
          <h1 className="text-5xl font-extrabold mb-4">Resonance Social</h1>
          <p className="text-lg max-w-xl opacity-90">
            <span className="font-semibold">Connect. Share. Inspire.</span> <br />
            A minimalist platform designed to make social connection simple, meaningful, and inspiring.
          </p>
          <button className="mt-6 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow hover:scale-105 transition">
            Get Started
          </button>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-10">Our Mission & Vision</h2>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white p-8 rounded-lg shadow hover:shadow-md transition">
            <FaBullseye className="text-blue-600 text-4xl mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Our Mission</h3>
            <p className="text-gray-600">
              To create a distraction-free space where everyone can share openly, connect authentically, and feel empowered.
            </p>
          </div>
          <div className="bg-white p-8 rounded-lg shadow hover:shadow-md transition">
            <FaEye className="text-purple-600 text-4xl mb-4 mx-auto" />
            <h3 className="text-xl font-semibold mb-2">Our Vision</h3>
            <p className="text-gray-600">
              Building a global community where simplicity, trust, and meaningful conversations thrive over noise.
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-100 py-16">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-12">Core Features</h2>
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-lg shadow hover:scale-105 hover:shadow-xl transition">
              <FaUsers className="text-blue-600 text-5xl mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-3">Connect</h3>
              <p className="text-gray-600">
                Find and connect with people who matter. Build meaningful bonds in a distraction-free platform.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow hover:scale-105 hover:shadow-xl transition">
              <FaRegCommentDots className="text-green-600 text-5xl mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-3">Share</h3>
              <p className="text-gray-600">
                Post updates, ideas, and experiences. Spark conversations that truly inspire.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg shadow hover:scale-105 hover:shadow-xl transition">
              <FaHeart className="text-red-500 text-5xl mb-4 mx-auto" />
              <h3 className="text-xl font-semibold mb-3">Engage</h3>
              <p className="text-gray-600">
                Like, comment, and support your friends. Engagement made simple and fun.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="container mx-auto px-6 py-16 text-center">
        <h2 className="text-3xl font-bold mb-10">Meet the Team</h2>
        <div className="grid md:grid-cols-3 gap-10">
          {[
            { name: "Sabrina Haque", role: "Team Leader" },
            { name: "Rifat Alam", role: "Frontend Developer" },
            { name: "Six Hunters", role: "Creative Team" },
          ].map((member, idx) => (
            <div
              key={idx}
              className="bg-white p-8 rounded-lg shadow hover:scale-105 hover:shadow-md transition"
            >
              <img
                src={`https://i.pravatar.cc/150?img=${idx + 10}`}
                alt={member.name}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h3 className="text-lg font-semibold">{member.name}</h3>
              <p className="text-gray-600 text-sm">{member.role}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-16">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="mb-6 max-w-xl mx-auto opacity-90">
            Start sharing today and be part of the Resonance family. Together we create a
            space that values real connection over numbers.
          </p>
          <button className="px-8 py-3 bg-white text-blue-600 font-semibold rounded-lg shadow hover:scale-105 transition">
            Get Started
          </button>
        </div>
      </section>
    </div>
  );
};

export default About;
