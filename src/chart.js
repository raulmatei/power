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
import { HoverTooltip } from "react-stockcharts/lib/tooltip";
import { ema, forceIndex } from "react-stockcharts/lib/indicator";
import { fitWidth } from "react-stockcharts/lib/helper";
import { last } from "react-stockcharts/lib/utils";

function tooltipContent ({currentItem}) {
  return {
    x: `Valoare măsurată: ${currentItem.inputVolt}V`,
    y: []
  };
}

class CandleStickChartWithForceIndexIndicator extends React.Component {
  render() {
    const { type, data: initialData, width, ratio } = this.props;

    const [lowestVoltage] = [...initialData].map(({inputVolt}) => inputVolt)
      .sort((a, b) => a - b).filter((inputVolt) => inputVolt > 0);

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

    // TODO: implement selector for: 5m, 15m, 30m, 1h, 3h, 9h, 18h, 24h
    // initialy show 3 hours for now
    const end = xAccessor(data[Math.max(0, data.length - (60 * 3))]);
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
        seriesName="Voltage"
        data={data}
        xScale={xScale}
        xAccessor={xAccessor}
        displayXAccessor={displayXAccessor}
        xExtents={xExtents}
      >
        <Chart id={1} height={height - 100} yExtents={[120, 260]}>
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
            displayFormat={format(".3s")}
            fill="#769c46"
            lineStroke="#769c46"
            fontSize={12}
          />

          <EdgeIndicator
            itemType="first"
            orient="right"
            edgeAt="right"
            yAccessor={(data) => data.targetVolt}
            displayFormat={format(".3s")}
            fill="#769c46"
            lineStroke="#769c46"
          />

          <EdgeIndicator
            itemType="first"
            orient="left"
            edgeAt="left"
            yAccessor={() => lowestVoltage}
            displayFormat={format(".3s")}
            fill="gray"
            lineStroke="gray"
          />

          <EdgeIndicator
            itemType="first"
            orient="right"
            edgeAt="right"
            yAccessor={() => lowestVoltage}
            displayFormat={format(".3s")}
            fill="grey"
            lineStroke="grey"
          />

          <EdgeIndicator
            itemType="first"
            orient="right"
            edgeAt="right"
            yAccessor={(data) => data.minimumVolt}
            displayFormat={format(".2s")}
            fill="#f8975e"
            lineStroke="#f8975e"
          />

          <EdgeIndicator
            itemType="first"
            orient="left"
            edgeAt="left"
            yAccessor={(data) => data.minimumVolt}
            displayFormat={format(".2s")}
            fill="#f8975e"
            lineStroke="#f8975e"
          />

          <EdgeIndicator
            itemType="first"
            orient="left"
            edgeAt="left"
            yAccessor={(data) => data.avrVolt}
            displayFormat={format(".2s")}
            fill="#de425b"
            lineStroke="#de425b"
          />

          <EdgeIndicator
            itemType="first"
            orient="right"
            edgeAt="right"
            yAccessor={(data) => data.avrVolt}
            displayFormat={format(".2s")}
            fill="#de425b"
            lineStroke="#de425b"
          />

          <HoverTooltip
            yAccessor={(data) => data.inputVolt}
            tooltipContent={tooltipContent}
            fontSize={15}
          />
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
