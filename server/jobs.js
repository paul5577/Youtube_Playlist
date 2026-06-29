let nextId = 1;
const jobs = new Map();

export function createJob(runner) {
  const id = String(nextId++);
  const job = { id, status: 'running', logs: [], result: null, error: null, startedAt: Date.now() };
  jobs.set(id, job);

  const log = (msg) => {
    job.logs.push(msg);
  };

  Promise.resolve()
    .then(() => runner(log))
    .then((result) => {
      job.status = 'done';
      job.result = result;
    })
    .catch((err) => {
      job.status = 'error';
      job.error = err.message;
      log(`ERROR: ${err.message}`);
    });

  return id;
}

export function getJob(id) {
  return jobs.get(id) || null;
}
