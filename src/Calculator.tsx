import React, { useState } from "react";
import "flatpickr/dist/themes/airbnb.css";

import Flatpickr from "react-flatpickr";
import { Chart } from "./Chart";
import { useGetWidth } from "./lib/use-get-width";

export function Calculator() {
  const [startDate, setStartDate] = useState(new Date());
  const [didSelectStartDate, setDidSelectStartDate] = useState(false);

  const [appWidth, ref] = useGetWidth();

  return (
    <div className="app-width flex-column" ref={ref}>
      <div
        className="flex-column"
        style={{ margin: "32px 0", alignItems: "flex-start" }}
      >
        <label htmlFor="date-picker" style={{ marginBottom: 8 }}>
          <span className="no-select">
            Select most recent time you could have been exposed to COVID-19
          </span>
        </label>
        <Flatpickr
          id="date-picker"
          data-enable-time
          value={startDate}
          onClose={(date) => {
            if (date.length === 0) return;
            setDidSelectStartDate(true);
            setStartDate(date[0]);
          }}
        />
      </div>

      {didSelectStartDate && appWidth !== null ? (
        <Chart startDate={startDate} appWidth={appWidth} />
      ) : null}
    </div>
  );
}
