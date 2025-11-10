import { useState } from 'react'

export default function RoleSelection({ onSelect }) {
  const [selected, setSelected] = useState(null)

  const roles = [
    {
      id: 'va',
      title: 'Virtual Assistant',
      description: 'Track your daily LinkedIn outreach activities and performance',
      icon: '👤',
      features: [
        'Log DMs and connection requests',
        'View your performance stats',
        'Track your progress toward goals',
        'Receive feedback from your manager'
      ]
    },
    {
      id: 'boss',
      title: 'Business Owner',
      description: 'Monitor your VA\'s performance and provide feedback',
      icon: '👔',
      features: [
        'Real-time performance dashboard',
        'Activity alerts and notifications',
        'Give feedback and set goals',
        'Track ROI and acceptance rates'
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-purple-50 flex items-center justify-center p-6">
      <div className="max-w-5xl w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Welcome to VA Tracker
          </h1>
          <p className="text-lg text-gray-600">
            Choose your role to get started
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelected(role.id)}
              className={`
                relative p-8 rounded-2xl border-2 transition-all text-left
                ${selected === role.id
                  ? 'border-primary-500 bg-primary-50 shadow-lg scale-105'
                  : 'border-gray-200 bg-white hover:border-primary-200 hover:shadow-md'
                }
              `}
            >
              {/* Selected Checkmark */}
              {selected === role.id && (
                <div className="absolute top-4 right-4 w-8 h-8 bg-primary-500 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              )}

              {/* Icon */}
              <div className="text-5xl mb-4">{role.icon}</div>

              {/* Title & Description */}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {role.title}
              </h3>
              <p className="text-gray-600 mb-6">
                {role.description}
              </p>

              {/* Features */}
              <ul className="space-y-2">
                {role.features.map((feature, index) => (
                  <li key={index} className="flex items-start text-sm text-gray-700">
                    <svg className="w-5 h-5 text-primary-500 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </button>
          ))}
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <button
            onClick={() => selected && onSelect(selected)}
            disabled={!selected}
            className={`
              px-8 py-4 rounded-xl font-semibold text-lg transition-all
              ${selected
                ? 'bg-primary-600 text-white hover:bg-primary-700 shadow-lg hover:shadow-xl'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  )
}
