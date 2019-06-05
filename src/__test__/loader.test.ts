import Loader from "../loader";

describe("Test to check that be able to get progress bar", () => {
  const tests = [
    {
      description: "Input 5 to argument that receive columns",
      data: 7,
      result: ["[", " ", " ", " ", " ", " ", "]"],
      isError: false
    },
    {
      description: "Check that to output an error when argument was specified as 0",
      data: 0,
      result: new Error("Column less than 0 can not be specified"),
      isError: true
    },
    {
      description: "Check that to output an error when argument was specified as -1",
      data: -1,
      result: new Error("Column less than 0 can not be specified"),
      isError: true
    }
  ];

  tests.forEach(({ description, data, result, isError }) => {
    test(description, () => {
      const loader = new Loader();

      if (isError && result instanceof Error) {
        expect(() => loader.getProgressBar(data)).toThrowError(result);
        return;
      }

      expect(loader.getProgressBar(data)).toEqual(result);
    });
  });
});

describe("Check function to update and advance progress bar", function () {
  // process.stdout.columnsで値を取得しており、値が不確実なため10で固定する
  const TotalSpace = 50;
  const ProgressBar = [
    "[",
    ...[...Array(TotalSpace)].map(() => " "),
    "]"
  ];

  const getUpdatedProgressBar = (totalExecution: number) => {
    console.log(ProgressBar.length, totalExecution)
    return [...Array(ProgressBar.length)].map((_, i) => {
      if (i === 0) {
        return "[";
      }

      if (i === ProgressBar.length - 1) {
        return "]";
      }

      if (i < totalExecution + 1) {
        return "=";
      }

      return " ";
    });
  }

  const getTotalExecution = (updatingPercentage: number) => {
    return Math.floor(TotalSpace * (updatingPercentage / 100));
  }

  type Test = {
    description: string;
    data: {
      totalExecution: () => number;
      updatingPercentage: number;
    };
    result: () => ("[" | "=" | "]" | " ")[];
    isError: boolean;
  }

  const tests: Test[] = [
    {
      description: "Check that Loader.progressBar is updateed at each time function is executed: set 20%",
      data: {
        totalExecution: function (this: Test["data"]) {
          return getTotalExecution(this.updatingPercentage);
        },
        updatingPercentage: 20,
      },
      result: function (this: Test) {
        return getUpdatedProgressBar(this.data.totalExecution());
      },
      isError: false
    },
    {
      description: "Check that Loader.progressBar is updateed at each time function is executed: set 70%",
      data: {
        totalExecution: function (this: Test["data"]) {
          return getTotalExecution(this.updatingPercentage);
        },
        updatingPercentage: 70,
      },
      result: function (this: Test) {
        return getUpdatedProgressBar(this.data.totalExecution())
      },
      isError: false
    },
  ];

  tests.map((testData: Test) => {
    const { description, data, isError } = testData;
    test(description, () => {
      if (isError) {
        return;
      }

      const loader = new Loader();
      loader.totalSpace = TotalSpace;
      loader.progressBar = ProgressBar;
      const advanceProgressBar = loader.updateProgressBar(data.updatingPercentage);
      [...Array(data.totalExecution())].map(() => {
        advanceProgressBar();
      });

      expect(loader.progressBar).toEqual(testData.result());
    });
  });
});
