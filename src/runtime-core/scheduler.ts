let isFlushPending = false;
const queue: any[] = [];
const p = Promise.resolve();
export function queueJobs(job: any) {
  if (!queue.includes(job)) {
    queue.push(job);
  }
  queueFlush();
}
export function nextTick(fn: any) {
  return fn ? p.then(fn) : p;
}
function queueFlush() {
  if (isFlushPending === true) {
    return;
  }
  isFlushPending = true;
//   将job放到微任务中执行
  nextTick(flushJobs);
}
// 将任务队列队头出队，执行
function flushJobs() {
  isFlushPending = false;
  let job;
  while ((job = queue.shift())) {
    job && job();
  }
}
