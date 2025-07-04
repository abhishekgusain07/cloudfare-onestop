"use client";
import { useState, useEffect } from "react";
import { NavbarDemo } from "@/components/navbar";
import Pricing from "@/components/pricing";
import Image from "next/image";
import Link from "next/link";
import ProblemSection from "./components/problem";
import SolutionSection from "./components/solution";
import Footer from "./components/footer";
import PlatformSupported from "./components/techused";
import Announcement from "./components/announcement";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import type { LucideIcon } from "lucide-react";
import { useFeedbackModal } from "@/hooks/useFeedbackModal";
import { useUser } from "@/hooks/useUser";
import HeroSectionV1 from "@/components/homepage/herosection";
import FeatureShowcase from "./components/features";

export default function Home() {
  const [showAnnouncement, setShowAnnouncement] = useState(true);
  const { user } = useUser();
  const { openFeedbackModal, FeedbackModalComponent } = useFeedbackModal(user?.id);
  
  useEffect(() => {
    // Check if the announcement has been dismissed before
    const announcementDismissed = localStorage.getItem('announcement_dismissed');
    if (!announcementDismissed) {
      setShowAnnouncement(true);
    }
  }, []);
  
  const handleAnnouncementDismiss = () => {
    // Store the dismissal in localStorage so it stays dismissed on refresh
    localStorage.setItem('announcement_dismissed', 'true');
    setShowAnnouncement(false);
  };
  
  const announcement = {
    message: "We value your input! Please",
    link: {
      text: "share your feedback",
      url: "#feedback"
    },
    emoji: "💬"
  };

  // Handler for the announcement link click
  const handleFeedbackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    openFeedbackModal();
  };

  const features: Array<{
    title: string;
    description: string;
    link: string;
    icon?: LucideIcon;
  }> = [
    {
      title: "Authentication",
      description:
        "Complete auth system with email, social login, magic links, and MFA support for secure user management.",
      link: "#auth",
    },
    {
      title: "Payments",
      description:
        "Stripe integration with subscription management, pricing tiers, and billing portal for smooth revenue collection.",
      link: "#payments",
    },
    {
      title: "Analytics",
      description:
        "Built-in analytics with PostHog and error tracking with Sentry to monitor user behavior and application health.",
      link: "#analytics",
    },
    {
      title: "Database",
      description:
        "Serverless PostgreSQL with Neon and Drizzle ORM for type-safe database operations with automatic scaling.",
      link: "#database",
    },
    {
      title: "UI Components",
      description:
        "Beautiful, accessible UI components built with Radix UI and styled with Tailwind CSS for rapid development.",
      link: "#ui",
    },
    {
      title: "Deployment",
      description:
        "Optimized for deployment on Vercel with continuous integration and automatic preview deployments.",
      link: "#deployment",
    },
  ];

  return (
    <div className="flex flex-col min-h-screen">
      {/* <Announcement 
        show={showAnnouncement} 
        message={announcement.message}
        link={announcement.link}
        emoji={announcement.emoji}
        onDismiss={handleAnnouncementDismiss}
        onLinkClick={handleFeedbackClick}
      /> */}
      <NavbarDemo>
        {/* Hero Section */}
        <main className="flex-grow">
          <HeroSectionV1 />
        </main>
        
        <PlatformSupported />
        {/* Features Section */}
        <section id="features" className="py-16 px-4 md:px-8 lg:px-16 bg-secondary/20">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold text-center mb-16">Everything You Need</h2>
            <HoverEffect items={features} />
          </div>
        </section>

        <FeatureShowcase />

        <ProblemSection />

        <SolutionSection />
        {/* Pricing Section */}
        <section className="py-16 px-4 md:px-8 lg:px-16">
          <Pricing />
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 md:px-8 lg:px-16 bg-primary/5">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Launch your SaaS in record time with our production-ready template.
            </p>
            <Link href="/sign-up" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3 rounded-md font-medium inline-block">
              Start Building Now
            </Link>
          </div>
        </section>
        <Footer />
      </NavbarDemo>
      
      {/* Render the feedback modal */}
      <FeedbackModalComponent />
    </div>
  );
}
