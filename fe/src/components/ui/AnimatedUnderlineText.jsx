import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * AnimatedText — Renders a heading with an animated SVG underline.
 *
 * Props:
 *  - text              {string}   — The text to display.
 *  - textClassName     {string}   — Additional classes for the <h1>.
 *  - underlineClassName{string}   — Additional classes for the SVG container.
 *  - underlinePath     {string}   — The SVG path 'd' attribute (default wavy line).
 *  - underlineHoverPath{string}   — The SVG path 'd' on hover (inverse wave).
 *  - underlineDuration {number}   — Duration (seconds) for the draw animation.
 *  - className         {string}   — Additional classes for the wrapper div.
 */
const AnimatedText = React.forwardRef(
  (
    {
      text,
      textClassName,
      textStyle,
      underlineClassName,
      underlinePath = 'M 0,10 Q 75,0 150,10 Q 225,20 300,10',
      underlineHoverPath = 'M 0,10 Q 75,20 150,10 Q 225,0 300,10',
      underlineDuration = 1.5,
      className,
      ...props
    },
    ref
  ) => {
    const pathVariants = {
      hidden: {
        pathLength: 0,
        opacity: 0,
      },
      visible: {
        pathLength: 1,
        opacity: 1,
        transition: {
          duration: underlineDuration,
          ease: 'easeInOut',
        },
      },
    };

    return (
      <div
        ref={ref}
        className={cn('flex flex-col items-center justify-center gap-2', className)}
        {...props}
      >
        <div className="relative">
          <motion.h1
            className={cn('text-4xl font-bold text-center', textClassName)}
            style={textStyle}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            whileHover={{ scale: 1.02 }}
          >
            {text}
          </motion.h1>

          <motion.svg
            width="100%"
            height="20"
            viewBox="0 0 300 20"
            className={cn('absolute -bottom-4 left-0', underlineClassName)}
          >
            <motion.path
              d={underlinePath}
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              variants={pathVariants}
              initial="hidden"
              animate="visible"
              whileHover={{
                d: underlineHoverPath,
                transition: { duration: 0.8 },
              }}
            />
          </motion.svg>
        </div>
      </div>
    );
  }
);

AnimatedText.displayName = 'AnimatedText';

export { AnimatedText };
