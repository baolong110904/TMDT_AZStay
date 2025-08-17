"use client";
import { useEffect } from "react";
import { useHostFlow } from "@/components/HostFlowProvider";
import { useRouter, useParams } from "next/navigation";

export default function AboutYourPlacePage() {
  const params = useParams();
  const userId = params?.userId;
  const totalSteps = 7;
  const currentStep = 1;
  const { setCanProceed, setNav } = useHostFlow();

  useEffect(() => {
    setNav({ next: `/become-a-host/${userId}/structure`, prev: undefined, currentStep, totalSteps });
    // About step: allow immediate proceed
    setCanProceed(true);
    return () => setCanProceed(false);
  }, [userId, setCanProceed, setNav]);

  return (
    <div className="flex-1 flex flex-row items-center justify-between px-24 pt-8">
        {/* Left: Step info */}
        <div className="flex-1 flex flex-col justify-center">
          <span className="text-lg text-gray-700 mb-2">Step {currentStep}</span>
          <h1 className="text-5xl font-bold text-gray-900 mb-6">Tell us about your place</h1>
          <p className="text-xl text-gray-600 max-w-xl">
            In this step, we will ask you which type of property you have and if guests will book the entire place or just a room. Then let us know the location and how many guests can stay.
          </p>
        </div>
        {/* Right: Video Illustration */}
        <div className="flex-1 flex justify-center items-center">
          <video
            src="https://stream.media.muscache.com/zFaydEaihX6LP01x8TSCl76WHblb01Z01RrFELxyCXoNek.mp4?v_q=high"
            autoPlay
            loop
            muted
            playsInline
            style={{ maxWidth: 580, maxHeight: 400, transform: 'scale(1.5)' }}
          />
        </div>
  </div>
  );
}