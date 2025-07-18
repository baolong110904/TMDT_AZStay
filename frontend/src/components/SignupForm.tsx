"use client";

import { useState } from "react";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password || !confirm) {
      setError("Please fill all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    // TODO: Replace with your signup logic
    alert(`Signed up as ${email}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-7 text-gray-600">
      <input
        type="email"
        placeholder="Email"
        className="border rounded px-3 py-2"
        value={email}
        onChange={e => setEmail(e.target.value)}
        autoComplete="email"
      />
      <input
        type="password"
        placeholder="Password"
        className="border rounded px-3 py-2"
        value={password}
        onChange={e => setPassword(e.target.value)}
        autoComplete="new-password"
      />
      <input
        type="password"
        placeholder="Confirm Password"
        className="border rounded px-3 py-2"
        value={confirm}
        onChange={e => setConfirm(e.target.value)}
        autoComplete="new-password"
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        className="bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700"
      >
        Sign Up
      </button>
    </form>
  );
}