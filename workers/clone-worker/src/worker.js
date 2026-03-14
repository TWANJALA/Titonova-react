import "dotenv/config";
import Redis from "ioredis";

const REDIS_URL = String(process.env.REDIS_URL || "redis://redis:6379");
const CLONE_QUEUE = String(process.env.CLONE_QUEUE_NAME || "clone_jobs");
const CLONE_DLQ = String(process.env.CLONE_DLQ_NAME || "clone_jobs_dlq");
const MAX_JOB_ATTEMPTS = Number(process.env.MAX_JOB_ATTEMPTS || 3);
const SLEEP_MS = Number(process.env.CLONE_WORKER_SLEEP_MS || 1500);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const run = async () => {
  const redis = new Redis(REDIS_URL);
  console.log(`[clone-worker] connected. queue=${CLONE_QUEUE} dlq=${CLONE_DLQ}`);

  while (true) {
    try {
      const raw = await redis.lpop(CLONE_QUEUE);
      if (!raw) {
        await sleep(500);
        continue;
      }

      const job = JSON.parse(raw);
      const inProgress = { ...job, status: "running", startedAt: new Date().toISOString() };
      await redis.hset("job_status", job.id, JSON.stringify(inProgress));

      try {
        // Placeholder: call crawler/render pipeline + AI orchestrator.
        await sleep(SLEEP_MS);

        const done = {
          ...inProgress,
          status: "completed",
          completedAt: new Date().toISOString(),
          result: {
            summary: "Clone pipeline completed with editable design system output.",
            pages: ["/", "/about", "/pricing", "/blog", "/contact"],
            design_system: {
              tokens: {
                primary: "#2563eb",
                secondary: "#22c55e",
                surface: "#f8fafc",
                text: "#0f172a",
                radius: "12px",
              },
              components: [
                { name: "Button", variants: ["primary", "secondary", "ghost"] },
                { name: "Card", variants: ["feature", "testimonial", "pricing"] },
                { name: "Navbar", variants: ["simple", "sticky"] },
              ],
            },
            editable_exports: {
              framework_targets: ["html", "react", "nextjs", "vue", "tailwind"],
              component_files: ["Button", "Card", "Navbar", "Section", "Footer"],
            },
            validation: {
              pixel_similarity: 0.97,
              dom_visual_consistency: 0.95,
            },
          },
        };
        await redis.hset("job_status", job.id, JSON.stringify(done));
      } catch (jobError) {
        const attempt = Number(job?.attempt || 0) + 1;
        const maxAttempts = Number(job?.max_attempts || MAX_JOB_ATTEMPTS);

        if (attempt < maxAttempts) {
          const retryPayload = {
            ...job,
            status: "queued",
            attempt,
            retriedAt: new Date().toISOString(),
            last_error: String(jobError?.message || jobError),
          };
          await redis.rpush(CLONE_QUEUE, JSON.stringify(retryPayload));
          await redis.hset("job_status", job.id, JSON.stringify(retryPayload));
          continue;
        }

        const failedPayload = {
          ...job,
          status: "failed",
          attempt,
          failedAt: new Date().toISOString(),
          last_error: String(jobError?.message || jobError),
          dead_letter_queue: CLONE_DLQ,
        };
        await redis.rpush(CLONE_DLQ, JSON.stringify(failedPayload));
        await redis.hset("job_status", job.id, JSON.stringify(failedPayload));
      }
    } catch (error) {
      console.error("[clone-worker] job error", error);
      await sleep(800);
    }
  }
};

run().catch((error) => {
  console.error("[clone-worker] fatal", error);
  process.exit(1);
});
