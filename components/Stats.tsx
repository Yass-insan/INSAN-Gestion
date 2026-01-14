import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

interface StatsProps {
  type: 'overview' | 'class';
  customData?: any[];
  customPieData?: any[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 p-4 border border-slate-100 dark:border-slate-700 shadow-xl rounded-xl">
        <p className="text-sm font-bold text-slate-700 dark:text-slate-200 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs mb-1">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span className="text-slate-500 dark:text-slate-400 font-medium">{entry.name}:</span>
            <span className="font-bold text-slate-800 dark:text-slate-100">{entry.value}%</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const Stats: React.FC<StatsProps> = ({ type, customData, customPieData }) => {
  const defaultWeeklyData = [
    { name: 'Sem 1', presence: 90, absence: 5, retard: 5 },
    { name: 'Sem 2', presence: 85, absence: 10, retard: 5 },
    { name: 'Sem 3', presence: 95, absence: 2, retard: 3 },
    { name: 'Sem 4', presence: 80, absence: 15, retard: 5 },
  ];

  const defaultPieData = [
    { name: 'Présent', value: 85 },
    { name: 'Retard', value: 10 },
    { name: 'Absent', value: 5 },
  ];

  const chartData = customData || defaultWeeklyData;
  const pieData = customPieData || defaultPieData;

  const total = pieData.reduce((acc, curr) => acc + curr.value, 0);
  const presentValue = pieData.find(d => d.name === 'Présent')?.value || 0;
  const percentage = Math.round((presentValue / total) * 100);

  // Couleurs Insan ajustées pour les graphiques
  const COLORS = {
    present: '#22c55e', // Green 500
    late: '#f7941d',    // Insan Orange
    absent: '#ef4444'   // Red 500
  };

  return (
    <div className="space-y-6">
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Evolution Chart (Area for modern look) */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none border border-slate-100 dark:border-slate-800 transition-colors duration-300">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                {type === 'class' ? 'Taux de Présence (4 semaines)' : "Évolution de l'assiduité"}
            </h3>
            <span className="px-3 py-1 bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold rounded-full border border-slate-100 dark:border-slate-700">Mensuel</span>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPresence" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.present} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={COLORS.present} stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorLate" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={COLORS.late} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={COLORS.late} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                <XAxis 
                    dataKey="name" 
                    tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}} 
                    axisLine={false} 
                    tickLine={false} 
                    dy={10} 
                />
                <YAxis 
                    tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 500}} 
                    axisLine={false} 
                    tickLine={false} 
                />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#cbd5e1', strokeWidth: 1, strokeDasharray: '4 4' }} />
                <Area 
                    type="monotone" 
                    dataKey="presence" 
                    name="Présent"
                    stroke={COLORS.present} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorPresence)" 
                />
                <Area 
                    type="monotone" 
                    dataKey="retard" 
                    name="Retard"
                    stroke={COLORS.late} 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorLate)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Chart (Donut) */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)] dark:shadow-none border border-slate-100 dark:border-slate-800 flex flex-col transition-colors duration-300">
          <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 tracking-tight">Répartition Globale</h3>
          <p className="text-sm text-slate-400 dark:text-slate-500 mb-6">Vue d'ensemble des statuts</p>
          
          <div className="flex-1 flex items-center justify-center relative">
            <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                    <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={5}
                    cornerRadius={8}
                    dataKey="value"
                    stroke="none"
                    >
                    {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.name === 'Présent' ? COLORS.present : entry.name === 'Retard' ? COLORS.late : COLORS.absent} />
                    ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                </PieChart>
                </ResponsiveContainer>
            </div>
            
            {/* Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-4xl font-extrabold text-slate-800 dark:text-white tracking-tight">{percentage}%</span>
              <span className="text-xs text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest mt-1">Présence</span>
            </div>
          </div>

          <div className="flex justify-center gap-6 mt-4">
              {pieData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.name === 'Présent' ? COLORS.present : entry.name === 'Retard' ? COLORS.late : COLORS.absent }}></div>
                      <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{entry.name}</span>
                  </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stats;