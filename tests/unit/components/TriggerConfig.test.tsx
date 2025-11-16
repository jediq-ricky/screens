import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@/lib/test-utils";
import TriggerConfig from "@/components/controller/TriggerConfig";

describe("TriggerConfig", () => {
  beforeEach(() => {
    global.fetch = vi.fn();
  });

  const defaultProps = {
    itemId: "item-1",
    playlistId: "playlist-1",
    triggerType: "NONE" as const,
    triggerConfig: null,
    onUpdate: vi.fn(),
  };

  it("should render trigger type button", () => {
    render(<TriggerConfig {...defaultProps} />);
    expect(screen.getByRole("button", { name: /trigger: controller/i })).toBeInTheDocument();
  });

  it("should expand configuration panel when button is clicked", () => {
    render(<TriggerConfig {...defaultProps} />);
    const button = screen.getByRole("button", { name: /trigger: controller/i });

    fireEvent.click(button);

    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();
  });

  it("should display trigger type select dropdown", () => {
    render(<TriggerConfig {...defaultProps} />);
    const button = screen.getByRole("button", { name: /trigger: controller/i });
    fireEvent.click(button);

    expect(screen.getByRole("combobox")).toBeInTheDocument();
  });

  it("should show keyboard config fields when KEYBOARD is selected", () => {
    render(<TriggerConfig {...defaultProps} />);
    const button = screen.getByRole("button", { name: /trigger: controller/i });
    fireEvent.click(button);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "KEYBOARD" } });

    expect(screen.getByPlaceholderText(/e\.g\., Enter, Space/i)).toBeInTheDocument();
  });

  it("should show click config fields when CLICK is selected", () => {
    render(<TriggerConfig {...defaultProps} />);
    const button = screen.getByRole("button", { name: /trigger: controller/i });
    fireEvent.click(button);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "CLICK" } });

    expect(screen.getByText(/click anywhere on the display screen/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/x coordinate/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/y coordinate/i)).toBeInTheDocument();
  });

  it("should show webcam config fields when WEBCAM is selected", () => {
    render(<TriggerConfig {...defaultProps} />);
    const button = screen.getByRole("button", { name: /trigger: controller/i });
    fireEvent.click(button);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "WEBCAM" } });

    expect(screen.getByLabelText(/motion sensitivity/i)).toBeInTheDocument();
  });

  it("should show microphone config fields when MICROPHONE is selected", () => {
    render(<TriggerConfig {...defaultProps} />);
    const button = screen.getByRole("button", { name: /trigger: controller/i });
    fireEvent.click(button);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "MICROPHONE" } });

    expect(screen.getByLabelText(/sound threshold/i)).toBeInTheDocument();
  });

  it("should save keyboard trigger configuration", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    global.fetch = mockFetch;
    const onUpdate = vi.fn();

    render(<TriggerConfig {...defaultProps} onUpdate={onUpdate} />);
    const button = screen.getByRole("button", { name: /trigger: controller/i });
    fireEvent.click(button);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "KEYBOARD" } });

    const keyInput = screen.getByPlaceholderText(/e\.g\., Enter, Space/i);
    fireEvent.change(keyInput, { target: { value: "1" } });

    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/playlists/playlist-1/items/item-1",
        expect.objectContaining({
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            triggerType: "KEYBOARD",
            triggerConfig: { key: "1" },
          }),
        })
      );
    });

    await waitFor(() => {
      expect(onUpdate).toHaveBeenCalledWith("item-1", "KEYBOARD", { key: "1" });
    });
  });

  it("should save NONE trigger type with null config", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    global.fetch = mockFetch;

    const propsWithTrigger = {
      ...defaultProps,
      triggerType: "KEYBOARD" as const,
      triggerConfig: { key: "1" },
    };

    render(<TriggerConfig {...propsWithTrigger} />);
    const button = screen.getByRole("button");
    fireEvent.click(button);

    const select = screen.getByRole("combobox");
    fireEvent.change(select, { target: { value: "NONE" } });

    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        "/api/playlists/playlist-1/items/item-1",
        expect.objectContaining({
          body: JSON.stringify({
            triggerType: "NONE",
            triggerConfig: null,
          }),
        })
      );
    });
  });

  it("should display existing keyboard trigger configuration", () => {
    const propsWithKeyboard = {
      ...defaultProps,
      triggerType: "KEYBOARD" as const,
      triggerConfig: { key: "5" },
    };

    render(<TriggerConfig {...propsWithKeyboard} />);
    expect(screen.getByRole("button", { name: /trigger: key: 5/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /trigger: key: 5/i }));
    expect(screen.getByDisplayValue("5")).toBeInTheDocument();
  });

  it("should close configuration panel on successful save", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true }),
    });
    global.fetch = mockFetch;

    render(<TriggerConfig {...defaultProps} />);
    const button = screen.getByRole("button", { name: /trigger: controller/i });
    fireEvent.click(button);

    // Panel is expanded - save and cancel buttons should be visible
    expect(screen.getByRole("button", { name: /save/i })).toBeInTheDocument();

    const saveButton = screen.getByRole("button", { name: /save/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      // Panel should be closed - save button should not be visible
      expect(screen.queryByRole("button", { name: /save/i })).not.toBeInTheDocument();
    });
  });

  it("should have cancel button to close panel without saving", () => {
    render(<TriggerConfig {...defaultProps} />);
    const button = screen.getByRole("button", { name: /trigger: controller/i });
    fireEvent.click(button);

    // Panel is expanded - cancel button should be visible
    expect(screen.getByRole("button", { name: /cancel/i })).toBeInTheDocument();

    const cancelButton = screen.getByRole("button", { name: /cancel/i });
    fireEvent.click(cancelButton);

    // Panel should be closed - cancel button should not be visible
    expect(screen.queryByRole("button", { name: /cancel/i })).not.toBeInTheDocument();
  });

  it("should display keyboard trigger with key information", () => {
    const propsWithKeyboard = {
      ...defaultProps,
      triggerType: "KEYBOARD" as const,
      triggerConfig: { key: "1" },
    };

    render(<TriggerConfig {...propsWithKeyboard} />);
    const button = screen.getByRole("button", { name: /trigger: key: 1/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveTextContent("Trigger: Key: 1");
  });
});
