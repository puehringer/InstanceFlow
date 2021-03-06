import React from "react";
import FormControl from "@material-ui/core/FormControl/FormControl";
import Select from "@material-ui/core/Select/Select";
import Input from "@material-ui/core/Input/Input";
import MenuItem from "@material-ui/core/MenuItem/MenuItem";
import InputLabel from "@material-ui/core/InputLabel/InputLabel";

const MetricSelector = (props) => {
  const {selectedMetric, onChange, title} = props;

  const metrics = ["none", "score", "classesVisitedNum", "frequency"];
  const metricLabels = ["Default", "Incorrect Ratio", "Number of Visited Classes", "Frequency"];

  return <FormControl margin="dense" fullWidth>
    <InputLabel shrink htmlFor="metric-selector">
      {title}
    </InputLabel>
    <Select
      value={selectedMetric}
      onChange={e => onChange(e.target.value)}
      input={<Input name="age" id="metric-selector"/>}
      name="classView"
    >
      {metrics.map((value, valueIndex) =>
        <MenuItem key={valueIndex} value={value}>{metricLabels[valueIndex]}</MenuItem>
      )}
    </Select>
    {/*<FormHelperText></FormHelperText>*/}
  </FormControl>;
};

export default MetricSelector;