export type JobStatus = "queued" | "running" | "retry_wait" | "succeeded" | "failed";
export interface JobState { id: string; status: JobStatus; attempts: number; updatedAt: string; error?: string }
export type JobEvent = { type:"claim"; now:string } | { type:"succeed"; now:string } | { type:"fail"; now:string; message:string; maxAttempts:number };
export function transitionJob(job: JobState, event: JobEvent): JobState {
  if(event.type==="claim"){if(job.status!=="queued"&&job.status!=="retry_wait")throw new Error("job cannot be claimed from " + job.status);return {...job,status:"running",attempts:job.attempts+1,updatedAt:event.now,error:undefined};}
  if(job.status!=="running")throw new Error("job must be running before completion");
  if(event.type==="succeed")return {...job,status:"succeeded",updatedAt:event.now,error:undefined};
  if(!Number.isInteger(event.maxAttempts)||event.maxAttempts<1)throw new RangeError("maxAttempts must be positive");
  return {...job,status:job.attempts<event.maxAttempts?"retry_wait":"failed",updatedAt:event.now,error:event.message};
}
export function retryDelayMs(attempt: number, baseMs = 1000, maximumMs = 60000): number {
  if(!Number.isInteger(attempt)||attempt<1||baseMs<0||maximumMs<0)throw new RangeError("retry inputs are invalid");return Math.min(maximumMs,baseMs*2**(attempt-1));
}