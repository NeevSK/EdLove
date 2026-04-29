import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { ProgressRing, SimpleBarChart, SimpleLineChart, SimplePieChart } from '@repo/graphics';
import { Box, colors, HStack, Text } from '@repo/ui';
export function AnalyticsChart({ title, data, type = 'bar', height = 200, showValues = true, maxValue, }) {
    switch (type) {
        case 'bar':
            return _jsx(SimpleBarChart, { title: title, data: data, height: height, showValues: showValues });
        case 'line':
            return (_jsx(SimpleLineChart, { title: title, data: data.map((datum) => ({ x: datum.label, y: datum.value })), height: height, color: data[0]?.color }));
        case 'pie':
            return _jsx(SimplePieChart, { title: title, data: data, size: height });
        case 'progress': {
            const progressValue = data[0]?.value ?? 0;
            const progressMax = maxValue ?? 100;
            return (_jsxs(Box, { className: "items-center rounded-3xl border border-black/5 bg-white/70 px-4 py-4", style: { height }, children: [title ? (_jsx(Text, { className: "mb-4 text-center text-base font-bold", style: { color: colors.text }, children: title })) : null, _jsx(ProgressRing, { value: progressValue, max: progressMax, size: Math.min(height, 150), color: data[0]?.color, showLabel: true }), _jsxs(Text, { className: "mt-3 text-center text-sm", style: { color: colors.text }, children: [data[0]?.label, ": ", progressValue, "/", progressMax] })] }));
        }
        default:
            return null;
    }
}
export function MultiSeriesChart({ title, series, type = 'line', height = 250, }) {
    return (_jsxs(Box, { className: "rounded-3xl border border-black/5 bg-white/70 px-4 py-4", style: { height }, children: [title ? (_jsx(Text, { className: "mb-4 text-center text-base font-bold", style: { color: colors.text }, children: title })) : null, _jsx(HStack, { className: "justify-around gap-3", children: series.map((entry, index) => (_jsxs(Box, { className: "flex-1 items-center", children: [_jsx(Text, { className: "mb-2 text-center text-xs font-semibold", style: { color: entry.color || colors.gurudeviBlue }, children: entry.name }), type === 'line' ? (_jsx(SimpleLineChart, { data: entry.data, height: height - 60, color: entry.color })) : (_jsx(SimpleBarChart, { data: entry.data.map((datum) => ({
                                label: datum.x,
                                value: datum.y,
                                color: entry.color,
                            })), height: height - 60, showValues: false }))] }, index))) })] }));
}
