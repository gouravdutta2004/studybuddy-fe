import { Suspense, lazy } from 'react';

const Spline = lazy(() => import('@splinetool/react-spline'));

/**
 * InteractiveRobotSpline — Lazy-loads a Spline 3D scene embed.
 *
 * Props:
 *  - scene      {string}  — The Spline .splinecode scene URL (required).
 *  - className  {string}  — Extra CSS classes applied to the Spline canvas wrapper.
 */
export function InteractiveRobotSpline({ scene, className = '' }) {
  return (
    <Suspense
      fallback={
        <div
          className={`w-full h-full flex items-center justify-center bg-gray-900 text-white ${className}`}
        >
          {/* Spinner */}
          <svg
            className="animate-spin h-8 w-8 text-indigo-400 mr-3"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2.647z"
            />
          </svg>
          <span style={{ fontFamily: '"Space Grotesk",sans-serif', fontWeight: 700 }}>
            Loading 3D Scene…
          </span>
        </div>
      }
    >
      <Spline scene={scene} className={className} />
    </Suspense>
  );
}
