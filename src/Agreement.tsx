import React from "react";
import { Footer } from "./Footer";

type Props = {
  onAgree: () => void;
};

export function Agreement({ onAgree }: Props) {
  return (
    <>
      <div
        className="app-width flex-column"
        style={{ alignItems: "center", marginTop: 16 }}
      >
        <h2 style={{ textAlign: "center" }}>COVID-19 Incubation Calculator</h2>
        <ul style={{ width: "app-width" }}>
          <li>
            The incubation period is the time between catching the disease and
            showing symptoms
          </li>
          <li>
            This app predicts incubation times based on the results of{" "}
            <a href="https://annals.org/aim/fullarticle/2762808/incubation-period-coronavirus-disease-2019-covid-19-from-publicly-reported">
              this study published in Annals of Internal Medicine on 10th March
              2020
            </a>
          </li>
          <li>
            This app is for information purposes only and does not constitute
            advice
          </li>
          <li>Always follow your government and health authority guidelines</li>
        </ul>
        <button onClick={onAgree}>
          Got it{" "}
          <span role="img" aria-label="thumbs up">
            👍
          </span>
        </button>
      </div>
      <Footer />
    </>
  );
}
