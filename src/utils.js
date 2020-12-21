import { json } from "d3";
import { timeParse } from "d3-time-format";

// {
// 	"recordTime": "2020-12-08 10:44:17  AM",
// 	"recordTime24H": "2020-12-08 10:44:17",
// 	"inputVolt": "200.0",
// 	"bypassVolt": "N/A",
// 	"outputVolt": "239.0",
// 	"inputFreq": "N/A",
// 	"bypassFreq": "N/A",
// 	"outputFreq": "N/A",
// 	"load": "21",
// 	"capacity": "100",
// 	"batteryVolt": "26800",
// 	"batteryCurrent": "N/A",
// 	"runtime": "0 hr. 31 min."
// },

function parseData(data) {
  const parseDate = timeParse("%Y-%m-%d %H:%M:%S");

  return data
    .map((item) => {
      const inputVolt = Number(item.inputVolt);

      item.recordTime24H = parseDate(item.recordTime24H);
      item.inputVolt = inputVolt;
      item.targetVolt = 230;
      item.minimumVolt = 210;
      item.maximumVolt = 250;
      item.avrVolt = 200;

      // TODO: remove
      item.close = inputVolt;
      item.volume = inputVolt;

      return item;
    })
    .sort(function (a, b) {
      return a.recordTime24H.getTime() - b.recordTime24H.getTime();
    });
}

export const getData = async () => {
  try {
    const data = await json("/data/data.json");

    if (data) {
      return parseData(data);
    }

    return [];
  } catch (ex) {
    console.error(ex);
    return [];
  }
};
