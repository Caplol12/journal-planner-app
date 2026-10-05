export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleInDegrees: number
): { x: number; y: number } {
  const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
  return {
    x: cx + radius * Math.cos(angleInRadians),
    y: cy + radius * Math.sin(angleInRadians),
  };
}

export function describeArc(
  cx: number,
  cy: number,
  rIn: number,
  rOut: number,
  startAngle: number,
  endAngle: number
): string {
  const p1 = polarToCartesian(cx, cy, rOut, startAngle);
  const p2 = polarToCartesian(cx, cy, rOut, endAngle);
  const p3 = polarToCartesian(cx, cy, rIn, endAngle);
  const p4 = polarToCartesian(cx, cy, rIn, startAngle);
  const largeArc = endAngle - startAngle <= 180 ? 0 : 1;

  return [
    'M',
    p1.x.toFixed(2),
    p1.y.toFixed(2),
    'A',
    rOut,
    rOut,
    0,
    largeArc,
    1,
    p2.x.toFixed(2),
    p2.y.toFixed(2),
    'L',
    p3.x.toFixed(2),
    p3.y.toFixed(2),
    'A',
    rIn,
    rIn,
    0,
    largeArc,
    0,
    p4.x.toFixed(2),
    p4.y.toFixed(2),
    'Z',
  ].join(' ');
}
