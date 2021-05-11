export const rotatePoint = (point, pivot, angle) => {
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  const x = point.x - pivot.x;
  const y = point.y - pivot.y;
  const xnew = x * cos - y * sin;
  const ynew = x * sin + y * cos;

  return new p5.Vector(Math.floor(xnew + pivot.x), Math.floor(ynew + pivot.y));
};

// Calculate the projection of a polygon on an axis
// and returns it as a {min, max} interval
const projectPolygon = (axis, polygon) => {
  let min = axis.dot(polygon.points[0]);
  let max = min;

  for (let i = 0; i < polygon.points.length; i += 1) {
    const dotProduct = polygon.points[i].dot(axis);
    if (dotProduct < min) {
      min = dotProduct;
    } else if (dotProduct > max) {
      max = dotProduct;
    }
  }
  return { max, min };
};

export const polygonCollision = (polygonA, polygonB) => {
  const edgeCountA = polygonA.edges.length;
  const edgeCountB = polygonB.edges.length;

  // Loop through all the edges of both polygons
  for (let index = 0; index < edgeCountA + edgeCountB; index += 1) {
    const edge = index < edgeCountA ? polygonA.edges[index] : polygonB.edges[index - edgeCountA];

    // Find the axis perpendicular to the current edge
    const axis = new p5.Vector(-edge.y, edge.x).normalize();

    const projectionA = projectPolygon(axis, polygonA);
    const projectionB = projectPolygon(axis, polygonB);

    // Calculate the distance between [minA, maxA] and [minB, maxB]
    // The distance will be negative if the intervals overlap
    const intervalDistance = Math.max(projectionA.min, projectionB.min) - Math.min(projectionA.max, projectionB.max);

    // Check if the polygon projections are currentlty intersecting
    if (intervalDistance > 0) {
      return false;
    }
  }

  return true;
};
