import React, { useEffect, useState } from 'react';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';

const MapChart = () => {
  const [options, setOptions] = useState(null);

  useEffect(() => {
    // Fetch map data from CDN
    fetch('https://echarts-maps.github.io/echarts-countries-js/echarts-countries-js/Canada.js')
      .then(response => response.json())
      .then(data => {
        echarts.registerMap('world', data);

        setOptions({
          tooltip: {
            trigger: 'item',
            formatter: '{b}'
          },
          visualMap: {
            min: 0,
            max: 1000,
            left: 'left',
            top: 'bottom',
            text: ['High', 'Low'],
            calculable: true
          },
          series: [
            {
              name: 'World Map',
              type: 'map',
              map: 'world', // Use the registered map
              roam: true,
              emphasis: {
                label: {
                  show: true
                }
              },
              data: [
                { name: 'China', value: 1000 },
                { name: 'United States', value: 500 },
                { name: 'Brazil', value: 300 }
              ]
            }
          ]
        });
      });
  }, []);

  if (!options) return <div>Loading map...</div>;

  return <ReactECharts option={options} style={{ height: '500px', width: '100%' }} />;
};

export default MapChart;
