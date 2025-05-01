import React from 'react';
import { Button } from "@/components/ui/button";

const HeroSectionV1 = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center px-4 pt-16 pb-8">
      <div className="flex flex-col items-center justify-center text-center mb-16 mt-4">
        <a className="text-[#777] font-medium text-[14px] px-[12px] py-[4px] bg-[#FFF] rounded-full shadow mb-6 mt-2">
          Transform Your Social Media Presence
        </a>
        <h1 className="text-[36px] md:text-[48px] font-extrabold text-[#333] whitespace-pre-line mb-4 leading-[42px] md:leading-[52px] md:font-['onestopmarketing']">
          <span className="hidden md:block">
            Your All-in-One<br />Social Media Growth Engine
          </span>
          <span className="block md:hidden">
            Your All-in-One<br />Social Media Growth Engine
          </span>
        </h1>
        <p className="text-[16px] text-[#868686] md:text-[21px] leading-[22px] md:leading-[28px] max-w-[600px] mb-2 font-['onestopmarketing']">
          <span className="hidden md:block">Create viral content that converts across all platforms</span>
          <span className="block md:hidden">Create viral content that converts across all platforms</span>
        </p>
        <div className="flex gap-2 mt-4">
          <Button className="bg-[#4A8DFF] text-white text-[16px] font-medium px-6 py-2 rounded-full shadow-md hover:opacity-90 transition-opacity">
            Start Now
          </Button>
          <Button
            variant="outline"
            className="text-[#333] text-[16px] font-medium px-6 py-2 rounded-full shadow-md hover:opacity-90 transition-opacity border-[#4A8DFF] hover:bg-[#4A8DFF]/10"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="lucide lucide-play mr-2"
            >
              <polygon points="6 3 20 12 6 21 6 3"></polygon>
            </svg>
            Demo
          </Button>
        </div>
      </div>
      <a className="text-[#868686] text-[14px] font-medium">
        Join the future of social media marketing
      </a>
    </div>
  );
};
export default HeroSectionV1;