import { Client } from "@elastic/elasticsearch";
import * as fs from "fs";
import { allNames, border } from "../resources/constants/сonstNames.js";

fs.writeFileSync(
  "",//path example: "D:/dev/elasticsearch-client/resources/reports/TimeDistinctionReport.txt"
  "Report" + " " + Date() + "\n",
  { flag: "a+" }
);

const contanierNames = allNames;

async function calcTime() {
  for (let i = 0; i < contanierNames.length; i++) {
    if (contanierNames[i] < 0 || contanierNames[i] === NaN) {
      return contanierNames.splice(i, 1);
    } else {
      async function search() {
        const client = new Client({ node: " " });

        const query = {
          match: {
            container_name: contanierNames[i],
          },
        };

        const res = await client.search({
          index: "fluentd-*",
          body: { query },
          size: 5000,
          sort: "@timestamp:desc",
        });

        // only for positive results in average
        function add(timeArr) {
          let possitive = timeArr.filter(function (val) {
            return val >= 0;
          });
          return possitive.reduce((a, b) => a + b, 0);
        }

        // function add(timeArr) {
        //   return timeArr.reduce((a, b) => a + b, 0);
        // }

        const timeArr = res.body.hits.hits.map((x) => getTimeDist(x));

        let sum = 0;
        sum = sum + add(timeArr);

        const min = Math.min(...timeArr);

        const average = timeArr.reduce(() => sum / timeArr.length);
        fs.writeFileSync(
          "", //D:/dev/elasticsearch-client/resources/reports/TimeDistinctionReport.txt
          "Container: " +
            query.match.container_name +
            "\nTime Distinction Net: " +
            timeArr +
            "\n\n" +
            "\nAverage: " +
            average +
            "\nMinimum: " +
            min +
            "\n",
          { flag: "a+" }
        );

        return Math.max(...timeArr);
      }

      try {
        var result = await search();
        fs.writeFileSync(
          "", //D:/dev/elasticsearch-client/resources/reports/TimeDistinctionReport.txt
          "Maximum: " + String(result) + border + "\n\n",
          { flag: "a+" }
        );

        console.log("File have been written");
      } catch (error) {
        console.log(error);
        fs.writeFileSync(
          "", //D:/dev/elasticsearch-client/resources/reports/TimeDistinctionReport.txt
          `Container: ${contanierNames[i]}\nError: ` +
            "🔥🦆🔥" +
            String(error) +
            border +
            "\n\n",
          { flag: "a+" }
        );
      }
    }
    function getTimeDist(el) {
      const timestampMs = new Date(el._source["@timestamp"]).getTime();
      const timeLog = new Date(JSON.parse(el._source.log).time).getTime();
      return timeLog - timestampMs;
    }
  }
}

await calcTime();

console.log(process.uptime());
