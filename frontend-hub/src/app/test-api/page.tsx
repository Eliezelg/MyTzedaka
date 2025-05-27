'use client'

import { useState } from 'react'

export default function TestApiPage() {
  const [result, setResult] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const testDirectAPI = async () => {
    setLoading(true)
    try {
      // Test direct avec fetch
      const response = await fetch('http://localhost:3000/api/hub/campaigns/campaign-test-1')
      const data = await response.json()
      setResult(`Direct fetch: ${JSON.stringify(data, null, 2)}`)
    } catch (error) {
      setResult(`Erreur direct fetch: ${error}`)
    }
    setLoading(false)
  }

  const testApiClient = async () => {
    setLoading(true)
    try {
      // Test avec notre ApiClient
      const { apiClient } = await import('@/lib/api-client')
      const response = await apiClient.get('/hub/campaigns/campaign-test-1')
      setResult(`ApiClient: ${JSON.stringify(response, null, 2)}`)
    } catch (error) {
      setResult(`Erreur ApiClient: ${error}`)
    }
    setLoading(false)
  }

  const testHubClient = async () => {
    setLoading(true)
    try {
      // Test avec HubClient
      const { hubApiClient } = await import('@/lib/hub-client')
      const response = await hubApiClient.getCampaignById('campaign-test-1')
      setResult(`HubClient: ${JSON.stringify(response, null, 2)}`)
    } catch (error) {
      setResult(`Erreur HubClient: ${error}`)
    }
    setLoading(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Test API Connection</h1>
      
      <div className="space-y-4 mb-6">
        <button 
          onClick={testDirectAPI}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
        >
          Test Direct Fetch
        </button>
        
        <button 
          onClick={testApiClient}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded disabled:opacity-50"
        >
          Test ApiClient
        </button>
        
        <button 
          onClick={testHubClient}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded disabled:opacity-50"
        >
          Test HubClient
        </button>
      </div>

      {loading && <div>Loading...</div>}
      
      <pre className="bg-gray-100 p-4 rounded overflow-auto max-h-96">
        {result}
      </pre>
    </div>
  )
}
