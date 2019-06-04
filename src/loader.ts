export default class Loader {
  public percentage: number;
  public timerQueue: NodeJS.Timeout[];

  constructor(percentage: number) {
    this.percentage = percentage;
    this.timerQueue = [];
  }

  resetTimer() {
    const timer = this.timerQueue.shift();
    timer && clearInterval(timer);
  }

  print(_percentage: number, word: string) {
    const percentage = Math.floor(_percentage);

    if (percentage === 100) {
      process.stdout.write("                                                                                                                                                    \r");
      process.stdout.write(`Completed! ... ${percentage}%\r`);
      return;
    }

    // console.log(percentage, this.percentage, (percentage - this.percentage))

    let count = 1;
    const diff = percentage - this.percentage;
    const interval = setInterval(() => {
      if (count >= diff) {
        this.resetTimer();
        return;
      }
      // reset
      process.stdout.write("                                                                                                                                                    \r");
      process.stdout.write(`Searching ${word} ... ${this.percentage + count}%\r`);
      count++;
    }, 100);
    this.timerQueue.push(interval);

    this.percentage = percentage;
  }
}