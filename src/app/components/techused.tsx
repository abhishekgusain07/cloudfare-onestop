import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const PlatformSupported = () => {
  const logos = [
    {
      name: "Instagram",
      height: "h-12",
      src: "https://res.cloudinary.com/dowiygzq3/image/upload/v1741087634/108468352_rdoifc.png",
      alt: "Instagram",
      additionalClasses: "rounded-md",
      tooltip: "Instagram"
    },
    {
      name: "Tiktok",
      height: "h-12",
      src: "https://res.cloudinary.com/dowiygzq3/image/upload/v1741087544/typescript_wrgqvm.webp",
      alt: "Tiktok",
      tooltip: "Tiktok"
    },
    {
      name: "Facebook",
      height: "h-12",
      src: "https://res.cloudinary.com/dowiygzq3/image/upload/v1740732044/163827765_qn4qmt.png",
      alt: "Facebook",
      additionalClasses: "rounded-md",
      tooltip: "Facebook"
    },
    {
      name: "Linkedin",
      height: "h-12",
      src: "https://res.cloudinary.com/dowiygzq3/image/upload/v1741087611/neon-logomark-dark-color_1_bzq0v2.svg",
      alt: "Linkedin",
      additionalClasses: "rounded-md",
      tooltip: "Linkedin"
    },
    {
      name: "Twitter",
      height: "h-5",
      src: "/nextjs.svg",
      alt: "Twitter"
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