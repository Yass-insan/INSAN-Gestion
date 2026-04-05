import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

interface StatsProps {
  type: 'overview' | 'class';
  customData?: any[];
  customPieData?: any[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-5 border border-slate-100 dark:border-slate-800 shadow-2xl rounded-[2rem]">
        <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-3">{label}</p>
        <div className="space-y-2">
            {payload.map((entry: any, index: number) => (
            <div key={index} className="flex items-center justify-between gap-8">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
                    <span className="text-xs font-bold text-slate-600 dark:text-slate-300">{entry.name}</span>
                </div>
                <span className="text-sm font-black text-slate-900 dark:text-white">{entry.value}%</span>
            </div>
            ))}
        </div>
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

  const COLORS = {
    present: '#262262', // Insan Blue
    late: '#f7941d',    // Insan Orange
    absent: '#f43f5e'   // Rose 500
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Area Chart - Assiduity Evolution */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-sm border border-slate-100/50 dark:border-slate-800/50">
            <div className="flex justify-between items-start mb-10">
                <div>
                    <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">Assiduité</h3>
                    <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase mt-1 tracking-widest">Évolution 30 jours</p>
                </div>
                <div className="px-4 py-1.5 bg-slate-50 dark:bg-slate-800 rounded-full text-[10px] font-black text-slate-500 dark:text-slate-400 border border-slate-100 dark:border-slate-700">LIVE</div>
            </div>
            
            <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 0, left: -25, bottom: 0 }}>
                        <defs>
                            <linearGradient id="gradBlue" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.present} stopOpacity={0.15}/>
                                <stop offset="95%" stopColor={COLORS.present} stopOpacity={0}/>
                            </linearGradient>
                            <linearGradient id="gradOrange" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.late} stopOpacity={0.15}/>
                                <stop offset="95%" stopColor={COLORS.late} stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="5 5" vertical={false} stroke="currentColor" opacity={0.1} />
                        <XAxis 
                            dataKey="name" 
                            tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                            axisLine={false} 
                            tickLine={false} 
                            dy={15} 
                        />
                        <YAxis 
                            tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}} 
                            axisLine={false} 
                            tickLine={false} 
                        />
                        <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#262262', strokeWidth: 1, strokeDasharray: '5 5' }} />
                        <Area 
                            type="monotone" 
                            dataKey="presence" 
                            name="Présent"
                            stroke={COLORS.present} 
                            strokeWidth={4}
                            fillOpacity={1} 
                            fill="url(#gradBlue)" 
                            animationDuration={1500}
                        />
                        <Area 
                            type="monotone" 
                            dataKey="retard" 
                            name="Retard"
                            stroke={COLORS.late} 
                            strokeWidth={4}
                            fillOpacity={1} 
                            fill="url(#gradOrange)" 
                            animationDuration={2000}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* Donut Chart - Current Distribution */}
        <div className="bg-white dark:bg-slate-900 p-10 rounded-[3rem] shadow-sm border border-slate-100/50 dark:border-slate-800/50 flex flex-col">
            <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight mb-1">Répartition</h3>
            <p className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-10">Statuts cumulés</p>
            
            <div className="flex-1 flex items-center justify-center relative">
                <div className="w-full h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={75}
                                outerRadius={95}
                                paddingAngle={8}
                                dataKey="value"
                                stroke="none"
                                animationBegin={500}
                                animationDuration={1000}
                            >
                                {pieData.map((entry, index) => (
                                    <Cell 
                                        key={`cell-${index}`} 
                                        fill={entry.name === 'Présent' ? COLORS.present : entry.name === 'Retard' ? COLORS.late : COLORS.absent} 
                                        style={{ filter: 'drop-shadow(0px 4px 10px rgba(0,0,0,0.1))' }}
                                    />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
                
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <span className="text-5xl font-black text-slate-800 dark:text-white tracking-tighter">85<span className="text-2xl ml-1 text-slate-300">%</span></span>
                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest mt-2">Score Moyen</span>
                </div>
            </div>

            <div className="flex justify-center gap-8 mt-6">
                {pieData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.name === 'Présent' ? COLORS.present : entry.name === 'Retard' ? COLORS.late : COLORS.absent }}></div>
                        <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider">{entry.name}</span>
                    </div>
                ))}
            </div>
        </div>
    </div>
  );
};

export default Stats;