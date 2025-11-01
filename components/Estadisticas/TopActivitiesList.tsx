'use client';

import { motion } from 'framer-motion';
import { Flame } from 'lucide-react';

interface TopActivity {
  id: string;
  name: string;
  icon: string;
  count: number;
}

interface TopActivitiesListProps {
  topActivities: TopActivity[];
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.5,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4 },
  },
};

export default function TopActivitiesList({ topActivities }: TopActivitiesListProps) {
  const maxCount = Math.max(...topActivities.map((a) => a.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="bg-white rounded-3xl p-6 mb-6 border border-[#FFB4A8]/30 shadow-sm"
    >
      <div className="flex items-center gap-2 mb-4">
        <Flame size={20} className="text-[#FF99AC]" />
        <h3 className="text-lg font-semibold text-[#3D2C28]">Actividades Favoritas</h3>
      </div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-3"
      >
        {topActivities.length > 0 ? (
          topActivities.map((activity, idx) => {
            const isTop = idx === 0;
            const percentage = (activity.count / maxCount) * 100;

            return (
              <motion.div
                key={activity.id}
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                className={`p-4 rounded-2xl transition-all ${
                  isTop
                    ? 'bg-gradient-to-r from-[#FFE8F0] to-[#FFF5F0] border-2 border-[#FF99AC]'
                    : 'bg-[#FFF5F0] border border-[#FFB4A8]/30'
                }`}
              >
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    <span className="text-2xl flex-shrink-0">{activity.icon}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[#3D2C28] truncate">
                        {activity.name}
                      </p>
                      <p className="text-xs text-[#A67B6B]">
                        {activity.count} {activity.count === 1 ? 'vez' : 'veces'}
                      </p>
                    </div>
                  </div>
                  {isTop && (
                    <motion.div
                      animate={{ scale: [1, 1.1, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      className="text-lg flex-shrink-0"
                    >
                      🔥
                    </motion.div>
                  )}
                </div>
                <div className="w-full bg-[#FFB4A8]/20 rounded-full h-1.5 overflow-hidden">
                  <motion.div
                    className="h-full bg-gradient-to-r from-[#FFC0A9] to-[#FF99AC]"
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: idx * 0.1 }}
                  />
                </div>
              </motion.div>
            );
          })
        ) : (
          <p className="text-sm text-[#A67B6B] text-center py-4">
            No hay actividades registradas aún
          </p>
        )}
      </motion.div>
    </motion.div>
  );
}
