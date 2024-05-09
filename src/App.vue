<script setup>
import { onMounted, onBeforeUnmount, ref, computed, watchEffect } from 'vue';
import * as echarts from 'echarts';

import {
  INTRO,
  RETENTION,
  DAU,
} from './locale'

window.addEventListener('scroll', function() {
    var scrollPosition = window.pageYOffset;
    var rotationDegree = scrollPosition * 0.05;
    var element = document.getElementById('rotating-star');
    element.style.transform = 'rotate(' + rotationDegree + 'deg)';
});

const lang = ref('zh');
const newUser1dayRetentionRate = ref(40);
const newUser7dayRetentionRate = ref(20);
const newUser30dayRetentionRate = ref(10);
const dailyNewUserCount = ref(10000);
const retainedUserCount = ref(0);
const forecastDayCount = ref(365);
const finalDAU = ref(0);

function linearRegression(x, y) {
    const n = x.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    for (let i = 0; i < n; i++) {
        sumX += x[i];
        sumY += y[i];
        sumXY += x[i] * y[i];
        sumXX += x[i] * x[i];
    }

    const B = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const A = (sumY - B * sumX) / n;

    return { A, B };
}

function powerLawRegression(x, y) {
    const logX = x.map(Math.log);
    const logY = y.map(Math.log);

    const { A, B } = linearRegression(logX, logY);
    const a = Math.exp(A);
    const b = B;

    return { a, b };
}

const regressionResult = computed(() => {
    const retentions = [
        newUser1dayRetentionRate.value / 100,
        newUser7dayRetentionRate.value / 100,
        newUser30dayRetentionRate.value / 100
    ];

    return powerLawRegression([1, 7, 30], retentions);
});


const retentionContainer = ref(null);
let retentionChart = null;

watchEffect(() => {
  if (retentionContainer.value && regressionResult.value) {
    if (!retentionChart) {
      retentionChart = echarts.init(retentionContainer.value);
    }

    const { a, b } = regressionResult.value;
    const data = calculatePowerLawData(a, b, 1, 60, 60);

    function calculatePowerLawData(a, b, xStart, xEnd, numPoints) {
        const xData = [];
        const yData = [];
        const step = (xEnd - xStart) / (numPoints - 1);
        for (let i = 0; i < numPoints; i++) {
            const x = xStart + i * step;
            const y = a * Math.pow(x, b);
            xData.push(x);
            yData.push(y);
        }
        return { xData, yData };
    }

    var option = {
        tooltip: {
            trigger: 'axis',
            formatter: function (params) {
                let result = params[0].axisValue + `Day's ` + params[0].seriesName  + '<br />';
                params.forEach(param => {
                    result += (param.data[1] * 100).toFixed(2) + '%<br />';
                });
                return result;
            }
        },
        xAxis: {
            type: 'value',
            name: 'Days',
            minorTick: { show: true }
        },
        yAxis: {
            type: 'value',
            name: 'Retention Rate',
            minorTick: { show: true },
            axisLabel: {
              formatter: function(value) {
                  return (value * 100).toFixed(0) + '%';
              }
          }
        },
        series: [{
            name: 'Retention Rate',
            type: 'line',
            smooth: true,
            data: data.yData.map((y, i) => [data.xData[i], y]),
            itemStyle: {
              color: '#8ED595',
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                {
                  offset: 0,
                  color: 'rgb(158, 211, 155)'
                },
                {
                  offset: 1,
                  color: 'rgba(158, 211, 155, 0.1)'
                }
              ])
            },
        }],
        grid: {
            left: '15%',
            right: '15%'
        },
    };

    retentionChart.setOption(option);
  }
});

const dauContainer = ref(null);
let dauChart = null;

watchEffect(() => {
  if (dauContainer.value && regressionResult.value) {
    if (!dauChart) {
      dauChart = echarts.init(dauContainer.value);
    }

    const { a, b } = regressionResult.value;

    function retentionRate(day) {
        return a * Math.pow(day, b);
    }

    function calculateFutureDAU(currentDAU, newUsers, days) {
        let dailyDAU = [currentDAU];
        let cumulativeRetention = currentDAU;

        for (let i = 1; i <= days; i++) {
            cumulativeRetention += retentionRate(i) * newUsers;
            dailyDAU.push(cumulativeRetention.toFixed(0));
        }

        return dailyDAU;
    }

    const futureDAU = calculateFutureDAU(retainedUserCount.value, dailyNewUserCount.value, forecastDayCount.value);
    if (forecastDayCount.value <= futureDAU.length - 1) {
      finalDAU.value = futureDAU[forecastDayCount.value]
    }

    const option = {
        tooltip: {
            trigger: 'axis'
        },
        xAxis: {
            type: 'category',
            data: [...Array(futureDAU.length).keys()].map(day => `Day ${day}`)
        },
        yAxis: {
            type: 'value'
        },
        series: [{
            data: futureDAU,
            type: 'bar',
            smooth: true,
            name: 'DAU',
            itemStyle: {
              color: '#8ED595',
            },
        }],
        grid: {
            left: '15%'
        },
    };

    dauChart.setOption(option);
  }
});

