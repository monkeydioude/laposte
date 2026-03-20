import { describe, it, expect } from "vitest";
import { validatePayload } from "../src/validatePayload";


describe("validatePayload", () => {
  it("should skip old events without dedup_id", () => {
    const raw = { 
      email: "test@gmail.com", 
      firstname: "Syuzi", 
      lastname: "Dourish" 
    };
    const result = validatePayload("new.user", raw);
    
    expect(result.email).toBe("test@gmail.com");
    expect(result.dedup_id).toBeUndefined();
  });

  it("should correctly pick up dedup_id if it is passed", () => {
    const raw = { 
      email: "test@gmail.com", 
      firstname: "Syuzi", 
      lastname: "Dourish", 
      dedup_id: "welcome-001" 
    };
    const result = validatePayload("new.user", raw);
    
    expect(result.dedup_id).toBe("welcome-001");
  });
});
