export default class Loader {
  public percentage: number;
  public timerQueue: NodeJS.Timeout[];
  public progressBar: string[];
  public totalSpace: number;

  constructor() {
    this.percentage = 0;
    this.timerQueue = [];
    const columns = process.stdout.columns || 50;
    const spaces = this.getProgressBar(columns / 2);
    this.progressBar = spaces;
    this.totalSpace = spaces.length;
  }

  initializePercentage(percentage: number) {
    return Math.floor(percentage);
  }

  getProgressBar(columns: number) {
    if (columns <= 0) {
      throw new Error("Column less than 0 can not be specified");
    }
    let spaces: string[] = [];
    [...Array(columns - 2)].forEach(() => {
      spaces.push(" ");
    });

    spaces = [
      "[",
      ...spaces,
      "]"
    ]

    return spaces;
  }

  resetTimer() {
    const timer = this.timerQueue.shift();
    timer && clearInterval(timer);
  }

  print(_percentage: number, word: string) {
    const percentage = this.initializePercentage(_percentage);

    if (percentage === 100) {
      process.stdout.write("\\033c");
      process.stdout.write(`Completed! ... ${percentage}%\r`);
      return;
    }

    let count = 1;
    const diff = percentage - this.percentage;
    const interval = setInterval(() => {
      if (count >= diff) {
        this.resetTimer();
        return;
      }
      // reset
      process.stdout.write("\\033c");
      process.stdout.write(`Searching ${word} ... ${this.percentage + count}%\r`);
      count++;
    }, 100);
    this.timerQueue.push(interval);

    this.percentage = percentage;
  }

  updateProgressBar(percentage: number) {
    const totalIncreasingAmount = Math.floor(this.totalSpace * (percentage / 100));
    const initialProgressBar = this.progressBar;
    
    let progressBarPoints: string[] = [];
    const advanceProgressBar = () => {
      const progressStaus = progressBarPoints.length;

      if (progressStaus >= totalIncreasingAmount) {
        return true;
      }

      progressBarPoints.push("=");

      const remainingSpace = this.progressBar.length - 1;
      console.log(initialProgressBar.slice(2, remainingSpace - progressStaus))
      this.progressBar = [
        "[",
        ...progressBarPoints,
        ...initialProgressBar.slice(2, remainingSpace - progressStaus),
        "]"
      ];

      return false;
    }

    return advanceProgressBar;
  }

  printProgressBar(_percentage: number, word: string) {
    const percentage = this.initializePercentage(_percentage);
    const columns = process.stdout.columns;
    if (!columns) {
      return;
    }

    let count = 1;
    const diff = percentage - this.percentage;
    const advanceProgressBar = this.updateProgressBar(percentage);
    const interval = setInterval(() => {
      if (count >= diff) {
        this.resetTimer();
        return;
      }
      // reset
      process.stdout.write("\\033c");
      process.stdout.write(`${word} ${this.progressBar.join("")} ... ${this.percentage + count}`);
      advanceProgressBar();
      count++;
    }, 100);

    this.timerQueue.push(interval);
    this.percentage = percentage;
  }
}