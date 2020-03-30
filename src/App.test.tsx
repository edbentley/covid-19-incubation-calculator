import React from "react";
import { render } from "@testing-library/react";
import App from "./App";

test("renders agreeement", () => {
  const { getByText } = render(<App />);
  const linkElement = getByText(/Got it/i);
  expect(linkElement).toBeInTheDocument();
});
