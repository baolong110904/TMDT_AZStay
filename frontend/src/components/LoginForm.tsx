"use client";

import { useState } from "react";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email || !password) {
      setError("Please enter email and password.");
      return;
    }
    // TODO: Replace with your authentication logic
    alert(`Logged in as ${email}`);
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
        autoComplete="current-password"
      />
      {error && <div className="text-red-500 text-sm">{error}</div>}
      <button
        type="submit"
        className="bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700"
      >
        Login
      </button>
    </form>
  );
}