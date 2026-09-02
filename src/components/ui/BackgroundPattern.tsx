import React from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';

export const BackgroundPattern: React.FC = () => {
  const { theme } = useApp();
  const isDark = theme === 'dark';

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* SVG Architectural Grid Pattern */}
      <svg
        className={`absolute inset-0 w-full h-full opacity-40 dark:opacity-30 transition-opacity duration-300 ${
          isDark ? 'stroke-[#30363D]' : 'stroke-slate-300'
        }`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Small 32x32 micro grid */}
          <pattern
            id="subgrid"
            width="32"
            height="32"
            patternUnits="userSpaceOnUse"
          >
            <path d="M 32 0 L 0 0 0 32" fill="none" strokeWidth="0.5" />
          </pattern>
          {/* Large 128x128 structural grid */}
          <pattern
            id="mainGrid"
            width="128"
            height="128"
            patternUnits="userSpaceOnUse"
          >
            <rect width="128" height="128" fill="url(#subgrid)" />
            <path d="M 128 0 L 0 0 0 128" fill="none" strokeWidth="1" />
            {/* Corner Crosshair Marks */}
            <circle cx="0" cy="0" r="1.5" fill={isDark ? '#10B981' : '#059669'} />
            <circle cx="128" cy="0" r="1.5" fill={isDark ? '#10B981' : '#059669'} />
            <circle cx="0" cy="128" r="1.5" fill={isDark ? '#10B981' : '#059669'} />
            <circle cx="128" cy="128" r="1.5" fill={isDark ? '#10B981' : '#059669'} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#mainGrid)" />
      </svg>

      {/* Subtle Animated Vector Topological Nodes */}
      <svg
        className="absolute inset-0 w-full h-full"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Animated Horizontal Scanning Grid Line */}
        <motion.line
          x1="0"
          y1="0"
          x2="100%"
          y2="0"
          stroke={isDark ? '#10B981' : '#059669'}
          strokeWidth="1"
          strokeOpacity={isDark ? 0.25 : 0.2}
          animate={{
            y: ['0vh', '100vh'],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Animated Vertical Reference Guide */}
        <motion.line
          x1="0"
          y1="0"
          x2="0"
          y2="100%"
          stroke={isDark ? '#30363D' : '#CBD5E1'}
          strokeWidth="1"
          strokeDasharray="4 8"
          strokeOpacity={0.4}
          animate={{
            x: ['10vw', '90vw', '10vw'],
          }}
          transition={{
            duration: 35,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />

        {/* Dynamic Network Node Crosses */}
        {[
          { x: '18%', y: '22%', delay: 0 },
          { x: '78%', y: '16%', delay: 2 },
          { x: '85%', y: '68%', delay: 4 },
          { x: '24%', y: '74%', delay: 1 },
          { x: '52%', y: '42%', delay: 3 },
        ].map((node, i) => (
          <motion.g
            key={i}
            transform={`translate(0, 0)`}
            animate={{
              opacity: [0.2, 0.7, 0.2],
            }}
            transition={{
              duration: 4,
              repeat: Infinity,
              delay: node.delay,
              ease: 'easeInOut',
            }}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r="2"
              fill={isDark ? '#10B981' : '#059669'}
            />
            <circle
              cx={node.x}
              cy={node.y}
              r="12"
              fill="none"
              stroke={isDark ? '#10B981' : '#059669'}
              strokeWidth="0.5"
              strokeDasharray="2 3"
            />
          </motion.g>
        ))}
      </svg>

      {/* Architectural Corner Watermark Coordinates */}
      <div className="absolute top-20 right-6 hidden md:flex flex-col items-end text-[10px] font-mono tracking-wider opacity-30 dark:text-slate-400 text-slate-500 select-none pointer-events-none">
        <span>LOC: 9.0222° N, 38.7468° E</span>
        <span>ZONE: ETH_ADDIS_EAST_AFRICA</span>
        <span>PROTOCOL: ETHIOWEB3_ORCHESTRATOR</span>
      </div>

      <div className="absolute bottom-6 left-6 hidden md:flex flex-col text-[10px] font-mono tracking-wider opacity-30 dark:text-slate-400 text-slate-500 select-none pointer-events-none">
        <span>SYSTEM: ESCROW_CONSENSUS_ENGINE</span>
        <span>VERIFICATION: LIVE_METRICS_SYNC</span>
      </div>
    </div>
  );
};
