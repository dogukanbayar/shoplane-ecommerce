import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import SessionReplayPlayer from '../../components/analytics/SessionReplayPlayer'
import AdvancedSeo from '../../components/seo/AdvancedSeo'

function SessionReplayPage() {
  const navigate = useNavigate()
  const { sessionId } = useParams()

  return (
    <>
      <AdvancedSeo
        title="Session Replay - MyShop Admin"
        description="Kullanıcı oturumu tekrar izle"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/admin/analytics')}
              className="p-3 hover:bg-gray-200 dark:hover:bg-dark-hover rounded-lg transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold dark:text-dark-text">
                Session Replay
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Session: {sessionId}
              </p>
            </div>
          </div>

          {/* Player */}
          <SessionReplayPlayer sessionId={sessionId} />
        </div>
      </div>
    </>
  )
}

export default SessionReplayPage
