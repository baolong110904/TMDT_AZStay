import React from "react";
import Avatar from "./Avatar";

export default function EditProfileSection({
  user,
  imgUrl,
  password,
  error,
  success,
  profileFields,
  handleAvatarChange,
  handleFieldChange,
  handleSave,
  handleCancel,
  setUser,
  setPassword,
  PROFILE_EDIT_FIELDS,
}: any) {
  return (
    <section>
      <div className="flex items-center mb-8 gap-8">
        <div className="flex flex-col items-center">
          <Avatar name={user.name} size={120} />
          <label className="mt-4 flex items-center gap-2 bg-white px-4 py-2 rounded-2xl shadow cursor-pointer">
            <span role="img" aria-label="camera">📷</span>
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
            Hosts and guests can see your profile and it may appear across Airbnb to help us build trust in our community. <span className="underline cursor-pointer">Learn more</span>
          </p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-12 gap-y-4 mt-8 mb-8">
        {PROFILE_EDIT_FIELDS.map((field: any) => (
          <div key={field.key} className="flex items-center gap-3">
            <span className="text-2xl">{field.icon}</span>
            <input
              type="text"
              placeholder={field.label}
              value={profileFields[field.key] || ""}
              onChange={(e) => handleFieldChange(field.key, e.target.value)}
              className="border-b border-gray-300 px-2 py-1 w-full bg-transparent outline-none text-lg"
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            value={user.name || ""}
            onChange={(e) => setUser((prev: any) => ({ ...prev, name: e.target.value }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={user.email || ""}
            onChange={(e) => setUser((prev: any) => ({ ...prev, email: e.target.value }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            disabled
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Gender</label>
          <select
            value={user.gender || ""}
            onChange={(e) => setUser((prev: any) => ({ ...prev, gender: e.target.value }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          >
            <option value="" disabled>Select Gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Phone</label>
          <input
            type="tel"
            value={user.phone || ""}
            onChange={(e) => setUser((prev: any) => ({ ...prev, phone: e.target.value }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">DOB</label>
          <input
            type="date"
            value={user.dob || ""}
            onChange={(e) => setUser((prev: any) => ({ ...prev, dob: e.target.value }))}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">New Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm"
            placeholder="Enter new password"
          />
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