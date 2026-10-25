import { describe, expect, it } from "vitest";
import { retryDelayMs, transitionJob } from "../src/domain/engine.js";
describe("durable workflow transitions", () => {
  it("moves retryable failures back to the queue with bounded backoff", () => { const running=transitionJob({id:"j",status:"queued",attempts:0,updatedAt:"t0"},{type:"claim",now:"t1"}); const retry=transitionJob(running,{type:"fail",now:"t2",message:"temporary",maxAttempts:3}); expect(retry.status).toBe("retry_wait"); expect(retryDelayMs(8,1000,5000)).toBe(5000); });
  it("rejects invalid transitions", () => { expect(()=>transitionJob({id:"j",status:"queued",attempts:0,updatedAt:"t0"},{type:"succeed",now:"t1"})).toThrow(); });
});