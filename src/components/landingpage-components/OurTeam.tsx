import type { FC } from "react";
import Slider from "react-slick";

const OurTeam: FC = () => {
  const team = [
    {
      name: "Sabrina Haque",
      title: "Team Lead & Developer",
      img: "https://i.ibb.co.com/9kMFd4F5/sabrin2025.jpg",
    },
    {
      name: "Rahat Khan",
      title: "Backend Developer",
      img: "https://i.ibb.co.com/Q7P9rtDV/Screenshot-2025-01-22-215148.png",
    },
    {
      name: "Muhammad Rifat",
      title: "Fullstack Developer",
      img: "https://i.postimg.cc/G3qxzRq1/Rifat.jpg",
    },
    {
      name: "Redoy Ghosh Antu",
      title: "Fullstack Developer",
      img: "https://i.ibb.co.com/9kRxwfYm/Redoy-Ghosh-Antu.jpg",
    },
    {
      name: "Md Jamiluddin",
      title: "Fullstack Developer",
      img: "https://i.postimg.cc/V6ZsLwz6/b88f2b8b-4123-4149-9ee7-508eed7be62e.jpg",
    },
  ];

  // Carousel settings
  const settings = {
    dots: true,
    infinite: true,
    autoplay: true,
    autoplaySpeed: 2000,
    slidesToShow: 3, // default desktop
    slidesToScroll: 1,
    arrows: true, // show arrows on desktop
    responsive: [
      {
        breakpoint: 1024, // tablets
        settings: { slidesToShow: 2, arrows: false },
      },
      {
        breakpoint: 768, // mobile
        settings: { slidesToShow: 1, arrows: false, dots: true },
      },
    ],
  };

  return (
    <section className="py-10 px-4 md:px-8">
      <div className="mx-auto">
        <h2 className="text-2xl md:text-3xl font-bold text-center mb-8 text-base-content">
          Meet the Team
        </h2>

        <Slider {...settings}>
          {team.map((member, idx) => (
            <div key={idx} className="px-2">
              <div className="flex flex-col items-center text-center bg-base-100 p-6 rounded-xl shadow-md border border-transparent dark:border-base-300 hover:bg-base-200 hover:shadow-lg transition">
                <img
                  src={member.img}
                  alt={member.name}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full object-cover mb-4 border-2 border-base-300"
                />
                <h3 className="text-lg md:text-xl font-semibold text-base-content">
                  {member.name}
                </h3>
                <p className="text-sm md:text-base text-base-content/70">
                  {member.title}
                </p>
              </div>
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default OurTeam;
