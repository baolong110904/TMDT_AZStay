"use client";

import React, { useEffect, useState } from "react";
// import banner1 from "../assets/banner.png";

const Banner = () => {
  const [animate, setAnimate] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const items = ["AZStay", "Vietnam", "China", "Korea", "Thailand"];

  useEffect(() => {
    // Trigger initial animations
    const timer = setTimeout(() => setAnimate(true), 100);
    // Set interval for rolling text
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 2000); // Change every 2 seconds
    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  });

  return (
    <div className="p-4 max-w-screen-3xl mx-auto dark:bg-darkBg">
      <div className="relative rounded-xl rounded-br-[80px] md:p-9 px-4 py-8 bg-gradient-to-r from-blue-700 to-purple-800 overflow-hidden">
        {/* Background elements with movement */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-white/10 animate-move"></div>
          <div className="absolute -bottom-40 -left-20 w-80 h-80 rounded-full bg-white/10 animate-move" style={{ animationDuration: '8s' }}></div>
          <div className="absolute top-1/3 left-1/4 w-32 h-32 rounded-full bg-white/10 animate-move" style={{ animationDuration: '5s' }}></div>
        </div>

        <div className="relative px-4 lg:px-14 max-w-screen-2xl mx-auto">
          <div className="my-8 md:my-16 py-8 flex flex-col md:flex-row-reverse items-center justify-between gap-8">
            {/* Image section */}
            <div className="w-full md:w-1/2 flex justify-center">
              <div className={`transition-all duration-1000 ease-out ${animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
                {/* <img 
                  src={banner1} 
                  alt="Language Learning" 
                  className="max-h-[300px] md:max-h-[400px] w-auto drop-shadow-2xl"
                /> */}
              </div>
            </div>

            {/* Text content */}
            <div className="w-full md:w-1/2 text-center md:text-left">
              <h1 className={`text-3xl md:text-4xl lg:text-5xl font-extrabold leading-tight mb-4 transition-all duration-700 ${animate ? 'opacity-100' : 'opacity-0 translate-y-5'}`}>
                Lets stay in{" "}
                <div className="text-green-300 inline-block h-[1.2em] overflow-hidden align-middle">
                  <ul
                    className="transition-transform duration-500 ease-in-out"
                    style={{ transform: `translateY(-${currentIndex * (100 / items.length)}%)` }}
                  >
                    {items.map((item, index) => (
                      <li key={index} className="h-[1.2em]">{item}</li>
                    ))}
                  </ul>
                </div>
                <br />
                why not?
              </h1>

              <p className={`text-white/90 md:text-lg lg:text-xl mt-4 mb-6 transition-all duration-1000 delay-300 ${animate ? 'opacity-100' : 'opacity-0 translate-y-5'}`}>
                Dont just stay, AZStay! Your journey to the perfect getaway starts here. From cozy corners to sprawling spaces, we offer a complete A to Z selection of unique places to stay. 
                <br/>Find your ideal spot and book your next adventure with ease.
              </p>

              <div className={`transition-all duration-1000 delay-500 ${animate ? 'opacity-100' : 'opacity-0 translate-y-5'}`}>
                <button className="relative inline-flex items-center justify-center px-8 py-3 md:px-10 md:py-3 bg-white text-blue-700 font-bold rounded-full hover:bg-blue-100 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-white/50 overflow-hidden group">
                  <span className="relative z-10">Lets AZStay!</span>
                  <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:animate-shimmer" />
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Custom styles for background animation */}
      <style jsx global>{`
        @keyframes move {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
        }
        .animate-move {
          animation: move 6s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default Banner;