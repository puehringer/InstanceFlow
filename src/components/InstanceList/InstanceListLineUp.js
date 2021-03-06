import React, {Component} from "react";
import {withData} from "../DataProvider";
import {
  LineUpCategoricalColumnDesc,
  LineUpNumberColumnDesc,
  LineUpStringColumnDesc, Taggle,
} from "lineupjsx";
import CategoricalArrayHeatmapRenderer from "./CategoricalArrayHeatmapRenderer";
import {ScaleMappingFunction} from "lineupjs";
import {arraysEqual} from "../utils";
import CategoricalArrayHistogramRenderer from "./CategoricalArrayHistogramRenderer";

class InstanceListLineUp extends Component {
  shouldComponentUpdate(nextProps, nextState, nextContext) {
    return false;
  }

  componentDidMount() {
    this.initializeTaggleEvents();
  }

  updateData(data, from, to, classes) {
    const distribution2Column = this.taggle.adapter.data.find((d) => d.desc.column === "distribution2");
    const distributionColumn = this.taggle.adapter.data.find((d) => d.desc.column === "distribution");
    const labelColumn = this.taggle.adapter.data.find((d) => d.desc.type === 'categorical' && d.desc.column === "label");

    const count = to - from + 1;
    const splicer = {
      length: count,
      splice: v => v.slice(from, to + 1)
    };
    if (distribution2Column) distribution2Column.setSplicer(splicer);
    if (distributionColumn) distributionColumn.setSplicer(splicer);

    const scoreColumn = this.taggle.adapter.data.find((d) => d.desc.type === 'number' && d.desc.column === "scoreRaw");
    if (scoreColumn) {
      scoreColumn.setMapping(new ScaleMappingFunction([0, count], 'linear'));
    }

    const frequencyColumn = this.taggle.adapter.data.find((d) => d.desc.type === 'number' && d.desc.column === "frequencyRaw");
    if (frequencyColumn) {
      frequencyColumn.setMapping(new ScaleMappingFunction([0, count - 1], 'linear'));
    }

    const {labels, activateInstances, setVisibleInstances, setClasses} = this.props.data;
    // This callback serves as indicator that a filter has changed (TODO: Better callback possible?)
    // Override it on every data change because otherwise the callbacks store "old" values
    this.taggle.adapter.data.on("orderChanged", () => {
      if (labelColumn) {
        const filteredLabels = labelColumn.getFilter().filter;
        const filteredLabelIndices = filteredLabels.map(label => labels.indexOf(label)).filter(index => index >= 0).sort();
        if (!arraysEqual(classes, filteredLabelIndices)) {
          setClasses(filteredLabelIndices);
        }
      }

      // Update visibility of instances
      const data = this.taggle.adapter.data;
      const ranking = data.getRankings()[0];
      const visibleInstances = data.view(ranking.getOrder());
      setVisibleInstances(new Set());
      activateInstances({visible: true}, ...visibleInstances);
    });
    this.taggle.adapter.data.setData(data);
  }

  initializeTaggleEvents = () => {
    if (this.taggle) {
      const {classes, setColors, getLabel} = this.props.data;

      const labelColumn = this.taggle.adapter.data.find((d) => d.desc.type === 'categorical' && d.desc.column === "label");
      if (labelColumn) {
        setColors([...Array.from(labelColumn.lookup, ([key, value]) => value.color), "lightgray"]);
        labelColumn.setFilter({
          filterMissing: true,
          filter: classes.map(c => getLabel(c))
        });
      }
      const scoreColumn = this.taggle.adapter.data.find((d) => d.desc.type === 'number' && d.desc.column === "scoreRaw");
      if (scoreColumn) {
        scoreColumn.setFilter({
          filterMissing: false,
          max: Infinity,
          min: 1
        });
      }
    }
  };

  render() {
    const {allEpochs, innerRef} = this.props;
    const {labels, deactivateAllInstances, activateInstances} = this.props.data;
    return <Taggle data={[]} renderers={{
      catarrheatmap: new CategoricalArrayHeatmapRenderer(),
      catarrhistogram: new CategoricalArrayHistogramRenderer()
    }}
                   ref={e => {
                     this.taggle = e;
                     innerRef(this.taggle);
                   }}
                   style={{height: '100vh'}}
                   onSelectionChanged={indices => {
                     const instances = indices.map(index => this.taggle.adapter.data.data[index]);
                     deactivateAllInstances();
                     activateInstances({active: true, clicked: true, lines: true}, ...instances);
                   }}>
      <LineUpStringColumnDesc column="id" label="ID" width={100}/>
      <LineUpStringColumnDesc column="image" renderer="image" groupRenderer="image" summaryRenderer="image"
                              pattern="${escapedValue}" width={50}/>
      <LineUpCategoricalColumnDesc column="label" categories={labels}/>
      <LineUpCategoricalColumnDesc column="distribution" label="Trinary Distribution"
                                   renderer="catarrhistogram"
                                   groupRenderer="catarrhistogram"
                                   summaryRenderer="catarrhistogram"
                                   asArray={allEpochs.length}
                                   categories={[{
                                     name: "Correct",
                                     color: "lightgray"
                                   }, {
                                     name: "Other",
                                     color: "gray"
                                   }, {
                                     name: "Incorrect",
                                     color: "black"
                                   }
                                   ]}
                                   width={200}/>
      <LineUpCategoricalColumnDesc column="distribution2" label="Prediction Distribution"
                                   renderer="catarrheatmap"
                                   groupRenderer="catarrhistogram"
                                   summaryRenderer="catarrhistogram"
                                   asArray={allEpochs.length}
                                   categories={labels}
                                   width={200}/>
      <LineUpCategoricalColumnDesc column="visitedLabels"
                                   label="Visited Classes"
                                   renderer="catheatmap"
                                   groupRenderer="catheatmap"
                                   asSet={true}
                                   categories={labels}/>
      <LineUpNumberColumnDesc column="variability"
                              label="Variability"
                              description="Number of visited classes"
                              domain={[0, labels.length]}/>
      <LineUpNumberColumnDesc column="frequencyRaw"
                              label="Frequency"
                              description="Number of changing predictions"
                              domain={[0, 1]}/>
      <LineUpNumberColumnDesc column="scoreRaw"
                              label="Score"
                              description="Incorrect classifications"
                              domain={[0, 1]}/>
    </Taggle>;
  }
}

export default withData(InstanceListLineUp);