import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { BookOpen, Sparkles, User, Lock, Mail, ArrowRight } from 'lucide-react';

export default function AuthPage() {
  const { signIn, signUp, signInWithGoogle, signInAsDemo } = useAuth();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Google/Supabase can return OAuth failures in either the URL query or
    // the fragment. With HashRouter, the fragment may also contain the route.
    const hashContent = window.location.hash.replace(/^#\/?/, '');
    const fragmentParams = hashContent.includes('?')
      ? hashContent.slice(hashContent.indexOf('?') + 1)
      : hashContent;
    const params = new URLSearchParams([
      window.location.search.replace(/^\?/, ''),
      fragmentParams,
    ].filter(Boolean).join('&'));
    const oauthError = params.get('error_description') || params.get('error');

    if (oauthError) {
      setError(`No se pudo completar el acceso con Google: ${oauthError}`);
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage('');
    setLoading(true);

    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, name);
      }

      if (result.error) throw result.error;
      if (!isLogin && !result.data?.session) {
        setIsLogin(true);
        setSuccessMessage('Tu cuenta fue creada. Revisa tu correo para confirmar el registro antes de iniciar sesión.');
        return;
      }
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Error al procesar la solicitud');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSignIn = () => {
    signInAsDemo();
    navigate('/dashboard', { replace: true });
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setLoading(true);
    try {
      const { error } = await signInWithGoogle();
      if (error) throw error;
    } catch (err) {
      setError(err.message || 'Error al conectar con Google');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-600 via-teal-700 to-emerald-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-emerald-100">
        <div className="p-8">
          {/* Cabecera / Logo */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 shadow-inner mb-3">
              <BookOpen size={34} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">ContaBeni</h1>
            <p className="text-sm text-gray-500 mt-1">Sistema Contable para Micronegocios del Beni</p>
            <span className="inline-block mt-2 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold rounded-full">
              UABJB • TecnoFeria 2026
            </span>
          </div>

          {/* Botón de Acceso Rápido / Modo Piloto destacado */}
          <div className="mb-6 p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl text-center shadow-sm">
            <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-2 flex items-center justify-center gap-1.5">
              <Sparkles size={14} className="text-emerald-600" />
              Acceso Inmediato sin Contraseña
            </p>
            <button
              onClick={handleDemoSignIn}
              type="button"
              className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl transition-all shadow-md hover:shadow-lg active:scale-[0.99] text-sm"
            >
              🏪 Ingresar como "Comercial El Beni"
              <ArrowRight size={16} />
            </button>
          </div>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-white text-gray-400 uppercase font-medium">O con tu cuenta</span>
            </div>
          </div>

          {/* Formulario */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div role="alert" className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-sm font-medium">
                {error}
              </div>
            )}
            {successMessage && (
              <div role="status" className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded-xl text-sm font-medium">
                {successMessage}
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Nombre o Negocio</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    type="text"
                    required={!isLogin}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-colors"
                    placeholder="Ej. Tienda Doña María"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Correo Electrónico</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-colors"
                  placeholder="usuario@contabeni.bo"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm transition-colors"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 hover:bg-black text-white font-semibold py-2.5 px-4 rounded-xl transition-colors disabled:opacity-50 text-sm shadow"
            >
              {loading ? 'Cargando...' : isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </form>

          {/* Opciones secundarias */}
          <div className="mt-6 pt-5 border-t border-gray-100 space-y-3">
            <button 
              onClick={handleGoogleSignIn}
              disabled={loading}
              type="button"
              className="w-full flex items-center justify-center gap-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-2 px-4 rounded-xl transition-colors text-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Continuar con Google
            </button>

            <div className="text-center text-sm text-gray-600 pt-1">
              {isLogin ? '¿No tienes una cuenta?' : '¿Ya tienes una cuenta?'}{' '}
              <button
                type="button"
                onClick={() => { setIsLogin(!isLogin); setError(null); setSuccessMessage(''); }}
                className="text-emerald-600 font-bold hover:underline"
              >
                {isLogin ? 'Regístrate' : 'Inicia Sesión'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
