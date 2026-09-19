import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Mail, Lock } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import Field from "../../components/common/Field";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";

const DEMO_USER = { name: "Demo Analyst", email: "demo@quill.app", password: "quill-demo" };

export default function LoginPage() {
  const { login, signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname ?? "/dashboard";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await login({ email, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setError("");
    setLoading(true);
    try {
      try {
        await login({ email: DEMO_USER.email, password: DEMO_USER.password });
      } catch {
        await signup(DEMO_USER);
      }
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to continue your research."
      footer={
        <>
          Don't have an account?{" "}
          <Link to="/signup" className="font-medium text-primary hover:underline">
            Create one
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email" type="email" icon={Mail} value={email} onChange={setEmail} placeholder="you@example.com" required />
        <Field label="Password" type="password" icon={Lock} value={password} onChange={setPassword} placeholder="••••••••" required />

        {error && (
          <p className="rounded-lg bg-loss-soft px-3 py-2 text-sm text-loss">{error}</p>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Signing in…" : "Sign in"}
        </Button>
      </form>

      <div className="mt-4 flex items-center gap-3 text-xs text-ink-faint">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <Button variant="outline" className="mt-4 w-full" onClick={handleDemo} disabled={loading}>
        Continue with demo account
      </Button>
    </AuthLayout>
  );
}
