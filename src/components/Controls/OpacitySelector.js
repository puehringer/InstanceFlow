import React from "react";
import MetricSelector from "./MetricSelector";
import {withFlowData} from "../InstanceFlow/FlowDataProvider";

const OpacityMetric = (props) => {
  const {opacityMetric, setOpacityMetric} = props.flowData;
  return <MetricSelector selectedMetric={opacityMetric} title="Instance Opacity" onChange={metric => {
    setOpacityMetric(metric);
  }}/>;
};

export default withFlowData(OpacityMetric);