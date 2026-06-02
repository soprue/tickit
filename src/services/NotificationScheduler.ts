import { powerMonitor } from 'electron';

export class NotificationScheduler {
  private timer: NodeJS.Timeout | null = null;
  private readonly resumeHandler: () => void;

  constructor(private readonly onCheck: () => void) {
    this.resumeHandler = () => {
      this.onCheck();
    };
  }

  start() {
    powerMonitor.on('resume', this.resumeHandler);
  }

  scheduleNext() {
    if (this.timer) clearTimeout(this.timer);

    const now = new Date();
    const delay = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds()) + 500;
    this.timer = setTimeout(this.onCheck, Math.max(1000, delay));
  }

  stop() {
    if (this.timer) clearTimeout(this.timer);
    powerMonitor.removeListener('resume', this.resumeHandler);
  }
}
