import "./Chart.css";
import React, { useState, useEffect, useCallback } from "react";
import { cumulativeDistributionFunction } from "./lib/log-normal-distribution";
import { msToDays, daysToMs, dateToText } from "./lib/time";
import { useGetWidth } from "./lib/use-get-width";

const MAX_DAYS = 14;

type Props = {
  startDate: Date;
  appWidth: number;
};
export function Chart({ startDate, appWidth }: Props) {
  const startTimeMs = startDate.getTime();

  const [endDate, setEndDate] = useState(new Date(startTimeMs + maxMs / 2));

  const x0 = 32;
  const xWidth = appWidth - x0 * 2;

  const msBetweenDates = endDate.getTime() - startTimeMs;
  const daysBetweenDates = msToDays(msBetweenDates);
  const prob = cumulativeDistributionFunction(daysBetweenDates);
  const percentage = Math.round((1 - prob) * 100);

  const daysBetweenDatesX = x0 + xWidth * (msBetweenDates / maxMs);

  const pointsOnChart = 200;
  const y0 = 4;
  const yHeight = 200;

  const xAxisY = y0 + yHeight;

  const chartHeight = xAxisY + 110;

  const todayX =
    x0 + xWidth * ((new Date().getTime() - startDate.getTime()) / maxMs);
  const todayXOnChart = todayX >= x0 && todayX <= x0 + xWidth;

  useEffect(() => {
    setEndDate(todayXOnChart ? new Date() : new Date(startTimeMs + maxMs / 2));
  }, [startTimeMs, todayXOnChart]);

  const [sliderTextWidthCal, ref] = useGetWidth(endDate.getDate());

  // Slider
  const sliderTextWidth = (sliderTextWidthCal || 180) + 24;
  const sliderTextHeight = 40;
  const sliderKnobWidth = 40;
  const sliderKnobHeight = 30;

  const dateSliderMinX = clamp(
    daysBetweenDatesX - sliderTextWidth / 2,
    x0 - sliderKnobWidth / 2,
    x0 + xWidth + sliderKnobWidth / 2 - sliderTextWidth
  );
  const dateSliderMaxX = clamp(
    daysBetweenDatesX + sliderTextWidth / 2,
    x0 - sliderKnobWidth / 2 + sliderTextWidth,
    x0 + xWidth + sliderKnobWidth / 2
  );

  const [dragMidOffsetX, setDragMidOffsetX] = useState<number | null>(null);

  const isDragging = dragMidOffsetX !== null;

  useEffect(() => {
    if (isDragging) {
      document.body.style.cursor = "grabbing";
    } else {
      document.body.style.cursor = "auto";
    }
  }, [isDragging]);

  const pointerDown = useCallback(
    (e: React.PointerEvent) => {
      setDragMidOffsetX(daysBetweenDatesX - e.clientX);
    },
    [daysBetweenDatesX]
  );

  useEffect(() => {
    const pointerUp = () => setDragMidOffsetX(null);
    const pointerMove = (e: PointerEvent) => {
      if (dragMidOffsetX !== null) {
        const dragX = clamp(e.clientX + dragMidOffsetX - x0, 0, xWidth);
        const newEndTimeMs = (dragX / xWidth) * maxMs + startTimeMs;
        setEndDate(new Date(newEndTimeMs));
      }
    };

    window.addEventListener("pointerup", pointerUp);
    window.addEventListener("pointermove", pointerMove);
    return () => {
      window.removeEventListener("pointerup", pointerUp);
      window.removeEventListener("pointermove", pointerMove);
    };
  }, [dragMidOffsetX, startTimeMs, xWidth]);

  // avoid scrolling when dragging slider
  useEffect(() => {
    const onTouchMove = (e: TouchEvent) => {
      if (isDragging) {
        e.preventDefault();
      }
    };
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => {
      window.removeEventListener("touchmove", onTouchMove);
    };
  }, [isDragging]);

  return (
    <>
      <p className="m0 no-select" style={{ width: "50%", fontSize: 16 }}>
        Likelihood you're still in incubation period if infected on{" "}
        {dateToText(startDate)}
      </p>
      <svg width={appWidth} height={chartHeight}>
        {/* X axis */}
        <line x1={x0} x2={x0 + xWidth} y1={xAxisY} y2={xAxisY} stroke="grey" />
        {Array.from({ length: MAX_DAYS }).map((_, index) => {
          const x = x0 + (index + 1) * (xWidth / MAX_DAYS);
          return (
            <g key={index}>
              <line x1={x} x2={x} y1={xAxisY} y2={xAxisY + 5} stroke="grey" />
              <text x={x} y={xAxisY + 16} textAnchor="middle">
                {index + 1}
              </text>
            </g>
          );
        })}
        <text className="fill-black" x={x0 + xWidth + 8} y={xAxisY + 4}>
          Days
        </text>
        {/* Y axis */}
        <line x1={x0} x2={x0} y1={y0} y2={y0 + yHeight} stroke="grey" />
        {Array.from({ length: 6 }).map((_, index) => {
          const y = y0 + index * (yHeight / 5);
          return (
            <g key={index}>
              <line x1={x0} x2={x0 - 5} y1={y} y2={y} stroke="grey" />
              <text x={x0 - 8} y={y + 4} textAnchor="end">
                {100 - index * 20}%
              </text>
            </g>
          );
        })}
        {/* Distribution */}
        {Array.from({ length: pointsOnChart }).map((_, index) => (
          <circle
            key={index}
            cx={x0 + index * (xWidth / pointsOnChart)}
            cy={
              y0 +
              cumulativeDistributionFunction(
                index * (MAX_DAYS / pointsOnChart)
              ) *
                yHeight
            }
            r={1}
          />
        ))}
        {/* Axis cross lines */}
        <line
          x1={daysBetweenDatesX}
          x2={daysBetweenDatesX}
          y1={y0 + yHeight}
          y2={y0 + prob * yHeight}
          stroke="grey"
          strokeDasharray="1"
        />
        <line
          x1={x0}
          x2={daysBetweenDatesX}
          y1={y0 + prob * yHeight}
          y2={y0 + prob * yHeight}
          stroke="grey"
          strokeDasharray="1"
        />
        <text
          className={percentage === 100 ? "o0" : "chart-percent-text"}
          x={x0 + 4}
          y={y0 + prob * yHeight + (percentage > 80 ? 24 : -4)}
        >
          {percentage}%
        </text>
        {/* Today */}
        {todayXOnChart ? (
          <g>
            <line
              stroke="royalblue"
              x1={todayX - 4}
              x2={todayX}
              y1={y0 + yHeight - 10}
              y2={y0 + yHeight}
            />
            <line
              stroke="royalblue"
              x1={todayX + 4}
              x2={todayX}
              y1={y0 + yHeight - 10}
              y2={y0 + yHeight}
            />
            <text
              className="fill-blue"
              x={todayX}
              y={y0 + yHeight - 14}
              textAnchor="middle"
            >
              Now
            </text>
          </g>
        ) : null}
        {/* Date selector */}
        <line
          x1={x0}
          x2={x0 + xWidth}
          y1={y0 + yHeight + 85}
          y2={y0 + yHeight + 85}
          stroke="lightgrey"
          strokeWidth={5}
        />
        <rect
          width={sliderKnobWidth}
          height={sliderKnobHeight}
          x={daysBetweenDatesX - sliderKnobWidth / 2}
          y={y0 + yHeight + 70}
          fill="white"
        />
        <line
          x1={daysBetweenDatesX - 8}
          x2={daysBetweenDatesX}
          y1={y0 + yHeight + 30}
          y2={y0 + yHeight + 20}
          stroke="grey"
        />
        <line
          x1={daysBetweenDatesX + 8}
          x2={daysBetweenDatesX}
          y1={y0 + yHeight + 30}
          y2={y0 + yHeight + 20}
          stroke="grey"
        />
        <line
          x1={daysBetweenDatesX + 8}
          x2={dateSliderMaxX}
          y1={y0 + yHeight + 30}
          y2={y0 + yHeight + 30}
          stroke="grey"
        />
        <line
          x1={dateSliderMaxX}
          x2={dateSliderMaxX}
          y1={y0 + yHeight + 30}
          y2={y0 + yHeight + 30 + sliderTextHeight}
          stroke="grey"
        />
        <line
          x1={dateSliderMaxX}
          x2={daysBetweenDatesX + sliderKnobWidth / 2}
          y1={y0 + yHeight + 30 + sliderTextHeight}
          y2={y0 + yHeight + 30 + sliderTextHeight}
          stroke="grey"
        />
        <line
          x1={daysBetweenDatesX + sliderKnobWidth / 2}
          x2={daysBetweenDatesX + sliderKnobWidth / 2}
          y1={y0 + yHeight + 30 + sliderTextHeight}
          y2={y0 + yHeight + 30 + sliderTextHeight + sliderKnobHeight}
          stroke="grey"
        />
        <line
          x1={daysBetweenDatesX + sliderKnobWidth / 2}
          x2={daysBetweenDatesX - sliderKnobWidth / 2}
          y1={y0 + yHeight + 30 + sliderTextHeight + sliderKnobHeight}
          y2={y0 + yHeight + 30 + sliderTextHeight + sliderKnobHeight}
          stroke="grey"
        />
        <line
          x1={dateSliderMinX}
          x2={dateSliderMinX}
          y1={y0 + yHeight + 30}
          y2={y0 + yHeight + 30 + sliderTextHeight}
          stroke="grey"
        />
        <line
          x1={dateSliderMinX}
          x2={daysBetweenDatesX - sliderKnobWidth / 2}
          y1={y0 + yHeight + 30 + sliderTextHeight}
          y2={y0 + yHeight + 30 + sliderTextHeight}
          stroke="grey"
        />
        <line
          x1={daysBetweenDatesX - sliderKnobWidth / 2}
          x2={daysBetweenDatesX - sliderKnobWidth / 2}
          y1={y0 + yHeight + 30 + sliderTextHeight}
          y2={y0 + yHeight + 30 + sliderTextHeight + sliderKnobHeight}
          stroke="grey"
        />
        <line
          x1={dateSliderMinX}
          x2={daysBetweenDatesX - 8}
          y1={y0 + yHeight + 30}
          y2={y0 + yHeight + 30}
          stroke="grey"
        />
        <line
          x1={dateSliderMinX}
          x2={daysBetweenDatesX - 8}
          y1={y0 + yHeight + 30}
          y2={y0 + yHeight + 30}
          stroke="grey"
        />
        <line
          x1={daysBetweenDatesX - 10}
          x2={daysBetweenDatesX + 10}
          y1={y0 + yHeight + 80}
          y2={y0 + yHeight + 80}
          stroke="black"
        />
        <line
          x1={daysBetweenDatesX - 10}
          x2={daysBetweenDatesX + 10}
          y1={y0 + yHeight + 85}
          y2={y0 + yHeight + 85}
          stroke="black"
        />
        <line
          x1={daysBetweenDatesX - 10}
          x2={daysBetweenDatesX + 10}
          y1={y0 + yHeight + 90}
          y2={y0 + yHeight + 90}
          stroke="black"
        />
        <g ref={ref}>
          <text
            className="chart-date-slider"
            textAnchor="middle"
            x={clamp(
              daysBetweenDatesX,
              x0 - sliderKnobWidth / 2 + sliderTextWidth / 2,
              x0 + xWidth + sliderKnobWidth / 2 - sliderTextWidth / 2
            )}
            y={y0 + yHeight + 56}
          >
            {dateToText(endDate)}
          </text>
        </g>
        {/* Invisible Drag zone */}
        <g
          className={`o0 grab ${isDragging ? "grabbing" : ""}`}
          onPointerDown={pointerDown}
        >
          <rect
            width={sliderKnobWidth}
            height={sliderKnobHeight}
            x={daysBetweenDatesX - sliderKnobWidth / 2}
            y={y0 + yHeight + 70}
          />
          <rect
            width={sliderTextWidth}
            height={sliderTextHeight}
            x={daysBetweenDatesX - sliderTextWidth / 2}
            y={y0 + yHeight + 30}
          />
        </g>
      </svg>
    </>
  );
}

const maxMs = daysToMs(MAX_DAYS);

const clamp = (val: number, min: number, max: number) =>
  Math.max(Math.min(val, max), min);
