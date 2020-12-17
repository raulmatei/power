import React from "react";
import PropTypes from "prop-types";

import { format } from "d3-format";
import { timeFormat } from "d3-time-format";

import { ChartCanvas, Chart } from "react-stockcharts";
import {
  BarSeries,
  AlternatingFillAreaSeries,
  StraightLine
} from "react-stockcharts/lib/series";
import { XAxis, YAxis } from "react-stockcharts/lib/axes";
import {
  CurrentCoordinate,
  CrossHairCursor,
  MouseCoordinateX,
  MouseCoordinateY,
  EdgeIndicator
} from "react-stockcharts/lib/coordinates";

import { discontinuousTimeScaleProvider } from "react-stockcharts/lib/scale";
import { SingleValueTooltip } from "react-stockcharts/lib/tooltip";
import { ema, forceIndex } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";

class CandleStickChartWithForceIndexIndicator extends React.Component {
  render() {
    const { type, data: initialData, width, ratio } = this.props;

    // const [lowestVoltage] = initialData.sort(
    //   (a, b) => b.inputVoltage - a.inputVoltage
    // );
    initialData.forEach(({ inputVoltage }) => console.log(inputVoltage));

    const fi = forceIndex()
      .merge((d, c) => {
        //console.log(d, c);
        d.fi = c;
      })
      .accessor((d) => d.fi);

    const fiEMA13 = ema()
      .id(1)
      .options({ windowSize: 13, sourcePath: "fi" })
      .merge((d, c) => {
        d.fiEMA13 = c;
      })
      .accessor((d) => d.fiEMA13);

    const calculatedData = fiEMA13(fi(initialData));

    const xScaleProvider = discontinuousTimeScaleProvider.inputDateAccessor(
      (d) => d.recordTime24H
    );
    const { data, xScale, xAccessor, displayXAccessor } = xScaleProvider(
      calculatedData
    );

    const start = xAccessor(last(data));
    const end = xAccessor(data[Math.max(0, data.length - 1440)]);
    const xExtents = [start, end];

    const margin = { left: 70, right: 70, top: 20, bottom: 30 };

    const height = window.innerHeight;
    const gridHeight = height - margin.top - margin.bottom;
    const gridWidth = width - margin.left - margin.right;

    const gridProps = {
      tickStrokeOpacity: 0.2,
      tickStrokeDasharray: "Dot",
      tickStrokeWidth: 1
    };

    const yGrid = {
      ...gridProps,
      innerTickSize: -1 * gridWidth
    };
    const xGrid = {
      ...gridProps,
      innerTickSize: -1 * gridHeight
    };

    return (
      <ChartCanvas
        height={gridHeight}
        width={width}
        ratio={ratio}
        margin={margin}
        type={type}
        seriesName="MSFT"
        data={data}
        xScale={xScale}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xExtents={xExtents}
      >
        <Chart id={1} height={height - 300} yExtents={[120, 260]}>
          <BarSeries
            yAccessor={(data) => data.inputVolt}
            fill={(data) => {
              if (data.inputVolt <= data.avrVolt) {
                return "#de425b";
              }

              if (
                data.inputVolt > data.avrVolt &&
                data.inputVolt < data.minimumVolt
              ) {
                return "#f8975e";
              }

              if (
                data.inputVolt >= data.minimumVolt &&
                data.inputVolt <= data.maximumVolt
              ) {
                return "#769c46";
              }
            }}
            opacity={0.8}
          />
          <YAxis axisAt="left" orient="left" {...yGrid} />
          <XAxis axisAt="bottom" orient="bottom" {...xGrid} />
          <MouseCoordinateX
            at="bottom"
            orient="bottom"
            rectWidth={148}
            displayFormat={timeFormat("%Y-%m-%d %H:%M:%S")}
          />
          <MouseCoordinateY
            at="left"
            orient="left"
            displayFormat={format(".4s")}
          />
          <CurrentCoordinate
            yAccessor={(data) => data.inputVolt}
            fill="#9B0A47"
          />

          <EdgeIndicator
            itemType="first"
            orient="left"
            edgeAt="left"
            yAccessor={(data) => data.targetVolt}
            displayFormat={format(".2s")}
            fill="#769c46"
          />

          <EdgeIndicator
            itemType="first"
            orient="right"
            edgeAt="right"
            yAccessor={(data) => data.targetVolt}
            displayFormat={format(".2s")}
            fill="#769c46"
          />

          <EdgeIndicator
            itemType="first"
            orient="left"
            edgeAt="left"
            yAccessor={(data) => data.minimumVolt}
            displayFormat={format(".2s")}
            fill="#f8975e"
          />

          <EdgeIndicator
            itemType="first"
            orient="left"
            edgeAt="left"
            yAccessor={(data) => data.avrVolt}
            displayFormat={format(".2s")}
            fill="#de425b"
          />
        </Chart>

        <Chart
          id={2}
          height={100}
          // yExtents={(data) => data.inputVolt}
          yExtents={[120, 260]}
          origin={(w, h) => [0, h - 170]}
          padding={{ top: 10, right: 0, bottom: 10, left: 0 }}
        >
          <XAxis axisAt="bottom" orient="bottom" />
          <YAxis
            axisAt="left"
            orient="left"
            ticks={4}
            tickFormat={format(".2s")}
          />

          <MouseCoordinateX
            at="bottom"
            orient="bottom"
            rectWidth={148}
            displayFormat={timeFormat("%Y-%m-%d %H:%M:%S")}
          />
          <MouseCoordinateY
            at="left"
            orient="left"
            displayFormat={format(".1s")}
          />

          {/* <AreaSeries baseAt={scale => scale(0)} yAccessor={fiEMA13.accessor()} /> */}
          <AlternatingFillAreaSeries
            baseAt={(scale) => {
              console.log(scale(0));
              return scale(0);
            }}
            yAccessor={fiEMA13.accessor()}
          />
          <StraightLine yValue={0} />

          {/* <SingleValueTooltip
            yAccessor={fiEMA13.accessor()}
            yLabel={`ForceIndex (${fiEMA13.options().windowSize})`}
            yDisplayFormat={format(".4s")}
            origin={[-40, 15]}
          /> */}
        </Chart>
        <CrossHairCursor />
      </ChartCanvas>
    );
  }
}

CandleStickChartWithForceIndexIndicator.propTypes = {
  data: PropTypes.array.isRequired,
  width: PropTypes.number.isRequired,
  ratio: PropTypes.number.isRequired,
  type: PropTypes.oneOf(["svg", "hybrid"]).isRequired
};

CandleStickChartWithForceIndexIndicator.defaultProps = {
  type: "svg"
};
CandleStickChartWithForceIndexIndicator = fitWidth(
  CandleStickChartWithForceIndexIndicator
);

export default CandleStickChartWithForceIndexIndicator;
