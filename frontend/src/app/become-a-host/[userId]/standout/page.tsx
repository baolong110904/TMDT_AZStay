"use client";

// use a streamed video for the illustration instead of a static image
import { useEffect, useCallback } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useHostFlow } from "@/components/HostFlowProvider";

export default function StandoutPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = params?.userId as string;
  const propertyId = searchParams?.get("property_id");

  const totalSteps = 7;
  const currentStep = 5; // continuing after floor-plan (step 4)

  const { setCanProceed, setNav } = useHostFlow();
  const { setOnNext } = useHostFlow() as any;

  const handleNext = useCallback(async () => {
    // simply navigate to photos and preserve property_id
    if (propertyId) {
      router.push(`/become-a-host/${userId}/photo?property_id=${encodeURIComponent(String(propertyId))}`);
    } else {
      router.push(`/become-a-host/${userId}/photo`);
    }
  }, [propertyId, router, userId]);

  useEffect(() => {
    setNav({ next: `/become-a-host/${userId}/photo`, prev: `/become-a-host/${userId}/floor-plan`, currentStep, totalSteps });
    // nothing to fill on this page - allow proceeding
    setCanProceed(true);
    setOnNext(() => handleNext);
    return () => setOnNext(null);
  }, [userId, setCanProceed, setNav, setOnNext, handleNext]);

  const handleBack = () => {
    if (propertyId) {
      router.push(`/become-a-host/${userId}/floor-plan?property_id=${encodeURIComponent(String(propertyId))}`);
    } else {
      router.push(`/become-a-host/${userId}/floor-plan`);
    }
  };

  const pct = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="bg-white flex flex-col">
      <div className="flex-1 flex items-center">
        <div className="container mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left content */}
            <div className="lg:col-span-6">
              <div className="text-sm text-gray-500 mb-4">Step 2</div>
              <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">Make your place<br/>stand out</h1>
              <p className="text-gray-600 text-lg max-w-xl">
                In this step, you will add some of the amenities your place offers, plus 5 or more photos. Then,
                you will create a title and description.
              </p>
            </div>

            {/* Right illustration */}
            <div className="lg:col-span-6 flex justify-center lg:justify-end">
              <div className="w-full max-w-lg lg:max-w-xl transform translate-y-4 lg:translate-y-0">
                <div className="rounded-xl overflow-hidden">
                  <video
                    src="https://stream.media.muscache.com/H0101WTUG2qWbyFhy02jlOggSkpsM9H02VOWN52g02oxhDVM.mp4?v_q=high"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="object-cover w-full h-96 lg:h-[520px]"
                    style={{ transform: 'scale(1.2)', transformOrigin: 'center' }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}