</script>

<template>
  <header>
    <div><img alt="logo" class="logo" src="./assets/logo.png" width="300" height="130" /></div>
    <div class="intro">{{ INTRO[lang].header }}</div>
    <div class="lang-switch">
      <div :class="['option', { 'active' : lang === 'zh' }]" @click="lang = 'zh'">中</div>
      <div :class="['option', { 'active' : lang === 'en' }]" @click="lang = 'en'">EN</div>
    </div>
    <img alt="star" id="rotating-star" class="rotating-star top" src="./assets/star.png" width="500" height="500" />
  </header>

  <main>
    <div class="part">
      <div class="title">
        <div class="num">1</div>
        {{ RETENTION[lang].title }}
        <div class="tooltip-container">
          <img alt="info" class="info" src="./assets/info.png" width="20" height="20" />
          <span class="tooltip-text">{{ RETENTION[lang].desc }}</span>
        </div>
      </div>
      <div class="content">
        <div class="form">
          <div class="item">
            <div class="subtitle">
              {{ RETENTION[lang].newUser1dayRetentionRate }}
              <div class="tooltip-container">
                <img alt="info" class="info" src="./assets/info.png" width="12" height="12" />
                <span class="tooltip-text">{{ RETENTION[lang].newUser1dayRetentionRateDesc }}</span>
              </div>
            </div>
            <div class="input-container small">
              <input type="number" min="0" max="100" v-model="newUser1dayRetentionRate" />
              <span class="unit">%</span>
            </div>
            <span class="button" @click="newUser1dayRetentionRate -= 1">-</span>
            <span class="button" @click="newUser1dayRetentionRate += 1">+</span>
          </div>
          <div class="item">
            <div class="subtitle">
              {{ RETENTION[lang].newUser7dayRetentionRate }}
              <div class="tooltip-container">
                <img alt="info" class="info" src="./assets/info.png" width="12" height="12" />
                <span class="tooltip-text">{{ RETENTION[lang].newUser7dayRetentionRateDesc }}</span>
              </div>
            </div>
            <div class="input-container small">
              <input type="number" min="0" max="100" v-model="newUser7dayRetentionRate" />
              <span class="unit">%</span>
            </div>
            <span class="button" @click="newUser7dayRetentionRate -= 1">-</span>
            <span class="button" @click="newUser7dayRetentionRate += 1">+</span>
          </div>
          <div class="item">
            <div class="subtitle">
              {{ RETENTION[lang].newUser30dayRetentionRate }}
              <div class="tooltip-container">
                <img alt="info" class="info" src="./assets/info.png" width="12" height="12" />
                <span class="tooltip-text">{{ RETENTION[lang].newUser30dayRetentionRateDesc }}</span>
              </div>
            </div>
            <div class="input-container small">
              <input type="number" min="0" max="100" v-model="newUser30dayRetentionRate" />
              <span class="unit">%</span>
            </div>
            <span class="button" @click="newUser30dayRetentionRate -= 1">-</span>
            <span class="button" @click="newUser30dayRetentionRate += 1">+</span>
          </div>
        </div>
        <div class="chart">
          𝑦 = {{ regressionResult.a.toFixed(4) }}𝑥<sup>{{ regressionResult.b.toFixed(4) }}</sup>
          <div ref="retentionContainer" style="max-width: 100%; width: 420px; height: 300px;"></div>
        </div>
      </div>
    </div>

    <div class="part">
      <div class="title">
        <div class="num">2</div>
        {{ DAU[lang].title }}
        <div class="tooltip-container">
          <img alt="info" class="info" src="./assets/info.png" width="20" height="20" />
          <span class="tooltip-text">{{ DAU[lang].desc }}</span>
        </div>
      </div>
      <div class="content">
        <div class="form">
          <div class="item">
            <div class="subtitle">
              {{ DAU[lang].dailyNewUserCount }}
            </div>
            <div class="input-container small">
              <input type="number" v-model="dailyNewUserCount" />
            </div>
            <span class="button" @click="dailyNewUserCount -= 500">-</span>
            <span class="button" @click="dailyNewUserCount += 500">+</span>
          </div>
          <div class="item">
            <div class="subtitle">
              {{ DAU[lang].retainedUserCount }}
              <div class="tooltip-container">
                <img alt="info" class="info" src="./assets/info.png" width="12" height="12" />
                <span class="tooltip-text">{{ DAU[lang].retainedDesc }}</span>
              </div>
            </div>
            <div class="input-container">
              <input type="number" min="0" v-model="retainedUserCount" />
            </div>
          </div>
          <div class="item">
            <div class="subtitle">
              {{ DAU[lang].forecastDayCount }}
            </div>
            <div class="input-container">
              <input type="number" min="0" v-model="forecastDayCount" />
            </div>
            <div style="margin: 12px 0 0 115px; font-size: 12px;">
              <span class="button" @click="forecastDayCount = 90">90</span>
              <span class="button" @click="forecastDayCount = 180">180</span>
              <span class="button" @click="forecastDayCount = 365">365</span>
            </div>
          </div>
        </div>
        <div class="chart">
          {{ DAU[lang].finalDAU }}
          <span style="font-weight: bold;">{{finalDAU}}</span>
          <div ref="dauContainer" style="max-width: 100%; width: 420px; height: 300px;"></div>
        </div>
      </div>
    </div>
  </main>

  <footer>
    <div class="intro">{{ INTRO[lang].footer }}</div>
  </footer>
