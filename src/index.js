import * as React from "react";
import { render } from "react-dom";
import Chart from "./Chart";
import { getData } from "./utils";
import "./styles.css";

function ChartApp() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    const getter = async () => setData(await getData());

    getter();
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  return <Chart type="svg" data={data} />;
}

render(<ChartApp />, document.getElementById("root"));
