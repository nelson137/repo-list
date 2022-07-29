export const dist = (x1: number, y1: number, x2: number, y2: number): number =>
    Math.sqrt((x2 - x1) * (x2 - x1) + (y2 - y1) * (y2 - y1));

/**
 * Return true iff there is overlap between `a` and `b` in the y axis.
 */
export const rects_overlap_y = (a: DOMRect, b: DOMRect): boolean =>
    (a.top <= b.top && a.bottom >= b.top) || (b.top <= a.top && b.bottom >= a.top);
