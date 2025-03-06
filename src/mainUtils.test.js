const { isValidFilePath } = require("./mainUtils.js");

describe("valid paths", () => {
  const validPaths = [
    "C:\\Users\\user\\Documents\\file\\somefile.txt",
    "C:\\Apps\\something.txt",
    "C:\\something.txt",
  ];

  test.each(validPaths)("%s is a valid file path", (path) => {
    expect(isValidFilePath(path)).toBe(true);
  });
});

describe("invalid paths", () => {
  const invalidPaths = [
    0,
    { someVariable: "test" },
    "something",
    "&:\\something",
    "C:\\",
    "C:\\?.txt",
    "C:\\*.txt",
  ];

  test.each(invalidPaths)("%s is not a valid file path", (path) => {
    expect(isValidFilePath(path)).toBe(false);
  });
});
