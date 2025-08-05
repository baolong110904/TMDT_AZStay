import React from "react";
import Avatar from "../Avatar";
import { getRoleName } from "../../utils/role";
import comment from "@/assets/comment.png";
import { UserProfile } from "../Type/UserProfileProps";

export default function AboutMeSection({
  user,
  onEdit,
}: {
  user: UserProfile;
  onEdit: () => void;
}) {
  return (
    <section>
      <div className="flex items-center justify-between mb-8">
        <h2 className="text-3xl font-bold">About me</h2>
        <button
          onClick={onEdit}
          className="bg-gray-100 px-4 py-2 rounded text-lg font-medium hover:bg-gray-200"
        >
          Edit
        </button>
      </div>
      <div className="flex gap-12 items-center mb-8">
        <div className="shadow-lg rounded-2xl bg-white px-12 py-8 flex flex-col items-center min-w-[320px]">
          <Avatar name={user.name} size={96} />
          <h3 className="mt-6 text-2xl font-bold">{user.name || "admin"}</h3>
          <p className="text-lg text-gray-500 mt-2">{getRoleName(user.roleId)}</p>
        </div>
        <div className="ml-8 w-full max-w-[340px]">
          <h4 className="text-xl font-bold mb-2">Complete your profile</h4>
          <p className="text-gray-600 mb-4">
            Your Airbnb profile is an important part of every reservation. Complete yours to help other hosts and guests get to know you.
          </p>
          <button
            className="font-bold px-6 py-3 rounded-md text-lg text-white"
            style={{
              background: "linear-gradient(90deg, #007cf0 0%, #00dfd8 100%)",
            }}
          >
            Get started
          </button>
        </div>
      </div>
      <hr className="my-6" style={{ borderTop: "2px solid #e0e0e0", opacity: 0.5 }} />
      <div className="flex items-center gap-4 mt-4">
        <span>
          <img src={comment.src} alt="review" width={28} height={28} />
        </span>
        <span className="text-lg font-medium">Reviews I’ve written</span>
      </div>
    </section>
  );
}