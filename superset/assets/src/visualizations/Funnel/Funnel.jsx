/**
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
import React from 'react';
import PropTypes from 'prop-types';
import { map } from 'lodash';

import './Funnel.css';
import ChartRenderer from '../../chart/ChartRenderer';

const propTypes = {
  xAxisLabel: PropTypes.string,
  yAxisLabel: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
  queryData: PropTypes.array.isRequired,
  funnelSteps: PropTypes.array.isRequired,
  datasource: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};
const defaultProps = {
  xAxisLabel: '',
  yAxisLabel: '',
};

const formData = {
  barstacked: false,
  bottomMargin: 'auto',
  colorScheme: 'd3Category10',
  contribution: false,
  orderBars: false,
  reduceXTicks: false,
  showBarValue: false,
  showControls: false,
  showLegend: true,
  vizType: 'dist_bar',
  xTicksLayout: 'auto',
  yAxisFormat: ',d',
};

class Funnel extends React.Component {
  constructor(props) {
    super(props);
    this.formatQueryResponse = this.formatQueryResponse.bind(this);
  }

   formatQueryResponse(funnelSteps) {
    const selectedValues = funnelSteps && funnelSteps.selectedValues;
    const selValues = map(selectedValues, item => item);
    const values = [];
    let prevValue = 0;
    let upperYBound = 0;
    this.props.queryData.data.forEach((item) => {
      Object.values(item).forEach((value, index) => {
        const label = selValues && selValues[index] && selValues[index].step_label || `Step ${index + 1}`;
        let metric = selValues && selValues[index] && selValues[index].metric;
        if (typeof metric === 'object' && metric !== null) {
          metric = metric.label;
        }

        // set upperYBound while iterating through value
        const upperY = Number(value.valueOf());
        if (upperY > upperYBound) { upperYBound = upperY; }

        // Return Delta between each step Visualization
        const roundedValue = value > 0 ? 100 : 0;
        const delta =  prevValue > 0 ?
            Math.round(100 * value / prevValue, 1) - 100
            : roundedValue;
        const deltaStr = `${delta}%`;
        const valueObj = { key: `${metric}${index > 0 ? ', ' + deltaStr : ''}`, values: [{ y: value, x: label || `Step ${index + 1}` }] };

        values.push(valueObj);
        prevValue = value;
      });
    });
     const queryData = this.props.queryData;
     queryData.data = values;
     return queryData;
   }
  render() {
    const { funnelSteps, xAxisLabel, width, height, datasource, actions } = this.props;

    return (
      <div className="scrollbar-container">
        <div className="scrollbar-content">
          <ChartRenderer
            chartId={'11'}
            chartType="dist_bar"
            vizType="dist_bar"
            formData={{ ...formData, xAxisLabel }}
            queryResponse={this.formatQueryResponse(funnelSteps)}
            datasource={datasource}
            triggerQuery
            chartStatus="rendered"
            triggerRender
            height={height}
            width={width}
            actions={actions}
          />
        </div>
      </div>
    );
  }
}

Funnel.propTypes = propTypes;
Funnel.defaultProps = defaultProps;

export default Funnel;
