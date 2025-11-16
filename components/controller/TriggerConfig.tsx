"use client";

import { useState } from "react";
import type { TriggerType } from "@/lib/generated/prisma";

interface TriggerConfigProps {
  itemId: string;
  playlistId: string;
  triggerType: TriggerType;
  triggerConfig: Record<string, unknown> | null;
  onUpdate: (itemId: string, triggerType: TriggerType, triggerConfig: Record<string, unknown> | null) => void;
}

export default function TriggerConfig({
  itemId,
  playlistId,
  triggerType: initialType,
  triggerConfig: initialConfig,
  onUpdate,
}: TriggerConfigProps) {
  const [triggerType, setTriggerType] = useState<TriggerType>(initialType);
  const [config, setConfig] = useState<Record<string, unknown>>(initialConfig || {});
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch(`/api/playlists/${playlistId}/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          triggerType,
          triggerConfig: triggerType === "NONE" ? null : config,
        }),
      });

      if (response.ok) {
        onUpdate(itemId, triggerType, triggerType === "NONE" ? null : config);
        setIsExpanded(false);
      } else {
        const error = await response.json();
        alert(`Failed to save trigger: ${error.error || "Unknown error"}`);
      }
    } catch (error) {
      console.error("Failed to save trigger:", error);
      alert("Failed to save trigger");
    } finally {
      setIsSaving(false);
    }
  };

  const renderConfigFields = () => {
    switch (triggerType) {
      case "KEYBOARD":
        return (
          <div>
            <label htmlFor={`key-${itemId}`} className="block text-sm font-medium text-gray-700 mb-1">
              Key *
            </label>
            <input
              id={`key-${itemId}`}
              type="text"
              value={(config.key as string) || ""}
              onChange={(e) => setConfig({ ...config, key: e.target.value })}
              placeholder="e.g., Enter, Space, a, 1"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Enter a key like "Enter", "Space", "a", "1", etc.
            </p>
          </div>
        );

      case "CLICK":
        return (
          <div className="space-y-3">
            <p className="text-sm text-gray-600">
              Click anywhere on the display screen to trigger this video
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor={`click-x-${itemId}`} className="block text-sm font-medium text-gray-700 mb-1">
                  X Coordinate (optional)
                </label>
                <input
                  id={`click-x-${itemId}`}
                  type="number"
                  value={(config.x as number) || ""}
                  onChange={(e) => setConfig({ ...config, x: parseInt(e.target.value) || undefined })}
                  placeholder="Any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
              <div>
                <label htmlFor={`click-y-${itemId}`} className="block text-sm font-medium text-gray-700 mb-1">
                  Y Coordinate (optional)
                </label>
                <input
                  id={`click-y-${itemId}`}
                  type="number"
                  value={(config.y as number) || ""}
                  onChange={(e) => setConfig({ ...config, y: parseInt(e.target.value) || undefined })}
                  placeholder="Any"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>
            <p className="text-xs text-gray-500">
              Leave coordinates empty to trigger on any click
            </p>
          </div>
        );

      case "WEBCAM":
        return (
          <div>
            <label htmlFor={`webcam-sensitivity-${itemId}`} className="block text-sm font-medium text-gray-700 mb-1">
              Motion Sensitivity (0-100)
            </label>
            <input
              id={`webcam-sensitivity-${itemId}`}
              type="number"
              min="0"
              max="100"
              value={(config.sensitivity as number) || 50}
              onChange={(e) => setConfig({ ...config, sensitivity: parseInt(e.target.value) || 50 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Higher values = more sensitive to motion (default: 50)
            </p>
          </div>
        );

      case "MICROPHONE":
        return (
          <div>
            <label htmlFor={`mic-threshold-${itemId}`} className="block text-sm font-medium text-gray-700 mb-1">
              Sound Threshold (0-100)
            </label>
            <input
              id={`mic-threshold-${itemId}`}
              type="number"
              min="0"
              max="100"
              value={(config.threshold as number) || 50}
              onChange={(e) => setConfig({ ...config, threshold: parseInt(e.target.value) || 50 })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <p className="text-xs text-gray-500 mt-1">
              Higher values = require louder sounds (default: 50)
            </p>
          </div>
        );

      case "NONE":
      default:
        return (
          <p className="text-sm text-gray-600">
            This video will be triggered from the controller interface
          </p>
        );
    }
  };

  const getTriggerLabel = () => {
    switch (triggerType) {
      case "KEYBOARD":
        return config.key ? `Key: ${config.key}` : "Keyboard";
      case "CLICK":
        return config.x && config.y ? `Click at (${config.x}, ${config.y})` : "Click anywhere";
      case "WEBCAM":
        return `Motion (${config.sensitivity || 50}%)`;
      case "MICROPHONE":
        return `Sound (${config.threshold || 50}%)`;
      case "NONE":
      default:
        return "Controller";
    }
  };

  return (
    <div className="mt-2 border-t border-gray-200 pt-2">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center justify-between w-full text-left text-sm text-gray-700 hover:text-gray-900"
      >
        <span className="font-medium">Trigger: {getTriggerLabel()}</span>
        <span className="text-gray-400">{isExpanded ? "▼" : "▶"}</span>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3 bg-gray-50 p-3 rounded-md">
          <div>
            <label htmlFor={`trigger-type-${itemId}`} className="block text-sm font-medium text-gray-700 mb-1">
              Trigger Type
            </label>
            <select
              id={`trigger-type-${itemId}`}
              value={triggerType}
              onChange={(e) => {
                setTriggerType(e.target.value as TriggerType);
                setConfig({});
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            >
              <option value="NONE">Controller (Manual)</option>
              <option value="KEYBOARD">Keyboard</option>
              <option value="CLICK">Click</option>
              <option value="WEBCAM">Webcam Motion</option>
              <option value="MICROPHONE">Microphone Sound</option>
            </select>
          </div>

          {renderConfigFields()}

          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => {
                setTriggerType(initialType);
                setConfig(initialConfig || {});
                setIsExpanded(false);
              }}
              disabled={isSaving}
              className="px-3 py-1 text-sm text-gray-700 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
