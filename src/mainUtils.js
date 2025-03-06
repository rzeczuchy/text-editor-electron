const isString = (value) => {
  return typeof value === "string";
};

const isValidFilePath = (path) => {
  if (!isString(path)) {
    return false;
  }

  const regex = /^[a-z]:((\\|\/)[a-z0-9\s_@\-^!#$%&+={}\[\]]+)+\.*/i;
  return regex.test(path);
};

module.exports = {
  isValidFilePath: isValidFilePath,
};
