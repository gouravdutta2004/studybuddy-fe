/**
 * cn — Utility to merge class names together.
 * A lightweight alternative to clsx + tailwind-merge.
 * Filters out falsy values and joins with a space.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
