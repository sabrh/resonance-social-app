import type { FC } from "react";
import Banner from "../components/landingpage-components/Banner";
import MissionVision from "../components/landingpage-components/MissionVision";
import CoreFeatures from "../components/landingpage-components/CoreFeatures";

const About: FC = () => {
  return (
    <div>
      <Banner />
      <MissionVision />
      <CoreFeatures />

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
