import {
    Chart as ChartJS,
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';

ChartJS.register(
    RadialLinearScale,
    PointElement,
    LineElement,
    Filler,
    Tooltip,
    Legend
);

interface RadarChartProps {
    data: {
        labels: string[];
        datasets: {
            label: string;
            data: number[];
            backgroundColor: string;
            borderColor: string;
            borderWidth: number;
        }[];
    };
}

const RadarChart = ({ data }: RadarChartProps) => {
    const options = {
        scales: {
            r: {
                angleLines: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.1)',
                },
                pointLabels: {
                    color: '#D4AF37', // secondary color
                    font: {
                        size: 14,
                    },
                },
                ticks: {
                    display: false,
                    stepSize: 1,
                },
                min: 0,
                max: 5,
            },
        },
        plugins: {
            legend: {
                display: false,
            },
        },
    };

    return (
        <div className="w-full max-w-[400px] mx-auto p-4">
            <Radar data={data} options={options} />
        </div>
    );
};

export default RadarChart;
