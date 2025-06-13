'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'

export default function TestDebugPage() {
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  const testAPI = async () => {
    setLoading(true)
    try {
      // Test direct avec l'URL configurée
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'
      console.log('API URL:', apiUrl)
      
      const response = await fetch(`${apiUrl}/hub/campaigns/campaign-test-1`)
      console.log('Response status:', response.status)
      
      if (response.ok) {
        const data = await response.json()
        setResult(`✅ SUCCESS: ${JSON.stringify(data, null, 2)}`)
      } else {
        setResult(`❌ ERROR: ${response.status} - ${response.statusText}`)
      }
    } catch (error) {
      console.error('Test error:', error)
      setResult(`🚨 FETCH ERROR: ${error}`)
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">🔬 API Debug Test</h1>
      
      <div className="space-y-4">
        <div>
          <p><strong>Frontend URL:</strong> {typeof window !== 'undefined' ? window.location.origin : 'N/A'}</p>
          <p><strong>API Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3002/api'}</p>
          <p><strong>Test Endpoint:</strong> /hub/campaigns/campaign-test-1</p>
        </div>
        
        <Button onClick={testAPI} disabled={loading}>
          {loading ? '🔄 Testing...' : '🧪 Test API Connection'}
        </Button>
        
        {result && (
          <div className="bg-gray-100 p-4 rounded-lg">
            <h3 className="font-bold mb-2">Result:</h3>
            <pre className="whitespace-pre-wrap text-sm">{result}</pre>
          </div>
        )}
      </div>
    </div>
  )
}
