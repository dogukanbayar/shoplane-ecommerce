import { useState, useEffect } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import API from '../../api/axiosConfig'
import toast from 'react-hot-toast'
import JourneyVisualization from '../../components/journey/JourneyVisualization'
import AdvancedSeo from '../../components/seo/AdvancedSeo'

function JourneyDetail() {
  const navigate = useNavigate()
  const { journeyId } = useParams()
  const [journey, setJourney] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJourney()
  }, [journeyId])

  const fetchJourney = async () => {
    try {
      setLoading(true)
      const response = await API.get(`/journeys/${journeyId}`)
      setJourney(response.data.journey)
    } catch (error) {
      toast.error('Journey yüklenemedi')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"></div>
      </div>
    )
  }

  if (!journey) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg flex items-center justify-center">
        <p className="text-gray-600 dark:text-gray-400">Journey bulunamadı</p>
      </div>
    )
  }

  return (
    <>
      <AdvancedSeo
        title={`Journey ${journeyId} - MyShop Admin`}
        description="Customer journey detail view"
      />

      <div className="min-h-screen bg-gray-50 dark:bg-dark-bg py-12">
        <div className="max-w-7xl mx-auto px-4">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={() => navigate('/admin/journeys')}
              className="p-3 hover:bg-gray-200 dark:hover:bg-dark-hover rounded-lg transition"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-3xl font-bold dark:text-dark-text">
                Journey Detail
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                ID: {journeyId}
              </p>
            </div>
          </div>

          {/* Journey Visualization */}
          <JourneyVisualization journey={journey} />
        </div>
      </div>
    </>
  )
}

export default JourneyDetail