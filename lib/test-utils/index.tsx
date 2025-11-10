import { render, RenderOptions } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ReactElement } from "react";

// Add custom render function with providers here as needed
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return {
    user: userEvent.setup(),
    ...render(ui, { ...options }),
  };
}

export * from "@testing-library/react";
export { customRender as render };
