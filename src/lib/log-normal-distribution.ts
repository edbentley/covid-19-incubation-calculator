import erf from "math-erf";

const MEAN = 1.621;
const VARIANCE = 0.418;

export const cumulativeDistributionFunction = getCumulativeDistributionFunction(
  MEAN,
  VARIANCE
);

function getCumulativeDistributionFunction(mean: number, stdDev: number) {
  return (days: number) => {
    if (days === 0) return 0;
    return 0.5 * (1 + erf((Math.log(days) - mean) / (stdDev * Math.sqrt(2))));
  };
}
