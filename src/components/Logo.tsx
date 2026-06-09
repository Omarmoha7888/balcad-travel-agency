import React from 'react';

interface LogoProps {
  className?: string;
  size?: number | string;
}

export function Logo({ className = '', size = '100%' }: LogoProps) {
  return (
    <svg
      viewBox="0 0 500 380"
      width={size}
      height={size}
      className={`inline-block select-none ${className}`}
      xmlns="logo.png"
    >
      <defs>
        {/* Sun Gradient */}
        <radialGradient id="sunGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#ffb900" />
          <stop offset="70%" stopColor="#ff8a00" />
          <stop offset="100%" stopColor="#ff6200" />
        </radialGradient>

        {/* Globe Gradient */}
        <radialGradient id="globeGrad" cx="35%" cy="30%" r="65%">
          <stop offset="0%" stopColor="#3ca5ff" />
          <stop offset="45%" stopColor="#0a59df" />
          <stop offset="100%" stopColor="#002188" />
        </radialGradient>

        {/* Swoosh Orange-Yellow Gradient */}
        <linearGradient id="swooshGrad" x1="0%" y1="50%" x2="100%" y2="50%">
          <stop offset="0%" stopColor="#ff4500" />
          <stop offset="40%" stopColor="#ff7a00" />
          <stop offset="100%" stopColor="#ffdb25" />
        </linearGradient>

        {/* Wave Gradients */}
        <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#003cd2" />
          <stop offset="100%" stopColor="#0018a8" />
        </linearGradient>

        {/* Trunk Gradient */}
        <linearGradient id="trunkGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8d551e" />
          <stop offset="100%" stopColor="#4e2c07" />
        </linearGradient>

        {/* Leaf Gradients */}
        <linearGradient id="leafGrad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#22c322" />
          <stop offset="100%" stopColor="#0a6800" />
        </linearGradient>

        {/* Globe Mask for continent clipping */}
        <clipPath id="globeClip">
          <circle cx="260" cy="180" r="82" />
        </clipPath>
      </defs>

      {/* ================= 1. SUN WITH RAYS ================= */}
      <g id="sun-group">
        {/* Rays */}
        <path d="M 260 180 L 170  40 L 210  35 Z" fill="url(#sunGrad)" opacity="0.8" />
        <path d="M 260 180 L 230  20 L 270  18 Z" fill="url(#sunGrad)" opacity="0.8" />
        <path d="M 260 180 L 290  18 L 330  25 Z" fill="url(#sunGrad)" opacity="0.8" />
        <path d="M 260 180 L 350  40 L 380  60 Z" fill="url(#sunGrad)" opacity="0.8" />
        <path d="M 260 180 L 400  75 L 420 100 Z" fill="url(#sunGrad)" opacity="0.8" />
        <path d="M 260 180 L 420 120 L 430 150 Z" fill="url(#sunGrad)" opacity="0.8" />
        <path d="M 260 180 L 430 170 L 420 200 Z" fill="url(#sunGrad)" opacity="0.8" />
        
        <path d="M 260 180 L 150  80 L 130 110 Z" fill="url(#sunGrad)" opacity="0.8" />
        <path d="M 260 180 L 120 130 L 110 160 Z" fill="url(#sunGrad)" opacity="0.8" />
        <path d="M 260 180 L 110 180 L 115 210 Z" fill="url(#sunGrad)" opacity="0.8" />

        {/* Main Sun Body */}
        <circle cx="260" cy="180" r="105" fill="url(#sunGrad)" />
      </g>

      {/* ================= 2. SEAGULLS / BIRDS ================= */}
      <g id="birds" fill="#0018a8">
        {/* Bird 1 */}
        <path d="M 215 95 Q 220 90 227 92 Q 223 93 227 97 Q 221 95 215 99 Q 212 96 215 95 Z" transform="scale(1) translate(0, 0)" />
        {/* Bird 2 */}
        <path d="M 248 102 Q 253 97 261 100 Q 256 101 260 106 Q 254 104 248 108 Q 245 105 248 102 Z" />
        {/* Bird 3 */}
        <path d="M 226 112 Q 230 108 236 110 Q 232 111 235 115 Q 230 113 226 116 Q 224 114 226 112 Z" />
      </g>

      {/* ================= 3. GLOBE WITH CONTINENTS ================= */}
      <g id="globe">
        {/* Ocean Sphere */}
        <circle cx="260" cy="180" r="82" fill="url(#globeGrad)" />

        {/* Continents clipped to circle */}
        <g clipPath="url(#globeClip)">
          {/* North America / Greenland */}
          <path d="M 190 120 Q 200 110 215 115 T 235 110 T 230 135 T 210 145 T 195 140 T 190 120 Z" fill="#e4f2ff" opacity="0.9" />
          <path d="M 225 105 Q 235 95 245 108 T 235 118 Z" fill="#e4f2ff" opacity="0.9" />

          {/* Africa / Somali Peninsula (Horn of Africa) */}
          <path d="M 245 160 Q 260 150 280 155 Q 295 150 310 170 Q 320 180 325 190 Q 328 198 320 205 Q 312 210 300 215 Q 290 225 285 235 Q 275 235 268 220 Q 260 210 250 210 Q 242 200 240 185 Q 235 170 245 160 Z" fill="#ffffff" opacity="0.95" />
          
          {/* Saudi Arabia / Middle East */}
          <path d="M 285 145 Q 295 135 305 145 T 315 155 T 295 160 Z" fill="#ffffff" opacity="0.95" />

          {/* Europe */}
          <path d="M 235 125 Q 250 115 270 120 T 285 130 T 270 145 T 250 140 T 235 125 Z" fill="#ffffff" opacity="0.9" />

          {/* South America */}
          <path d="M 180 165 Q 195 170 190 190 T 185 220 T 175 240 T 168 220 T 172 190 Z" fill="#e4f2ff" opacity="0.85" />

          {/* South Asia & India */}
          <path d="M 320 140 Q 325 135 330 142 T 335 150" fill="#ffffff" opacity="0.9" />
          
          {/* Australia */}
          <path d="M 315 210 Q 330 205 340 220 T 325 235 T 310 225 Z" fill="#ffffff" opacity="0.85" />
        </g>

        {/* Subtle Inner Shadow overlay */}
        <circle cx="260" cy="180" r="82" fill="none" stroke="#2288ff" strokeWidth="2.5" opacity="0.5" />
      </g>

      {/* ================= 4. PALM TREE ================= */}
      <g id="palm-tree">
        {/* Trunk (Segmented and Curved) */}
        <path d="M 148 260 C 135 230 138 185 152 155" fill="none" stroke="url(#trunkGrad)" strokeWidth="9" strokeLinecap="round" />
        {/* Trunk details / Rings */}
        <path d="M 144 245 Q 140 243 138 244" stroke="#ffd9a6" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3" />
        <path d="M 141 225 Q 138 223 136 224" stroke="#ffd9a6" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3" />
        <path d="M 140 205 Q 138 203 136 204" stroke="#ffd9a6" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3" />
        <path d="M 142 185 Q 140 183 139 184" stroke="#ffd9a6" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3" />
        <path d="M 146 165 Q 144 163 143 164" stroke="#ffd9a6" strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.3" />

        {/* Coconuts */}
        <circle cx="151" cy="153" r="5" fill="#4a2503" />
        <circle cx="155" cy="156" r="4.5" fill="#582d05" />

        {/* Palm Leaves/Fronds (Arching outward from crown) */}
        {/* Leaf 1: Top-Left */}
        <path d="M 152 153 C 145 130 110 115 88 128 C 112 135 135 142 152 153 Z" fill="url(#leafGrad)" stroke="#1a5500" strokeWidth="1" />
        {/* Leaf 2: Bottom-Left */}
        <path d="M 152 153 C 135 145 95 145 83 164 C 102 165 125 160 152 153 Z" fill="url(#leafGrad)" stroke="#1a5500" strokeWidth="1" />
        {/* Leaf 3: Drooping Left */}
        <path d="M 152 153 C 138 160 102 175 100 200 C 115 190 132 175 152 153 Z" fill="url(#leafGrad)" stroke="#1a5500" strokeWidth="1" />
        
        {/* Leaf 4: Top-Center */}
        <path d="M 152 153 C 158 125 142 95 120 95 C 138 110 148 135 152 153 Z" fill="url(#leafGrad)" stroke="#1a5500" strokeWidth="1" />
        
        {/* Leaf 5: Top-Right */}
        <path d="M 152 153 C 168 130 195 110 208 120 C 190 135 170 145 152 153 Z" fill="url(#leafGrad)" stroke="#1a5500" strokeWidth="1" />
        {/* Leaf 6: Bottom-Right */}
        <path d="M 152 153 C 170 148 208 145 220 162 C 198 162 178 158 152 153 Z" fill="url(#leafGrad)" stroke="#1a5500" strokeWidth="1" />
      </g>

      {/* ================= 5. SWOOSH & FLIGHT PATH (ORANGE TRAIL) ================= */}
      <g id="swoosh">
        {/* Main Swooping Arc around the globe to the plane */}
        <path
          d="M 148 214 C 152 230 180 238 220 236 C 265 234 320 216 355 178 C 380 151 371 136 330 148 C 304 156 250 174 212 184 C 174 194 144 198 148 214 Z"
          fill="url(#swooshGrad)"
        />
      </g>

      {/* ================= 6. AIRPLANE ================= */}
      {/* Positioned flying upwards to the right at the end of the swoosh */}
      <g id="airplane" transform="translate(345, 115) rotate(-35)">
        {/* Sleek Blue Passenger Jet */}
        {/* Wings */}
        <path d="M -5 12 L 20 22 L 15 2 L -5 12" fill="#001aaa" />
        <path d="M 0 0 L -25 -25 L -18 -25 L 10 -2" fill="#032ad6" />
        {/* Fuselage Main Body */}
        <path d="M -30 -5 C -15 -8 15 -10 32 -3 C 35 -1 35 1 32 3 C 15 10 -15 8 -30 5 Z" fill="#0018a8" />
        {/* Nose cone tip */}
        <path d="M 32 -3 C 33.5 -2 33.5 0 32 3 L 24 0 Z" fill="#032ad6" />
        {/* Tail fin (Stabilizer) */}
        <path d="M -23 -3 L -35 -20 L -29 -20 L -17 -1 Z" fill="#0018a8" />
        {/* Horizontal rear fins */}
        <path d="M -25 2 L -32 10 L -29 10 L -21 3 Z" fill="#032ad6" stroke="#0018a8" strokeWidth="0.5" />
      </g>

      {/* ================= 7. BLUE C-CURVE WAVES AT THE BOTTOM ================= */}
      <g id="ocean-waves">
        {/* Wave 1 - Back */}
        <path
          d="M 70 270 Q 185 235 300 250 T 430 275 Q 300 240 185 245 T 70 270 Z"
          fill="url(#waveGrad)"
          opacity="0.8"
        />
        {/* Wave 2 - Front */}
        <path
          d="M 90 280 Q 210 240 330 255 T 450 282 Q 330 245 210 250 T 90 280 Z"
          fill="url(#waveGrad)"
        />
      </g>
    </svg>
  );
}
