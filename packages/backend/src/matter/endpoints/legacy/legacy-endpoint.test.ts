import { describe, it, expect, vi, beforeEach } from "vitest";
import { BridgeEndpointManager } from "../../../services/bridges/bridge-endpoint-manager.js";
import { LegacyEndpoint } from "./legacy-endpoint.js";
import type { BridgeRegistry } from "../../../services/bridges/bridge-registry.js";
import type { HomeAssistantClient } from "../../../services/home-assistant/home-assistant-client.js";
import type { Logger } from "@matter/general";
import type { HomeAssistantEntityState, HomeAssistantEntityRegistry } from "@home-assistant-matter-hub/common";

describe("LegacyEndpoint missing-state handling", () => {
  const minimalState = (entityId: string): HomeAssistantEntityState => ({
    entity_id: entityId,
    state: "unknown",
    last_changed: new Date().toISOString(),
    last_updated: new Date().toISOString(),
    attributes: {},
    context: { id: "ctx" },
  });

  let mockRegistry: BridgeRegistry;
  let mockClient: HomeAssistantClient;
  let mockLog: Logger;

  beforeEach(() => {
    mockRegistry = {
      refresh: vi.fn(),
      get entityIds() {
        return ["sensor.foo"];
      },
      deviceOf: () => ({ id: "dev" }),
      initialState: () => undefined as unknown as HomeAssistantEntityState,
      entity: (id: string) => ({ entity_id: id, device_id: "dev" } as HomeAssistantEntityRegistry),
    } as unknown as BridgeRegistry;

    mockClient = { connection: {} } as unknown as HomeAssistantClient;
    mockLog = { warn: vi.fn(), error: vi.fn(), info: vi.fn() } as unknown as Logger;
  });

  it("BridgeEndpointManager.refreshDevices skips creation and logs when initialState missing", async () => {
    const mgr = new BridgeEndpointManager(mockClient, mockRegistry, mockLog);

    await expect(mgr.refreshDevices()).resolves.toBeUndefined();
    expect(mockLog.warn).toHaveBeenCalledWith(expect.stringContaining("Skipping creation for sensor.foo"));
  });

  it("LegacyEndpoint.create throws when factory reads attributes and state is missing", async () => {
    await expect(LegacyEndpoint.create(mockRegistry, "sensor.foo")).rejects.toThrow();
  });

  it("BridgeEndpointManager.refreshDevices creates endpoint when initialState present", async () => {
    // Create an active registry object for this test where initialState returns a valid state
    const activeRegistry: BridgeRegistry = {
      ...mockRegistry,
      initialState: (id: string) => ({
        ...minimalState(id),
        state: "21",
        attributes: { device_class: "temperature", unit_of_measurement: "°C" },
      }) as unknown as HomeAssistantEntityState,
      entity: (id: string) => ({ entity_id: id, device_id: "dev" } as HomeAssistantEntityRegistry),
    } as unknown as BridgeRegistry;

    const endpoint = await LegacyEndpoint.create(activeRegistry, "sensor.foo");
    expect(endpoint).toBeDefined();
    expect(endpoint?.entityId).toBe("sensor.foo");
  });
});
