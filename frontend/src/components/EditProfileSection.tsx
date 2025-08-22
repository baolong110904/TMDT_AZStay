import React from "react";
import Avatar from "./Avatar";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";

export default function EditProfileSection({
  user,
  imgUrl,
  error,
  success,
  handleAvatarChange,
  handleSave,
  handleCancel,
  setUser,
}: // PROFILE_EDIT_FIELDS,
any) {
  const router = useRouter();
  const handleChangePassword = async () => {
    try {
      // get user info from localStorage
      const storedUser = localStorage.getItem("user");
      if (!storedUser) {
        alert("No user found in localStorage");
        return;
      }

      const parsedUser = JSON.parse(storedUser);
      const email = parsedUser.email;

      await api.post("/user/send-otp", { email });

      router.push("/verify");
    } catch (err: any) {
      console.error("Error sending OTP:", err);
      alert("Failed to send OTP. Please try again.");
    }
  };

  return (
    <section>
      <div className="flex items-center mb-8 gap-8">
        <div className="flex flex-col items-center">
          <Avatar name={user.name} size={120} imgUrl={user.avatar || ""} />
          <label className="mt-4 flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow cursor-pointer">
            <span role="img" aria-label="camera">
              📷
            </span>
            <span className="font-medium">Add</span>
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handleAvatarChange}
            />
          </label>
        </div>
        <div>
          <h2 className="text-3xl font-bold">My profile</h2>
          <p className="text-gray-600 mt-2 max-w-[450px]">
            Hosts and guests can see your profile and it may appear across
            Airbnb to help us build trust in our community.{" "}
            <span className="underline cursor-pointer">Learn more</span>
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            value={user.name || ""}
            onChange={(e) =>
              setUser((prev: any) => ({ ...prev, name: e.target.value }))
            }
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-3xl shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={user.email || ""}
            onChange={(e) =>
              setUser((prev: any) => ({ ...prev, email: e.target.value }))
            }
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-3xl shadow-sm"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Gender
          </label>
          <select
            value={user.gender || ""}
            onChange={(e) =>
              setUser((prev: any) => ({ ...prev, gender: e.target.value }))
            }
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-3xl shadow-sm"
          >
            <option value="" disabled>
              Select Gender
            </option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Phone
          </label>
          <input
            type="tel"
            value={user.phone || ""}
            onChange={(e) =>
              setUser((prev: any) => ({ ...prev, phone: e.target.value }))
            }
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-3xl shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">DOB</label>
          <input
            type="date"
            value={user.dob || ""}
            onChange={(e) =>
              setUser((prev: any) => ({ ...prev, dob: e.target.value }))
            }
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-3xl shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <button
            className="mt-1 cursor-pointer block w-full px-3 py-2 border border-gray-300 rounded-3xl shadow-sm hover:bg-blue-100"
            onClick={handleChangePassword}
          >
            Change your password
          </button>
        </div>
      </div>
      {error && <p className="text-red-500">{error}</p>}
      {success && <p className="text-green-500">{success}</p>}
      <div className="flex justify-end gap-4 mt-8">
        <button
          onClick={handleSave}
          className="bg-black text-white px-10 py-3 rounded font-bold text-lg hover:bg-gray-800"
        >
          Done
        </button>
        <button
          onClick={handleCancel}
          className="bg-gray-200 text-black px-10 py-3 rounded font-bold text-lg hover:bg-gray-300"
        >
          Cancel
        </button>
      </div>
    </section>
  );
}
