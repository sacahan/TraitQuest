import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
    type ChartData,
    type ChartOptions
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { Target } from 'lucide-react';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

interface BigFivePanelProps {
    result: any;
}

const RPG_ATTRIBUTE_MAP: Record<string, string> = {
    STA_O: '智力 (O)', // Openness -> Intellect
    STA_C: '防禦 (C)', // Conscientiousness -> Defense
    STA_E: '速度 (E)', // Extraversion -> Speed
    STA_A: '魅力 (A)', // Agreeableness -> Charm
    STA_N: '洞察 (N)'  // Neuroticism -> Insight
};

// Fixed order for the pentagon shape
const ATTRIBUTE_ORDER = ['STA_O', 'STA_C', 'STA_E', 'STA_A', 'STA_N'];

const BigFivePanel = ({ result }: BigFivePanelProps) => {
    const stats = result?.stats;
    if (!stats) return null;

    // Prepare data
    const values = ATTRIBUTE_ORDER.map(key => {
        const val = stats[key];
        return typeof val === 'number' ? val : (val?.score || 0);
    });

    const data: ChartData<'radar'> = {
        labels: ATTRIBUTE_ORDER.map(key => RPG_ATTRIBUTE_MAP[key]),
        datasets: [
            {
                label: '屬性數值',
                data: values,
                backgroundColor: 'rgba(17, 212, 82, 0.25)', // #11D452 with opacity
                borderColor: '#11D452', // #11D452 Neon Green
                borderWidth: 2,
                pointBackgroundColor: '#102216', // Dark background
                pointBorderColor: '#D4AF37', // Gold border
                pointHoverBackgroundColor: '#D4AF37',
                pointHoverBorderColor: '#fff',
                pointRadius: 4,
                pointHoverRadius: 6,
            },
        ],
    };

    const options: ChartOptions<'radar'> = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            r: {
                min: 0,
                max: 100,
                ticks: {
                    display: false, // Hide numeric ticks for cleaner look
                    stepSize: 20,
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    circular: false, // Polygon shape matches RPG stats better
                },
                angleLines: {
                    color: 'rgba(255, 255, 255, 0.2)',
                },
                pointLabels: {
                    color: '#11D452', // Neon Green Labels
                    font: {
                        size: 14,
                        family: '"Noto Sans TC", sans-serif',
                        weight: 'bold',
                    },
                    backdropColor: 'transparent',
                },
            },
        },
        plugins: {
            legend: {
                display: false, // Hide legend since we have a title
            },
            tooltip: {
                backgroundColor: 'rgba(16, 34, 22, 0.9)',
                titleColor: '#11D452',
                bodyColor: '#fff',
                borderColor: '#D4AF37',
                borderWidth: 1,
                displayColors: false,
                callbacks: {
                    label: function (context) {
                        return `${context.raw}`;
                    }
                }
            }
        },
    };

    return (
        <div className="w-full h-full min-h-[400px] flex flex-col items-center justify-center relative p-4">
            {/* Header */}
            <div className="flex items-center gap-4 mb-2 w-full max-w-lg z-10">
                <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-[#11D452]/50"></div>
                <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-[#11D452]" />
                    <h2 className="text-xl font-bold text-white tracking-wider">
                        <span className="text-[#11D452]">角色</span> 屬性
                    </h2>
                </div>
                <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-[#11D452]/50"></div>
            </div>

            {/* Chart Container with decorative glow */}
            <div className="relative w-full max-w-[500px] aspect-square">
                {/* Background Glow Effect */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2/3 h-2/3 bg-[#11D452] opacity-5 blur-[80px] rounded-full pointer-events-none"></div>

                <Radar data={data} options={options} />
            </div>

            {/* Stat List Summary (Optional, for accessibility/quick read) */}
            <div className="grid grid-cols-5 gap-2 w-full max-w-lg mt-4 text-center z-10">
                {ATTRIBUTE_ORDER.map(key => {
                    const val = stats[key];
                    const score = typeof val === 'number' ? val : (val?.score || 0);
                    return (
                        <div key={key} className="flex flex-col items-center">
                            <span className="text-[#11D452] text-xs font-bold mb-1">{RPG_ATTRIBUTE_MAP[key]}</span>
                            <span className="text-white text-sm font-mono">{score}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default BigFivePanel;
