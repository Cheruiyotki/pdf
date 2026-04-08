type QueueTask = {
  id: string;
  priority: number;
  run: () => Promise<void>;
};

export class AsyncJobQueue {
  private readonly concurrency: number;
  private readonly tasks: QueueTask[] = [];
  private active = 0;

  constructor(concurrency = 4) {
    this.concurrency = concurrency;
  }

  add(task: QueueTask) {
    this.tasks.push(task);
    this.tasks.sort((a, b) => b.priority - a.priority);
    queueMicrotask(() => this.drain());
  }

  private drain() {
    while (this.active < this.concurrency && this.tasks.length > 0) {
      const task = this.tasks.shift();

      if (!task) {
        return;
      }

      this.active += 1;
      task
        .run()
        .catch(() => undefined)
        .finally(() => {
          this.active -= 1;
          this.drain();
        });
    }
  }
}
