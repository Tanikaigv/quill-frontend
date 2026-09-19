import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { User, Mail, Lock } from "lucide-react";
import AuthLayout from "../../components/auth/AuthLayout";
import Field from "../../components/common/Field";
import Button from "../../components/common/Button";
import { useAuth } from "../../context/AuthContext";

export default function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 6) {
      setError("Password should be at least 6 characters.");
      return;
    }
    setLoading(true);
    try {
      await signup({ name, email, password });
      navigate("/dashboard", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start researching Gold, Bitcoin and NVIDIA in minutes."
      footer={
        <>
          Already have an account?{" "}
          <Link to="/login" className="font-medium text-primary hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full name" icon={User} value={name} onChange={setName} placeholder="Alex Rivera" required />
        <Field label="Email" type="email" icon={Mail} value={email} onChange={setEmail} placeholder="you@example.com" required />
        <Field label="Password" type="password" icon={Lock} value={password} onChange={setPassword} placeholder="At least 6 characters" required />

        {error && <p className="rounded-lg bg-loss-soft px-3 py-2 text-sm text-loss">{error}</p>}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Creating account…" : "Create account"}
        </Button>
      </form>

      <p className="mt-4 text-xs leading-relaxed text-ink-faint">
        This workspace uses simulated market data for research and demonstration. Nothing here is
        investment advice, and historical results never guarantee future performance.
      </p>
    </AuthLayout>
  );
}
