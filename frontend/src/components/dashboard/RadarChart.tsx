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
import { motion } from 'framer-motion';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

interface RadarChartProps {
    stats: {
        [key: string]: { label: string, score: number } | number | undefined;
    };
}

const ATTRIBUTE_MAP: Record<string, string> = {
    STA_O: '智力 (O)',
    STA_C: '防禦 (C)',
    STA_E: '速度 (E)',
    STA_A: '魅力 (A)',
    STA_N: '洞察 (N)'
};

// Fixed order for the pentagon shape matches BigFivePanel
const ATTRIBUTE_ORDER = ['STA_O', 'STA_C', 'STA_E', 'STA_A', 'STA_N'];

const RadarChart = ({ stats }: RadarChartProps) => {
    if (!stats) return null;

    // Prepare data
    const values = ATTRIBUTE_ORDER.map(key => {
        const val = stats[key];
        // Handle both raw numbers and object format from backend
        if (typeof val === 'number') return val;
        if (typeof val === 'object' && val !== null) return val.score;
        return 0; // Default fallback
    });

    const data: ChartData<'radar'> = {
        labels: ATTRIBUTE_ORDER.map(key => ATTRIBUTE_MAP[key]),
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
                pointRadius: 3, // Slightly smaller than analysis for dashboard compactness
                pointHoverRadius: 5,
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
                    display: false,
                    stepSize: 20,
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                    circular: false,
                },
                angleLines: {
                    color: 'rgba(255, 255, 255, 0.2)',
                },
                pointLabels: {
                    color: '#11D452',
                    font: {
                        size: 11, // Smaller font for dashboard
                        family: '"Noto Sans TC", sans-serif',
                        weight: 'bold',
                    },
                    backdropColor: 'transparent',
                },
            },
        },
        plugins: {
            legend: {
                display: false,
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
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="w-full h-full relative flex items-center justify-center pointer-events-auto"
        >
            {/* Background Glow Effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-[#11D452] opacity-5 blur-[60px] rounded-full pointer-events-none"></div>

            <div className="w-full h-full p-2">
                <Radar data={data} options={options} />
            </div>
        </motion.div>
    );
};

export default RadarChart;
