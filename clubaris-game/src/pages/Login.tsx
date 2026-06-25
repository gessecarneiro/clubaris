import { useState } from "react";
import { supabase } from "../lib/supabase";
import { sanitizeText, isValidEmail } from "../utils/sanitize";
import { useGameStore } from "../store/gameStore";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [age, setAge] = useState<number | "">("");
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const { setUser, language } = useGameStore();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    const cleanEmail = sanitizeText(email);
    if (!isValidEmail(cleanEmail)) {
      setErrorMsg("Email inválido ou contém caracteres não permitidos.");
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setUser(data.user);
      navigate("/");
    }
    setIsLoading(false);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");

    if (!acceptTerms) {
      setErrorMsg(language === 'pt' ? "Você precisa aceitar os termos de serviço." : "You must accept the terms of service.");
      setIsLoading(false);
      return;
    }

    const cleanEmail = sanitizeText(email);
    if (!isValidEmail(cleanEmail)) {
      setErrorMsg("Email inválido ou contém caracteres não permitidos.");
      setIsLoading(false);
      return;
    }

    if (!age || Number(age) < 18) {
      setErrorMsg(language === 'pt' ? "Você deve ter pelo menos 18 anos." : "You must be at least 18 years old.");
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: {
          age: Number(age)
        }
      }
    });

    if (error) {
      setErrorMsg(error.message);
    } else {
      if (data.user) {
        setUser(data.user);
        navigate("/");
      } else {
        setErrorMsg("Confirme seu e-mail (caso o Supabase exija verificação).");
      }
    }
    setIsLoading(false);
  };


  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-b from-[#001f3f] to-[#000a14] flex flex-col items-center justify-center p-4 relative"
    >
      <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, #ffffff 2px, transparent 2px)', backgroundSize: '64px 64px' }}></div>

      <div className="z-10 bg-white border-4 border-black shadow-[8px_8px_0px_rgba(0,0,0,0.8)] p-8 max-w-sm w-full text-black flex flex-col gap-6">
        <div className="text-center">
          <h1 className="text-[32px] font-black text-[#003366] uppercase tracking-tighter">CLUBARIS</h1>
          <p className="text-[12px] font-bold text-gray-500 uppercase tracking-widest mt-1">Manager Simulator</p>
        </div>

        {errorMsg && (
          <div className="bg-red-200 border-2 border-red-800 text-red-900 p-2 text-[12px] font-bold text-center">
            {errorMsg}
          </div>
        )}

        {!isSignUpMode ? (
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold uppercase tracking-wide">E-mail</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-2 border-black p-2 font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="treinador@exemplo.com"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold uppercase tracking-wide">Senha</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-2 border-black p-2 font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <button 
                type="submit"
                disabled={isLoading}
                className="bg-[#2a7d2a] text-white font-bold text-[14px] uppercase py-3 border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none hover:bg-[#1e5c1e] transition-all disabled:opacity-50"
              >
                {isLoading ? "..." : (language === "pt" ? "Entrar" : "Login")}
              </button>
              <button 
                type="button"
                onClick={() => setIsSignUpMode(true)}
                disabled={isLoading}
                className="bg-gray-200 text-black font-bold text-[14px] uppercase py-3 border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none hover:bg-gray-300 transition-all disabled:opacity-50"
              >
                {language === 'pt' ? 'Criar Nova Conta' : 'Sign Up'}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold uppercase tracking-wide">E-mail</label>
              <input 
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-2 border-black p-2 font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="treinador@exemplo.com"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold uppercase tracking-wide">Senha</label>
              <input 
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-2 border-black p-2 font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div className="flex flex-col gap-1">
              <label className="text-[12px] font-bold uppercase tracking-wide">{language === 'pt' ? 'Idade' : 'Age'}</label>
              <input 
                type="number"
                value={age}
                onChange={(e) => setAge(Number(e.target.value) || "")}
                required
                min={18}
                max={99}
                className="border-2 border-black p-2 font-mono focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="18"
              />
            </div>

            <div className="flex items-center gap-2 mt-2">
              <input 
                type="checkbox" 
                id="terms" 
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500 focus:ring-2 cursor-pointer border-2 border-black"
              />
              <label htmlFor="terms" className="text-[11px] font-bold text-gray-600 cursor-pointer">
                {language === 'pt' ? 'Eu aceito os termos de serviço e política de privacidade' : 'I accept the terms of service and privacy policy'}
              </label>
            </div>

            <div className="flex flex-col gap-2 mt-4">
              <button 
                type="submit"
                disabled={isLoading || !acceptTerms}
                className="bg-[#2a7d2a] text-white font-bold text-[14px] uppercase py-3 border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,0.5)] active:translate-y-[2px] active:shadow-none hover:bg-[#1e5c1e] transition-all disabled:opacity-50"
              >
                {isLoading ? "..." : (language === "pt" ? "Registrar" : "Register")}
              </button>
              <button 
                type="button"
                onClick={() => setIsSignUpMode(false)}
                disabled={isLoading}
                className="bg-transparent text-gray-500 font-bold text-[12px] uppercase py-2 hover:text-black transition-colors"
              >
                {language === 'pt' ? 'Voltar para Login' : 'Back to Login'}
              </button>
            </div>
          </form>
        )}
      </div>
    </motion.div>
  );
}
