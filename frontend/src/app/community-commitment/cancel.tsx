"use client";


import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";

interface CancelCommitmentProps {
  onGoBack: () => void;
}

export default function CancelCommitment({ onGoBack }: CancelCommitmentProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white px-2 py-8">
      <div className="bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col mx-auto" style={{ maxWidth: 540, minWidth: 340, width: "100%", padding: "36px 32px 32px 32px" }}>
        <button
          className="mb-4 flex items-center text-gray-700 hover:text-blue-700 font-medium focus:outline-none"
          onClick={onGoBack}
        >
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          <span>Back</span>
        </button>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Cancel signup?</h1>
        <p className="text-gray-700 mb-6">Declining this commitment means that you won’t have an AZStay account, though you can still browse the site.</p>
        <div className="mb-4">
          <div className="font-semibold text-gray-900 mb-1">Why did AZStay create this commitment?</div>
          <div className="text-gray-700 mb-3">This commitment is an important step towards creating a global community where everyone can truly belong. Discrimination prevents hosts, guests, and their families from feeling included and welcomed, and we have no tolerance for it. Building an AZStay where everyone can belong hinges on knowing that everyone in our community understands this mission and agrees to help us achieve it.</div>
          <div className="font-semibold text-gray-900 mb-1">What happens to my future reservations if I decline?</div>
          <div className="text-gray-700 mb-3">Any future reservations will be canceled. Your reservation will be refunded according to the host’s cancellation policy. <a href="#" className="underline hover:text-blue-700 font-semibold">Learn more.</a></div>
          <div className="font-semibold text-gray-900 mb-1">What if I change my mind after declining?</div>
          <div className="text-gray-700 mb-3">Once your account has been canceled, you can always sign up again if you change your mind. You’ll still be required to accept the commitment.</div>
          <div className="font-semibold text-gray-900 mb-1">What if I have other questions related to the commitment?</div>
          <div className="text-gray-700">Check out our detailed FAQs in the <a href="#" className="underline hover:text-blue-700 font-semibold">Nondiscrimination Help Center</a>. You can also review our <a href="#" className="underline hover:text-blue-700 font-semibold">host resources</a>, which cover frequently asked questions by hosts about AZStay’s Nondiscrimination Policy.</div>
        </div>
        <button
          className="w-full bg-black text-white py-3 rounded-lg font-semibold text-lg mb-3 transition hover:bg-gray-900 focus:outline-none cursor-pointer"
          onClick={onGoBack}
        >
          Go back
        </button>
        <button
          className="w-full border border-gray-400 text-gray-900 py-3 rounded-lg font-semibold text-lg transition hover:bg-gray-100 focus:outline-none cursor-pointer"
          onClick={() => router.push('/home')}
        >
          Cancel signup
        </button>
      </div>
    </div>
  );
}
