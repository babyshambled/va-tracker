import { useState, useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import { supabase } from './lib/supabaseClient'
import { useProfile } from './hooks/useProfile'
import RoleSelection from './components/onboarding/RoleSelection'
import ProfileSetup from './components/onboarding/ProfileSetup'
import VADashboard from './components/va/VADashboard'
import BossDashboard from './components/boss/BossDashboard'
import AcceptInvitation from './components/invitation/AcceptInvitation'
import CompleteInvitation from './components/invitation/CompleteInvitation'
import Settings from './components/boss/Settings'

function MainApp() {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const { profile, loading: profileLoading, createProfile } = useProfile(user)

  // Onboarding state
  const [onboardingStep, setOnboardingStep] = useState(null) // 'role' | 'profile' | null
  const [selectedRole, setSelectedRole] = useState(null)

  // View mode (for bosses to switch between boss and VA views)
  const [viewMode, setViewMode] = useState('boss') // 'boss' | 'va'

  useEffect(() => {
    // Check active sessions and sets the user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setAuthLoading(false)
    })

    // Listen for changes on auth state (login, logout, etc.)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // Determine onboarding state
  useEffect(() => {
    if (!authLoading && !profileLoading && user) {
      if (!profile) {
        // New user - needs onboarding
        setOnboardingStep('role')
      } else {
        // Existing user - go to main app
        setOnboardingStep(null)
      }
    }
  }, [user, profile, authLoading, profileLoading])

  const handleRoleSelect = (role) => {
    setSelectedRole(role)
    setOnboardingStep('profile')
  }

  const handleProfileComplete = async (profileData) => {
    const result = await createProfile(profileData)
    if (result.success) {
      setOnboardingStep(null)
      // Refresh page to load main app
      window.location.reload()
    } else {
      alert('Error creating profile: ' + result.error)
    }
  }

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
    })
    if (error) console.error('Error logging in:', error.message)
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('Error logging out:', error.message)
  }

  // Loading state
  if (authLoading || (user && profileLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
          <div className="text-lg text-gray-600">Loading...</div>
        </div>
      </div>
    )
  }

  // Not authenticated - show login
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="text-5xl mb-4">📊</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">VA Tracker</h1>
            <p className="text-lg text-gray-600">
              Track your VA's LinkedIn outreach in real-time
            </p>
          </div>

          {/* Login Card */}
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Sign in to get started
            </h2>

            <button
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 py-4 px-6 border-2 border-gray-300 rounded-xl font-semibold text-gray-700 hover:border-primary-500 hover:bg-primary-50 transition-all shadow-sm hover:shadow-md"
            >
              <svg className="w-6 h-6" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>

            <p className="text-center text-sm text-gray-500 mt-6">
              Secure authentication powered by Google
            </p>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 grid grid-cols-3 gap-4 text-center text-sm text-gray-600">
            <div>
              <div className="text-2xl mb-1">🔒</div>
              <div>Encrypted</div>
            </div>
            <div>
              <div className="text-2xl mb-1">⚡</div>
              <div>Real-time</div>
            </div>
            <div>
              <div className="text-2xl mb-1">📈</div>
              <div>Analytics</div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Onboarding flow
  if (onboardingStep === 'role') {
    return <RoleSelection onSelect={handleRoleSelect} />
  }

  if (onboardingStep === 'profile') {
    return (
      <ProfileSetup
        role={selectedRole}
        onComplete={handleProfileComplete}
        onBack={() => setOnboardingStep('role')}
      />
    )
  }

  // Main App (after onboarding complete)
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="text-2xl">📊</div>
              <h1 className="text-xl font-bold text-gray-900">VA Tracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">{profile?.full_name || user.email}</span>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${profile?.role === 'va' ? 'bg-blue-100 text-blue-700' : 'bg-primary-100 text-primary-700'}`}>
                {profile?.role}
              </span>

              {/* View Switcher (Boss only) */}
              {profile?.role === 'boss' && (
                <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('boss')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition ${
                      viewMode === 'boss'
                        ? 'bg-white text-emerald-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    BOSS
                  </button>
                  <button
                    onClick={() => setViewMode('va')}
                    className={`px-3 py-1 rounded text-xs font-semibold transition ${
                      viewMode === 'va'
                        ? 'bg-white text-blue-700 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    VA
                  </button>
                </div>
              )}

              <button
                onClick={signOut}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/settings" element={<Settings userId={user.id} />} />
          <Route path="/" element={
            profile?.role === 'va' ? (
              <VADashboard user={user} profile={profile} />
            ) : viewMode === 'va' ? (
              <VADashboard user={user} profile={profile} />
            ) : (
              <BossDashboard user={user} profile={profile} />
            )
          } />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/accept-invitation" element={<AcceptInvitation />} />
      <Route path="/complete-invitation" element={<CompleteInvitation />} />
      <Route path="*" element={<MainApp />} />
    </Routes>
  )
}
