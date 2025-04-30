// src/components/Tradezella/ZellaRadar.jsx
import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts';

export default function ZellaRadar({ radarData }) {
  // Simple Card wrapper
  const Card = ({ children }) => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
      {children}
    </div>
  );
  const CardHeader = ({ title }) => (
    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{title}</h3>
  );
  const CardContent = ({ children }) => (
    <div className="w-full" style={{ height: 300 }}>
      {children}
    </div>
  );

  return (
    <Card>
      <CardHeader title="Zella Score" />
      <CardContent>
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={radarData} cx="50%" cy="50%" outerRadius="80%">
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" />
            <PolarRadiusAxis />
            <Radar name="You" dataKey="value" stroke="#6366F1" fill="#A5B4FC" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}