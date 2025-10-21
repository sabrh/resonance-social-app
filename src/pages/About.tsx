import type { FC } from "react";
import Banner from "../components/landingpage-components/Banner";
import MissionVision from "../components/landingpage-components/MissionVision";
import CoreFeatures from "../components/landingpage-components/CoreFeatures";
import OurTeam from "../components/landingpage-components/OurTeam";
import JoinUs from "../components/landingpage-components/JoinUs";

const About: FC = () => {
  return (
    <div className=" mx-auto">
      <Banner />
      <MissionVision />
      <CoreFeatures />
      <OurTeam />
      <JoinUs />
    </div>
  );
};

export default About;
