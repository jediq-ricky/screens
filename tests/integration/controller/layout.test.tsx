import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ControllerLayout from "@/app/controller/layout";

describe("Controller Layout", () => {
  it("should render Monitor navigation link", () => {
    render(
      <ControllerLayout>
        <div>Test Content</div>
      </ControllerLayout>
    );

    const monitorLink = screen.getByRole("link", { name: /Monitor/i });
    expect(monitorLink).toBeInTheDocument();
    expect(monitorLink).toHaveAttribute("href", "/controller/monitor");
  });

  it("should render all navigation links", () => {
    render(
      <ControllerLayout>
        <div>Test Content</div>
      </ControllerLayout>
    );

    expect(screen.getByRole("link", { name: /Monitor/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Videos/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Displays/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Playlists/i })).toBeInTheDocument();
  });

  it("should render Monitor link as first navigation item", () => {
    render(
      <ControllerLayout>
        <div>Test Content</div>
      </ControllerLayout>
    );

    const links = screen.getAllByRole("link");
    const navLinks = links.filter((link) =>
      [/Monitor/i, /Videos/i, /Displays/i, /Playlists/i].some((pattern) =>
        pattern.test(link.textContent || "")
      )
    );

    expect(navLinks[0]).toHaveTextContent(/Monitor/i);
  });
});
