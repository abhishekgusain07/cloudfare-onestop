import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PlatformSupported = () => {
  const logos = [
    {
      name: "Instagram",
      height: "h-12",
      src: "/socialslogo/instagram.svg",
      alt: "Instagram",
      additionalClasses: "rounded-md",
      tooltip: "Instagram"
    },
    {
      name: "Tiktok",
      height: "h-12",
      src: "/socialslogo/tiktok.svg",
      alt: "Tiktok",
      tooltip: "Tiktok"
    },
    {
      name: "Linkedin",
      height: "h-12",
      src: "/socialslogo/linkedin.svg",
      alt: "Linkedin",
      additionalClasses: "rounded-md",
      tooltip: "Linkedin"
    },
    {
      name: "X",
      height: "h-5",
      src: "/socialslogo/x.svg",
      alt: "X"
    },
    {
      name: "Youtube",
      height: "h-5",
      src: "/socialslogo/youtube.svg",
      alt: "Youtube"
    }
  ];

  return (
    <TooltipProvider>
      <section className="bg-background/50 backdrop-blur-sm py-10 border-slate-100 dark:border-slate-800">
        <div className="mx-auto max-w-5xl px-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-semibold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary/90 to-primary">Supported Platforms</h2>
          </div>
          <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-6 sm:gap-x-12">
            {logos.map((logo, index) => (
              logo.tooltip ? (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <div className="filter grayscale hover:grayscale-0 hover:brightness-110 transition-all duration-300">
                      <img
                        className={`${logo.height} w-fit max-w-28 transition-transform duration-300 hover:scale-110 ${logo.additionalClasses || ''} cursor-help`}
                        alt={logo.alt}
                        width="auto"
                        src={logo.src}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>{logo.tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div key={index} className="filter grayscale hover:grayscale-0 hover:brightness-110 transition-all duration-300">
                  <img
                    className={`${logo.height} w-fit max-w-28 transition-transform duration-300 hover:scale-110 ${logo.additionalClasses || ''}`}
                    alt={logo.alt}
                    width="auto"
                    src={logo.src}
                  />
                </div>
              )
            ))}
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
};

export default PlatformSupported;