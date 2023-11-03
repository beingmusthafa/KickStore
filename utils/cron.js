const cron = require("node-cron");
const reportGenerator = require("../utils/reportGenerator");
const dateHelper = require("../helpers/dateHelper");

const scheduleTasks = () => {
  // weekly sales
  cron.schedule(
    "0 0 0 * * Monday",
    () => {
      const currentDate = new Date();
      const startingDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - 7
      );
      const date = dateHelper.getDMY(currentDate);
      reportGenerator.generateSales(currentDate, startingDate, date, "Weekly");
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );

  //yearly sales
  cron.schedule(
    "0 0 0 1 * *",
    () => {
      const currentDate = new Date();
      const startingDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        currentDate.getDate()
      );
      const date = `${currentDate.toLocaleString("default", {
        month: "long",
      })}-${currentDate.getFullYear()}`;
      reportGenerator.generateSales(currentDate, startingDate, date, "Monthly");
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );

  //yearly sales
  cron.schedule(
    "0 0 0 1 January *",
    () => {
      const currentDate = new Date();
      const startingDate = new Date(
        currentDate.getFullYear() - 1,
        currentDate.getMonth(),
        currentDate.getDate()
      );
      const date = `${currentDate.getFullYear()}`;
      reportGenerator.generateSales(currentDate, startingDate, date, "Yearly");
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );

  //weekly stocks
  cron.schedule(
    "0 0 0 * * Monday",
    () => {
      const currentDate = new Date();
      const startingDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        currentDate.getDate() - 7
      );
      const date = dateHelper.getDMY(currentDate);
      reportGenerator.generateStocks(currentDate, startingDate, date, "Weekly");
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );

  //monthly stocks
  cron.schedule(
    "0 0 0 1 * *",
    () => {
      const currentDate = new Date();
      const startingDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth() - 1,
        currentDate.getDate()
      );
      const date = `${currentDate.toLocaleString("default", {
        month: "long",
      })}-${currentDate.getFullYear()}`;
      reportGenerator.generateStocks(
        currentDate,
        startingDate,
        date,
        "Monthly"
      );
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );

  //yearly stocks
  cron.schedule(
    "0 0 0 1 January *",
    () => {
      const currentDate = new Date();
      const startingDate = new Date(
        currentDate.getFullYear() - 1,
        currentDate.getMonth(),
        currentDate.getDate()
      );
      const date = `${currentDate.getFullYear()}`;
      reportGenerator.generateStocks(currentDate, startingDate, date, "Yearly");
    },
    {
      scheduled: true,
      timezone: "Asia/Kolkata",
    }
  );
};

module.exports = { scheduleTasks };