</template>

<style>
body {
  background-color: #EDF6EE;
  text-align: center;
  max-width: 960px;
  margin: 0 auto;
  padding: 50px 20px;
  white-space: pre-wrap;
  font-size: 0;
  user-select: none;

  header {
    .intro {
      color: #89988B;
      font-size: 14px;
      max-width: 540px;
      margin: 20px auto;
      user-select: all;
    }
    .lang-switch {
      font-size: 15px;
      position: fixed;
      right: 20px;
      top: 10px;
      border-radius: 30px;
      background-color: #fff7;
      backdrop-filter: blur(20px);
      padding: 10px;
      z-index: 1;

      .option {
        display: inline-block;
        border-radius: 30px;
        line-height: 35px;
        width: 35px;
        height: 35px;
        cursor: pointer;
        &.active {
          color: #fff;
          background-color: #333;
        }
      }
    }
    .rotating-star {
      transform-origin: center;
      opacity: .4;
      position: absolute;
      z-index: -1;
      &.top {
        top: 100px;
        left: -200px;
      }
    }
  }

  footer {
    .intro {
      color: #89988B;
      font-size: 14px;
      max-width: 540px;
      margin: 20px auto;
      user-select: all;
    }
  }

  .tooltip-container {
    position: relative;
    display: inline-block;
    cursor: pointer;
    &:hover {
      img {
        opacity: 0.8;
      }
    }
  }

  .tooltip-text {
    visibility: hidden;
    width: 360px;
    background-color: white;
    color: #333;
    font-size: 15px;
    border-radius: 20px;
    padding: 20px;
    box-shadow: 0 5px 20px #0001;
    position: absolute;
    z-index: 1;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    opacity: 0;
    transition: opacity 0.5s;
    user-select: all;
  }

  .tooltip-container:hover .tooltip-text {
    visibility: visible;
    opacity: 1;
  }

  .part {
    color: #333;
    margin: 20px 0;
    .title {
      font-size: 25px;
      vertical-align: middle;
      text-align: left;
      padding-left: 30px;
      img {
        vertical-align: middle;
      }
      .num {
        display: inline-block;
        margin: 0px 20px 10px 0;
        vertical-align: middle;
        font-weight: bold;
        font-size: 55px;
        font-style: italic;
      }
    }
    .button {
      background-color: #E7F788;
      border-radius: 10px;
      padding: 6px 13px;
      margin-left: 6px;
      cursor: pointer;
      &:hover {
        background-color: #d9ea74;
      }
      &:active {
        background-color: #cadb68;
      }
    }
    .content {
      padding: 10px 30px;
      display: flex;
      background-color: white;
      border-radius: 30px 0 30px 30px;
      position: relative;
      &:before {
        content: '';
        position: absolute;
        top: -60px;
        right: 0;
        background-color: white;
        border-radius: 0 30px 0 0;
        clip-path: polygon(10% 0, 100% 0, 100% 100%, 0 100%);
        width: calc(100% - 260px);
        height: 60px;
      }
      .form {
        flex: 1;
        font-size: 15px;
        text-align: left;
        padding: 90px 0 70px 20px;
        width: 300px;
        margin: 0 auto;
        .item {
          padding: 6px 0;
          .subtitle {
            display: inline-block;
            width: 120px;
            vertical-align: middle;
            img {
              vertical-align: middle;
            }
          }
          
          .input-container {
            display: inline-block;
            position: relative;
            input {
              background-color: #333;
              color: #fff;
              border-radius: 10px;
              padding: 8px 10px;
              border: none;
              box-shadow: none;
              outline: none;
            }
            &.small input {
              width: 60px;
            }
            .unit {
              position: absolute;
              right: 7px;
              top: 7px;
              color: #fff6;
              font-size: 12px;
              z-index: 10;
            }
          }
        }
      }
      .chart {
        flex: 1;
        font-size: 15px;
        display: inline-block;
        max-width: 100%;
        user-select: all;
      }
    }
  }
}

@media (max-width: 850px) {
  body .part .content {
    display: block;
    .form {
      padding: 50px 0;
    }
  }
}
</style>
