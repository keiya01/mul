const readLine = require("readline");

export default class Loader {
  public percentage: number;
  public timerQueue: NodeJS.Timeout[];
  public progressBar: string[];
  public totalSpace: number;
  private progressBarPoints: string[];

  constructor() {
    this.percentage = 0;
    this.timerQueue = [];
    const columns = process.stdout.columns || 50;
    const spaces = this.getProgressBar(columns / 2);
    this.progressBar = spaces;
    this.totalSpace = spaces.length;
    this.progressBarPoints = [];
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
    const percentage = Math.floor(_percentage);

    if (percentage === 100) {
      readLine.clearLine(process.stdout, 0);
      readLine.cursorTo(process.stdout, 0, null);
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
      readLine.clearLine(process.stdout, 0);
      readLine.cursorTo(process.stdout, 0, null);
      process.stdout.write(`Searching ${word} ... ${this.percentage + count}%\r`);
      count++;
    }, 100);
    this.timerQueue.push(interval);

    this.percentage = percentage;
  }

  calculateProgressPercentage = () => {
    const totalProgressBarPoints = this.progressBarPoints.length - 1;
    // Measure progress of progress bar
    const progressPercentage = Math.floor((totalProgressBarPoints / this.totalSpace) * 100);

    return progressPercentage;
  }

  modifyProgressBar = (percentage: number) => {
    const prevProgressPercentage = this.calculateProgressPercentage();
    if (0 < prevProgressPercentage && prevProgressPercentage < percentage) {
      const modifiedProgressBarPercentage = percentage - prevProgressPercentage;
      const prevTotalIncreasingAmount = Math.floor(this.totalSpace * (modifiedProgressBarPercentage / 100));
      [...Array(prevTotalIncreasingAmount)].forEach(() => {
        this.progressBarPoints.push("=");
      });

      const totalProgressBarPoints = this.progressBarPoints.length;
      this.progressBar = [
        "[",
        ...this.progressBarPoints,
        ...this.progressBar.slice(totalProgressBarPoints, this.progressBar.length - 2),
        "]"
      ];
    }
  }

  updateProgressBar(percentage: number) {
    const prevProgressBar = this.progressBar;

    this.modifyProgressBar(percentage);

    const advanceProgressBar = () => {
      if (this.progressBarPoints.length >= this.totalSpace) {
        return true;
      }

      const totalProgressBarPoints = this.progressBarPoints.push("=");
      this.progressBar = [
        "[",
        ...this.progressBarPoints,
        ...prevProgressBar.slice(totalProgressBarPoints, this.progressBar.length - 2),
        "]"
      ];

      return false;
    }

    return advanceProgressBar;
  }

  printProgressBar(_percentage: number, word: string) {
    if (this.timerQueue.length !== 0) {
      this.resetTimer();
    }

    const percentage = Math.floor(_percentage);
    if(percentage === 0) {
      process.stdout.write(`${word} ${this.progressBar.join("")} ... 0%\r`);
    }

    const columns = process.stdout.columns;
    if (!columns) {
      return;
    }

    let count = 1;
    const diff = percentage - this.percentage;
    const advanceProgressBar = this.updateProgressBar(percentage);
    if (percentage === 100) {
      process.stdout.write(`completed! ${this.progressBar.join("")} ... 100%\r`);
    }

    const interval = setInterval(() => {
      if (count > diff) {
        this.resetTimer();
        return;
      }
      // reset
      readLine.clearLine(process.stdout, 0);
      readLine.cursorTo(process.stdout, 0, null);
      process.stdout.write(`${word} ${this.progressBar.join("")} ... ${this.percentage + count}%\r`);
      advanceProgressBar();
      count++;
    }, 100);

    this.timerQueue.push(interval);
    this.percentage = percentage;
  }
}