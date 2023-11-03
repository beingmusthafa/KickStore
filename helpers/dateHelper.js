function getDMY(date) {
  const dd = date.getUTCDate();
  const mm = date.getUTCMonth() + 1;
  const yy = date.getUTCFullYear();
  const dateString = `${dd}-${mm}-${yy}`;
  return dateString;
}

module.exports = { getDMY };
