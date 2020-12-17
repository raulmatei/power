import * as React from "react";
import { render } from "react-dom";
import Chart from "./chart";
import { getData } from "./utils";
import "./styles.css";
import LoadingIndicator from './loading-indicator'

function ChartApp() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    const getter = async () => setData(await getData());

    getter();
  }, []);

  if (!data) {
    return <LoadingIndicator/>;
  }

  return <Chart type="svg" data={data} />;
}

render(<ChartApp />, document.getElementById("root"));
