"use client";

export default function HeroVisual() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <svg
        viewBox="0 0 1200 800"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute right-[-10%] top-[-5%] w-[120%] h-auto opacity-[0.07] dark:opacity-[0.04]"
        aria-hidden="true"
      >
        {/* Grid lines */}
        {Array.from({ length: 20 }).map((_, i) => (
          <line
            key={`h${i}`}
            x1={0}
            y1={40 + i * 36}
            x2={1200}
            y2={40 + i * 36}
            stroke="currentColor"
            strokeWidth={0.5}
            opacity={0.3 + (i % 3) * 0.15}
          />
        ))}
        {Array.from({ length: 24 }).map((_, i) => (
          <line
            key={`v${i}`}
            x1={50 + i * 48}
            y1={0}
            x2={50 + i * 48}
            y2={800}
            stroke="currentColor"
            strokeWidth={0.5}
            opacity={0.2}
          />
        ))}

        {/* Bar chart series — growing bars */}
        {[120, 180, 90, 220, 160, 280, 200, 340, 260, 400, 320, 380, 300, 450, 380, 520, 420, 560, 480, 600].map((h, i) => (
          <rect
            key={`bar${i}`}
            x={120 + i * 48}
            y={580 - h}
            width={28}
            height={h}
            rx={4}
            fill="currentColor"
            opacity={0.08 + (i % 4) * 0.04}
            className="text-primary"
          />
        ))}

        {/* Line chart overlay */}
        <path
          d={[
            "M100,520",
            "C140,500 160,540 200,480",
            "C240,420 260,460 300,380",
            "C340,300 360,340 400,280",
            "C440,220 460,260 500,200",
            "C540,140 560,180 600,120",
            "C640,60 660,100 700,80",
            "C740,60 760,80 800,60",
            "C840,40 860,50 900,40",
            "C940,30 960,35 1000,30",
            "C1040,25 1060,28 1100,25",
          ].join(" ")}
          stroke="currentColor"
          strokeWidth={2.5}
          fill="none"
          opacity={0.15}
          className="text-primary"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Area under the line */}
        <path
          d={[
            "M100,520",
            "C140,500 160,540 200,480",
            "C240,420 260,460 300,380",
            "C340,300 360,340 400,280",
            "C440,220 460,260 500,200",
            "C540,140 560,180 600,120",
            "C640,60 660,100 700,80",
            "C740,60 760,80 800,60",
            "C840,40 860,50 900,40",
            "C940,30 960,35 1000,30",
            "C1040,25 1060,28 1100,25",
            "L1100,580 L100,580 Z",
          ].join(" ")}
          fill="currentColor"
          opacity={0.04}
          className="text-primary"
        />

        {/* Rausch accent line */}
        <path
          d="M300,380 C340,300 360,340 400,280 C440,220 460,260 500,200 C540,140 560,180 600,120 C640,60 660,100 700,80"
          stroke="#ff385c"
          strokeWidth={2}
          fill="none"
          opacity={0.25}
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Dots on the Rausch line */}
        {[300, 400, 500, 600, 700].map((x, i) => {
          const idx = [300, 400, 500, 600, 700].indexOf(x);
          const ys = [380, 280, 200, 120, 80];
          return (
            <circle
              key={`dot${i}`}
              cx={x}
              cy={ys[i]}
              r={4}
              fill="#ff385c"
              opacity={0.35}
              className="group-hover:opacity-100 transition-opacity"
            />
          );
        })}

        {/* Candle-like elements (up/down) */}
        {[
          { x: 130, up: true }, { x: 210, up: false }, { x: 290, up: true },
          { x: 370, up: true }, { x: 450, up: false }, { x: 530, up: true },
          { x: 610, up: false }, { x: 690, up: true }, { x: 770, up: true },
          { x: 850, up: false }, { x: 930, up: true }, { x: 1010, up: false },
        ].map((c, i) => (
          <g key={`candle${i}`}>
            <rect
              x={c.x}
              y={c.up ? 340 : 350}
              width={12}
              height={c.up ? 50 : 40}
              rx={2}
              fill={c.up ? "#16a34a" : "#dc2626"}
              opacity={0.12}
            />
            <line
              x1={c.x + 6}
              y1={c.up ? 310 : 410}
              x2={c.x + 6}
              y2={c.up ? 340 : 390}
              stroke={c.up ? "#16a34a" : "#dc2626"}
              strokeWidth={1.5}
              opacity={0.15}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
