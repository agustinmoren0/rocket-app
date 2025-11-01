'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface Category {
  name: string;
  value: number;
  color: string;
}

interface EnergyBalanceChartProps {
  totalHours: number;
  categories: Category[];
  comment: string;
}

const getCategoryColor = (name: string): string => {
  const colorMap: Record<string, string> = {
    'Movimiento': '#10b981',
    'Bienestar': '#FF99AC',
    'Mental/Creatividad': '#a78bfa',
    'Social': '#fb923c',
    'Descanso': '#60a5fa',
  };
  return colorMap[name] || '#a67b6b';
};

export default function EnergyBalanceChart({ totalHours, categories, comment }: EnergyBalanceChartProps) {
  const [showModal, setShowModal] = useState(false);
  const total = categories.reduce((sum, cat) => sum + cat.value, 0);
  const sortedCategories = [...categories].sort((a, b) => b.value - a.value);

  // Generate SVG donut chart
  const generateDonutChart = () => {
    let currentAngle = -90;
    const paths: { path: string; color: string; name: string; percentage: number }[] = [];

    sortedCategories.forEach((category) => {
      const percentage = (category.value / total) * 100;
      const sliceAngle = (percentage / 100) * 360;
      const endAngle = currentAngle + sliceAngle;

      const startAngleRad = (currentAngle * Math.PI) / 180;
      const endAngleRad = (endAngle * Math.PI) / 180;

      const x1 = 50 + 40 * Math.cos(startAngleRad);
      const y1 = 50 + 40 * Math.sin(startAngleRad);
      const x2 = 50 + 40 * Math.cos(endAngleRad);
      const y2 = 50 + 40 * Math.sin(endAngleRad);

      const innerRadius = 28;
      const x3 = 50 + innerRadius * Math.cos(endAngleRad);
      const y3 = 50 + innerRadius * Math.sin(endAngleRad);
      const x4 = 50 + innerRadius * Math.cos(startAngleRad);
      const y4 = 50 + innerRadius * Math.sin(startAngleRad);

      const largeArcFlag = sliceAngle > 180 ? 1 : 0;

      const path = `
        M ${x1} ${y1}
        A 40 40 0 ${largeArcFlag} 1 ${x2} ${y2}
        L ${x3} ${y3}
        A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}
        Z
      `;

      paths.push({
        path,
        color: getCategoryColor(category.name),
        name: category.name,
        percentage: Math.round(percentage),
      });

      currentAngle = endAngle;
    });

    return paths;
  };

  const chartPaths = generateDonutChart();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="bg-white rounded-3xl p-6 mb-6 border border-[#FFB4A8]/30 shadow-sm"
    >
      <h3 className="text-lg font-semibold text-[#3D2C28] mb-6">Balance de Energía</h3>

      {/* Donut Chart */}
      <motion.div
        className="flex justify-center mb-6 cursor-pointer"
        onClick={() => setShowModal(true)}
        whileHover={{ scale: 1.05 }}
      >
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {chartPaths.map((item, idx) => (
              <motion.path
                key={idx}
                d={item.path}
                fill={item.color}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: idx * 0.1 }}
              />
            ))}
          </svg>
          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <p className="text-sm font-semibold text-[#A67B6B]">Balance</p>
            <p className="text-xl font-bold text-[#3D2C28]">{totalHours}h activas</p>
          </div>
        </div>
      </motion.div>

      {/* Legend */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        {sortedCategories.map((category, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.3 + idx * 0.05 }}
            className="flex items-center gap-2 text-sm"
          >
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: getCategoryColor(category.name) }}
            />
            <span className="text-[#3D2C28] font-medium truncate">{category.name}</span>
            <span className="text-[#A67B6B] text-xs flex-shrink-0">
              {Math.round((category.value / total) * 100)}%
            </span>
          </motion.div>
        ))}
      </div>

      {/* Comment */}
      <p className="text-sm text-[#A67B6B] leading-relaxed bg-[#FFF5F0] p-4 rounded-2xl">
        💡 {comment}
      </p>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-end z-50"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ y: 300 }}
              animate={{ y: 0 }}
              exit={{ y: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white w-full rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-6">
                <h4 className="text-lg font-semibold text-[#3D2C28]">Detalle de Energía</h4>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setShowModal(false)}
                  className="p-2 hover:bg-[#FFF5F0] rounded-full"
                >
                  <X size={20} className="text-[#A67B6B]" />
                </motion.button>
              </div>

              <div className="space-y-3">
                {sortedCategories.map((category, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                    className="bg-gradient-to-r from-[#FFF5F0] to-white rounded-2xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className="w-4 h-4 rounded-full flex-shrink-0"
                          style={{ backgroundColor: getCategoryColor(category.name) }}
                        />
                        <span className="text-[#3D2C28] font-medium truncate">{category.name}</span>
                      </div>
                      <span className="text-[#FF99AC] font-bold flex-shrink-0">
                        {Math.round((category.value / 60))} h
                      </span>
                    </div>
                    <div className="w-full bg-[#FFB4A8]/20 rounded-full h-2 overflow-hidden">
                      <motion.div
                        className="h-full"
                        style={{ backgroundColor: getCategoryColor(category.name) }}
                        initial={{ width: 0 }}
                        animate={{ width: `${(category.value / total) * 100}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
