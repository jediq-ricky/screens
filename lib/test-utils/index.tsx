import { render, RenderOptions } from "@testing-library/react";
import { ReactElement } from "react";

// Add custom render function with providers here as needed
function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
) {
  return render(ui, { ...options });
}

export * from "@testing-library/react";
export { customRender as render };
