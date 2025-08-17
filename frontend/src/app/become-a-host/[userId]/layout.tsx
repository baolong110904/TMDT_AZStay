"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import HostProgress from "@/components/HostProgress";
import { HostFlowProvider, useHostFlow } from "@/components/HostFlowProvider";

function HostFooter() {
  const router = useRouter();
  const { nav, canProceed, onNext } = useHostFlow() as any;
  const [skipRender, setSkipRender] = React.useState(false);

  useEffect(() => {
    try {
      // dedupe guard: if another footer already mounted, skip rendering this instance
      if (typeof window !== "undefined") {
        if ((window as any).__AZSTAY_HOST_FOOTER_EXISTS) {
          console.warn("[HostFooter] duplicate detected - skipping this instance");
          setSkipRender(true);
          return;
        }
        (window as any).__AZSTAY_HOST_FOOTER_EXISTS = true;
      }
      console.log("HostFooter mounted", { nav, canProceed });
    } catch {}

    return () => {
      try {
        if (typeof window !== "undefined") {
          (window as any).__AZSTAY_HOST_FOOTER_EXISTS = false;
        }
        console.log("HostFooter unmounted");
      } catch {}
    };
  }, [nav, canProceed]);

  if (skipRender) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none" data-host-footer>
      <div className="w-full bg-white pointer-events-auto">
        <div className="px-4 md:px-0 -mt-3 pointer-events-none">
          <div className="pointer-events-auto">
            <HostProgress totalSteps={nav?.totalSteps || 4} currentStep={nav?.currentStep || 1} />
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <button className="text-base text-gray-700 underline hover:text-black" onClick={() => router.back()}>
            Back
          </button>
          <button
            className={`text-white font-semibold text-lg px-6 py-3 rounded-lg shadow-md transition focus:outline-none focus:ring-2 focus:ring-blue-200 disabled:opacity-60 disabled:cursor-not-allowed ${
              !canProceed
                ? "bg-gray-300 text-gray-600"
                : "bg-gradient-to-r from-blue-500 via-blue-600 to-indigo-700 hover:brightness-105"
            }`}
            disabled={!canProceed}
            aria-disabled={!canProceed}
            onClick={async () => {
              if (!canProceed) return;
              try {
                if (onNext) {
                  await onNext();
                } else if (nav?.next) {
                  router.push(nav.next);
                }
              } catch (e) {
                console.error(e);
              }
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <HostFlowProvider>
      {/* Header shown on every step: logo, question placeholder, Save & Exit */}
        <div className="w-full bg-white">
          <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
            {/* Left: larger logo */}
            <div className="flex items-center">
              <img src="/logo.png" alt="logo" className="h-12 w-auto" />
            </div>

            {/* Center: keep minimal to match design */}
            <div className="flex-1" />

            {/* Right: Questions and Save & exit buttons (pill style) */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => alert("Questions? Open help or FAQ here.")}
                className="rounded-full border border-gray-200 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
              >
                Questions?
              </button>

              <SaveExitButton />
            </div>
          </div>
        </div>
  {/* Ensure page content can scroll and is not hidden behind the fixed footer */}
  <main className="min-h-screen pb-28">{children}</main>

  <HostFooter />
    </HostFlowProvider>
  );
}

function SaveExitButton() {
  const router = useRouter();
  const { onNext } = useHostFlow() as any;

  const handleSaveExit = async () => {
    const ok = confirm("Save current progress and exit?");
    if (!ok) return;
    try {
      if (onNext) await onNext();
    } catch (e) {
      console.error("Save failed", e);
    }
    router.push("/");
  };

  return (
    <button
      onClick={handleSaveExit}
      className="rounded-full px-4 py-2 text-sm bg-white border border-gray-200 shadow-sm hover:brightness-95"
    >
      Save & exit
    </button>
  );
}