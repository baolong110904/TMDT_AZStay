import api from '@/lib/axios';
import { supabase } from './supabase';


export async function googleLogin(router: any, setLoading: (val: boolean) => void, setError: (val: string | null) => void) {
  try {
    setLoading(true);
    setError(null);

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: window.location.origin + "/auth", // where you handle the redirect
      },
    });

    if (error) throw error;


  } catch (err: any) {
    console.error("Google login error:", err.message);
    setError(err.message || "Google login failed");
  } finally {
    setLoading(false);
  }
}

export async function syncWithBackend(router: any) {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    console.error("No Supabase session:", error);
    return;
  }

  try {
    const res = await api.post("/user/sync", { supabaseToken: session.access_token });
    const { token, user } = res.data;

    // store token and user data
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify({
      ...user,
      id: user.user_id,
      avatar: user.avatar_url || "/default-avatar.png",
    }));

    router.push("/home");
  } catch (err: any) {
    console.error("Backend sync failed:", err.response?.data || err.message);
  }
}
