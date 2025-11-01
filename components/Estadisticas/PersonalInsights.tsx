'use client';

import { motion } from 'framer-motion';

interface PersonalInsightsProps {
  insights: {
    main: string;
    extra?: string;
  };
}

export default function PersonalInsights({ insights }: PersonalInsightsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.6 }}
      className="bg-gradient-to-br from-[#FFF5F0] to-white rounded-3xl p-6 mb-24 border border-[#FFB4A8]/30 shadow-sm"
    >
      <div className="flex items-start gap-4">
        <div className="text-4xl flex-shrink-0">💡</div>
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-[#3D2C28] mb-3">Insights Personales</h3>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="text-sm text-[#3D2C28] leading-relaxed mb-3"
          >
            {insights.main}
          </motion.p>

          {insights.extra && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              className="bg-[#FFE8F0]/50 border border-[#FFB4A8]/30 rounded-2xl p-3 mt-3"
            >
              <p className="text-xs text-[#A67B6B]">
                <span className="font-semibold">Dato curioso:</span> {insights.extra}
              </p>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
