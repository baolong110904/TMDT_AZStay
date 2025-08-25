"use client";

import { useState } from "react";
import api from "@/lib/axios";
import { useRouter } from "next/navigation";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [gender, setGender] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [dob, setDob] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (!name || !email || !password || !gender || !phone || !role || !dob) {
      setError("All fields are required.");
      setLoading(false);
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(email)) {
      setError("Please enter a valid email address.");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      setLoading(false);
      return;
    }
    if (!/^(0[3|5|7|8|9])+([0-9]{8})\b/.test(phone)) {
      setError("Please enter a valid Vietnamese phone number (e.g., 09xxxxxxxx or 07xxxxxxxx).");
      setLoading(false);
      return;
    }
    if (role !== "2" && role !== "4") {
      setError("Role must be Guest (2) or Host (4).");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("/user/signup", {
        name,
        email,
        password,
        gender,
        phone,
        role: parseInt(role),
        dob,
      });

      console.log("Signed up:", response.data);
      const { token, userId, user } = response.data;

      if (token && userId && user) {
        localStorage.setItem("token", token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...user,
            id: userId,
            avatar: "/default-avatar.png",
          })
        );
        setSuccess("Account created successfully! An email has been sent. Redirecting to Home...");
        setTimeout(() => {
          router.push("/home");
        }, 2000);
      } else {
        throw new Error("Invalid response from server");
      }
    } catch (err: any) {
      console.error("Signup error:", err.response?.data || err.message);
      setError(err.response?.data?.message || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <input
        type="text"
        placeholder="Name"
        className="w-full px-4 py-2 border rounded-3xl text-black"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <input
        type="email"
        placeholder="Email"
        className="w-full px-4 py-2 border rounded-3xl text-black"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full px-4 py-2 border rounded-3xl text-black"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <select
        className="w-full px-4 py-2 border rounded-3xl text-black"
        value={gender}
        onChange={(e) => setGender(e.target.value)}
        required
      >
        <option value="" disabled>
          Select Gender
        </option>
        <option value="male">Male</option>
        <option value="female">Female</option>
        <option value="other">Other</option>
      </select>
      <input
        type="tel"
        placeholder="Phone (valid Vietnam phone number)"
        className="w-full px-4 py-2 border rounded-3xl text-black"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        required
      />
      <select
        className="w-full px-4 py-2 border rounded-3xl text-black"
        value={role}
        onChange={(e) => setRole(e.target.value)}
        required
      >
        <option value="" disabled>
          Select Role
        </option>
        <option value="2">Guest</option>
        <option value="4">Host</option>
      </select>
      <input
        type="date"
        className="w-full px-4 py-2 border rounded-3xl text-black"
        value={dob}
        onChange={(e) => setDob(e.target.value)}
        required
      />

      {error && <p className="text-red-500">{error}</p>}

      {success && (
        <div className="bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-md flex items-center animate-fade-in">
          <svg
            className="w-5 h-5 mr-2 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          <span>{success}</span>
        </div>
      )}
      
      <button
        type="submit"
        disabled={loading}
        className="w-full bg-green-600 text-white py-2 rounded-3xl hover:bg-green-700 disabled:opacity-60"
      >
        {loading ? "Signing up..." : "Sign Up"}
      </button>
    </form>
  );
}
