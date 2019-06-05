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
      const loader = new Loader(100);

      if (isError && result instanceof Error) {
        expect(() => loader.getProgressBar(data)).toThrowError(result);
        return;
      }

      expect(loader.getProgressBar(data)).toEqual(result);
    });
  });
});
