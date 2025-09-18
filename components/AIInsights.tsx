import React, { useState, useEffect } from 'react';
import { Spinner } from './ui/Spinner';
import { 
  generateScheduleInsights, 
  generateScheduleOptimization, 
  predictAttendance,
  type ScheduleInsights,
  type ScheduleOptimization,
  type AttendancePrediction
} from '../services/geminiService';
import type { ClassData, AttendanceData } from '../types';

interface AIInsightsProps {
  scheduleData: ClassData[];
  attendanceData: Map<string, AttendanceData>;
}

export const AIInsights: React.FC<AIInsightsProps> = ({ scheduleData, attendanceData }) => {
  const [insights, setInsights] = useState<ScheduleInsights | null>(null);
  const [optimization, setOptimization] = useState<ScheduleOptimization | null>(null);
  const [prediction, setPrediction] = useState<AttendancePrediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'insights' | 'optimization' | 'prediction'>('insights');
  const [error, setError] = useState<string | null>(null);
  const [retryMessage, setRetryMessage] = useState<string | null>(null);
  const [retryStatus, setRetryStatus] = useState<{ attempt: number; maxRetries: number; delaySeconds: number } | null>(null);

  // Listen for retry status events from the AI service
  useEffect(() => {
    const handleRetryStatus = (event: CustomEvent) => {
      setRetryStatus(event.detail);
      setRetryMessage(`Retrying... attempt ${event.detail.attempt} of ${event.detail.maxRetries} (waiting ${event.detail.delaySeconds}s)`);
    };

    window.addEventListener('ai-retry-status', handleRetryStatus as EventListener);
    
    return () => {
      window.removeEventListener('ai-retry-status', handleRetryStatus as EventListener);
    };
  }, []);

  const generateInsights = async () => {
    if (scheduleData.length === 0) return;
    
    setLoading(true);
    setError(null);
    setRetryMessage(null);
    setRetryStatus(null);
    
    try {
      const result = await generateScheduleInsights(scheduleData, attendanceData);
      setInsights(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate insights';
      setError(errorMessage);
      
      // Show retry suggestion for certain errors
      if (errorMessage.includes('overloaded') || errorMessage.includes('unavailable')) {
        setRetryMessage('The AI service is currently busy. You can try again in a few minutes, or we can try a different model.');
      }
    } finally {
      setLoading(false);
      setRetryStatus(null);
    }
  };

  const generateOptimizations = async () => {
    if (scheduleData.length === 0) return;
    
    setLoading(true);
    setError(null);
    setRetryMessage(null);
    setRetryStatus(null);
    
    try {
      const result = await generateScheduleOptimization(scheduleData, attendanceData);
      setOptimization(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate optimization suggestions';
      setError(errorMessage);
      
      if (errorMessage.includes('overloaded') || errorMessage.includes('unavailable')) {
        setRetryMessage('The AI service is currently busy. You can try again in a few minutes, or we can try a different model.');
      }
    } finally {
      setLoading(false);
      setRetryStatus(null);
    }
  };

  const generatePrediction = async () => {
    if (scheduleData.length === 0) return;
    
    setLoading(true);
    setError(null);
    setRetryMessage(null);
    setRetryStatus(null);
    
    try {
      // Use a sample class for prediction - in a real app, you'd allow user to select
      const sampleClass = scheduleData[0];
      const result = await predictAttendance(sampleClass, attendanceData);
      setPrediction(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to generate attendance prediction';
      setError(errorMessage);
      
      if (errorMessage.includes('overloaded') || errorMessage.includes('unavailable')) {
        setRetryMessage('The AI service is currently busy. You can try again in a few minutes, or we can try a different model.');
      }
    } finally {
      setLoading(false);
      setRetryStatus(null);
    }
  };

  const TabButton = ({ tab, label, icon }: { tab: typeof activeTab; label: string; icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
        activeTab === tab
          ? 'bg-indigo-600 text-white shadow-md'
          : 'bg-white text-gray-600 hover:bg-gray-50 border border-gray-200'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  const InsightsCard = ({ title, items, icon, color = 'indigo' }: {
    title: string;
    items: string[];
    icon: React.ReactNode;
    color?: string;
  }) => (
    <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 p-6 rounded-xl border border-${color}-200`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`p-2 bg-${color}-500 text-white rounded-lg`}>
          {icon}
        </div>
        <h3 className={`text-lg font-semibold text-${color}-800`}>{title}</h3>
      </div>
      <ul className="space-y-2">
        {items.map((item, index) => (
          <li key={index} className={`flex items-start gap-2 text-${color}-700`}>
            <span className={`w-2 h-2 bg-${color}-400 rounded-full mt-2 flex-shrink-0`} />
            <span className="text-sm">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );

  const OptimizationSuggestion = ({ suggestion }: { suggestion: ScheduleOptimization['suggestions'][0] }) => {
    const priorityColors = {
      high: 'red',
      medium: 'yellow',
      low: 'green'
    };
    const color = priorityColors[suggestion.priority];

    return (
      <div className={`p-4 border border-${color}-200 rounded-lg bg-${color}-50`}>
        <div className="flex items-center justify-between mb-2">
          <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${color}-200 text-${color}-800`}>
            {suggestion.type.toUpperCase()}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${color}-600 text-white`}>
            {suggestion.priority} priority
          </span>
        </div>
        <p className={`font-medium text-${color}-800 mb-1`}>{suggestion.description}</p>
        <p className={`text-sm text-${color}-600`}>{suggestion.impact}</p>
      </div>
    );
  };

  // Icons
  const LightBulbIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014.846 17H9.154a3.374 3.374 0 00-1.719-.553L6.887 15.9z" /></svg>;
  const CogIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>;
  const ChartIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" /></svg>;
  const TrendIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>;
  const UsersIcon = () => <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          AI-Powered Schedule Analytics
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <TabButton
          tab="insights"
          label="Smart Insights"
          icon={<LightBulbIcon />}
        />
        <TabButton
          tab="optimization"
          label="Optimization"
          icon={<CogIcon />}
        />
        <TabButton
          tab="prediction"
          label="Attendance Prediction"
          icon={<ChartIcon />}
        />
      </div>

      {/* Action Buttons */}
      <div className="mb-6">
        {activeTab === 'insights' && (
          <button
            onClick={generateInsights}
            disabled={loading || scheduleData.length === 0}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <LightBulbIcon />
            {loading ? 'Generating Insights...' : 'Generate AI Insights'}
          </button>
        )}
        {activeTab === 'optimization' && (
          <button
            onClick={generateOptimizations}
            disabled={loading || scheduleData.length === 0}
            className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <CogIcon />
            {loading ? 'Optimizing...' : 'Generate Optimizations'}
          </button>
        )}
        {activeTab === 'prediction' && (
          <button
            onClick={generatePrediction}
            disabled={loading || scheduleData.length === 0}
            className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChartIcon />
            {loading ? 'Predicting...' : 'Predict Attendance'}
          </button>
        )}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Spinner 
            size="lg" 
            message="AI is analyzing your schedule data... This may take a moment." 
          />
          <div className="text-center mt-4 space-y-2">
            <p className="text-sm text-gray-600">
              If the service is busy, we'll automatically retry for you.
            </p>
            {retryStatus && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-3">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  <p className="text-sm text-blue-800">
                    Service busy - retrying (attempt {retryStatus.attempt} of {retryStatus.maxRetries}, waiting {retryStatus.delaySeconds}s)
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-red-800 mb-2">AI Analysis Failed</h3>
              <p className="text-red-700 mb-3">{error}</p>
              {retryMessage && (
                <div className="bg-red-100 border border-red-300 rounded-lg p-3 mt-3">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm text-red-800">{retryMessage}</p>
                  </div>
                </div>
              )}
              <button
                onClick={() => {
                  setError(null);
                  setRetryMessage(null);
                  if (activeTab === 'insights') generateInsights();
                  else if (activeTab === 'optimization') generateOptimizations();
                  else if (activeTab === 'prediction') generatePrediction();
                }}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      {!loading && !error && (
        <>
          {/* Insights Tab */}
          {activeTab === 'insights' && insights && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-6 rounded-xl border border-indigo-200">
                <h3 className="text-lg font-semibold text-indigo-800 mb-3">Summary</h3>
                <p className="text-indigo-700">{insights.summary}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InsightsCard
                  title="Key Trends"
                  items={insights.trends}
                  icon={<TrendIcon />}
                  color="blue"
                />
                <InsightsCard
                  title="Recommendations"
                  items={insights.recommendations}
                  icon={<LightBulbIcon />}
                  color="green"
                />
              </div>

              {insights.busyTimes.length > 0 && (
                <InsightsCard
                  title="Peak Usage Times"
                  items={insights.busyTimes.map(bt => `${bt.day} at ${bt.time}: ${bt.reason}`)}
                  icon={<UsersIcon />}
                  color="orange"
                />
              )}

              <InsightsCard
                title="Improvement Areas"
                items={insights.improvements}
                icon={<CogIcon />}
                color="purple"
              />
            </div>
          )}

          {/* Optimization Tab */}
          {activeTab === 'optimization' && optimization && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Optimization Suggestions</h3>
                <div className="space-y-3">
                  {optimization.suggestions.map((suggestion, index) => (
                    <OptimizationSuggestion key={index} suggestion={suggestion} />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-red-50 p-6 rounded-xl border border-red-200">
                  <h4 className="font-semibold text-red-800 mb-3">Overutilized Resources</h4>
                  <ul className="space-y-1">
                    {optimization.utilization.overutilized.map((item, index) => (
                      <li key={index} className="text-red-700 text-sm">{item}</li>
                    ))}
                  </ul>
                </div>

                <div className="bg-yellow-50 p-6 rounded-xl border border-yellow-200">
                  <h4 className="font-semibold text-yellow-800 mb-3">Underutilized Resources</h4>
                  <ul className="space-y-1">
                    {optimization.utilization.underutilized.map((item, index) => (
                      <li key={index} className="text-yellow-700 text-sm">{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-200">
                <h4 className="font-semibold text-blue-800 mb-3">Trainer Balance Recommendations</h4>
                <ul className="space-y-2">
                  {optimization.trainerBalance.recommendations.map((rec, index) => (
                    <li key={index} className="text-blue-700 text-sm flex items-start gap-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Prediction Tab */}
          {activeTab === 'prediction' && prediction && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-200">
                <h3 className="text-lg font-semibold text-purple-800 mb-4">Attendance Prediction</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-purple-700 mb-2">Predicted Attendance</p>
                    <p className="text-3xl font-bold text-purple-800">{prediction.predictedAttendance}</p>
                  </div>
                  <div>
                    <p className="text-purple-700 mb-2">Confidence Level</p>
                    <p className="text-3xl font-bold text-purple-800">{(prediction.confidence * 100).toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <InsightsCard
                  title="Influencing Factors"
                  items={prediction.factors}
                  icon={<TrendIcon />}
                  color="indigo"
                />
                <InsightsCard
                  title="Recommendations"
                  items={prediction.recommendations}
                  icon={<LightBulbIcon />}
                  color="green"
                />
              </div>
            </div>
          )}
        </>
      )}

      {/* Empty State */}
      {!loading && !error && !insights && !optimization && !prediction && (
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">No AI Analysis Yet</h3>
          <p className="text-gray-600 mb-4">Upload schedule and attendance data, then click one of the buttons above to get AI-powered insights.</p>
        </div>
      )}
    </div>
  );
};