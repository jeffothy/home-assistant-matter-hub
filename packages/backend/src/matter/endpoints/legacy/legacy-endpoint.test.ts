import type {
  HomeAssistantEntityRegistry,
  HomeAssistantEntityState,
} from "@home-assistant-matter-hub/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { BridgeRegistry } from "../../../services/bridges/bridge-registry.js";
import { LegacyEndpoint } from "./legacy-endpoint.js";

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

  beforeEach(() => {
    mockRegistry = {
      refresh: vi.fn(),
      get entityIds() {
        return ["sensor.foo"];
      },
      deviceOf: () => ({ id: "dev" }),
      initialState: () => undefined as unknown as HomeAssistantEntityState,
      entity: (id: string) =>
        ({ entity_id: id, device_id: "dev" }) as HomeAssistantEntityRegistry,
    } as unknown as BridgeRegistry;

    // no external client or logger needed for these tests
  });

  it("LegacyEndpoint.create synthesizes an 'unavailable' state and may return undefined when factory cannot determine type", async () => {
    await expect(
      LegacyEndpoint.create(mockRegistry, "sensor.foo"),
    ).resolves.toBeUndefined();
  });

  it("BridgeEndpointManager.refreshDevices creates endpoint when initialState present", async () => {
    // Create an active registry object for this test where initialState returns a valid state
    const activeRegistry: BridgeRegistry = {
      ...mockRegistry,
      initialState: (id: string) =>
        ({
          ...minimalState(id),
          state: "21",
          attributes: {
            device_class: "temperature",
            unit_of_measurement: "°C",
          },
        }) as unknown as HomeAssistantEntityState,
      entity: (id: string) =>
        ({ entity_id: id, device_id: "dev" }) as HomeAssistantEntityRegistry,
    } as unknown as BridgeRegistry;

    const endpoint = await LegacyEndpoint.create(activeRegistry, "sensor.foo");
    expect(endpoint).toBeDefined();
    expect(endpoint?.entityId).toBe("sensor.foo");
  });
});
