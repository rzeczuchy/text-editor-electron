export const insertTabAtSelection = (element) => {
  const start = element.selectionStart;
  const end = element.selectionEnd;
  element.setRangeText(`  `, start, end, "end");
};
