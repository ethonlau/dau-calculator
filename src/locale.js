export const INTRO = {
  zh: {
    header: 'DAU (Daily Active Users)，即某一天活跃的总用户数。我们可以使用简单的数学模型来预测用户留存情况，并据此预测未来的 DAU。',
    footer: '实际情况中，投放拉新的用户留存会比自然新增的用户留存低，用户的生命周期可能也没有那么长，用户半年后可能都完全流失了。所以这只是个很粗略的模型。\n\n希望这个小工具，能让更多人了解如何科学地做用户增长。',
    downloadAsCsv: '下载 csv 表格'
  },
  en: {
    header: 'DAU (Daily Active Users), which refers to the total number of active users in a day. We can use a simple mathematical model to predict user retention and, based on this, forecast future DAU."',
    footer: 'In actual scenarios, the retention of users acquired through new promotions is lower than that of naturally added users, and the user lifecycle might not be as long, leading to complete user attrition after six months. Thus, this is a very rough model.\n\nWe hope this tool can help more people understand how to scientifically grow their user base.',
    downloadAsCsv: 'Download table as CSV'
  }
}

export const RETENTION = {
  zh: {
    title: '留存拟合曲线',
    desc: '使用乘幂函数进行拟合，与 excel 中绘制散点图并使用乘幂函数进行拟合，是相同的。',
    newUser1dayRetentionRate: '新用户次留',
    newUser1dayRetentionRateDesc: '新用户次日留存率，当天的新用户，在第 2 天仍然活跃的比例',
    newUser7dayRetentionRate: '新用户七留',
    newUser7dayRetentionRateDesc: '新用户七日留存率，当天的新用户，在第 7 天仍然活跃的比例',
    newUser30dayRetentionRate: '新用户三十留',
    newUser30dayRetentionRateDesc: '新用户三十日留存率，当天的新用户，在第 30 天仍然活跃的比例'
  },
  en: {
    title: 'Retention Curve',
    desc: 'Fitting with a power function, the same as plotting a scatter chart in Excel and fitting it with a power function.',
    newUser1dayRetentionRate: 'New user 1-day retention',
    newUser1dayRetentionRateDesc: 'The 1-day retention rate for new users, indicating the proportion of new users from the current day who are still active on the second day.',
    newUser7dayRetentionRate: 'New user 7-day retention',
    newUser7dayRetentionRateDesc: 'The 7-day retention rate for new users, indicating the proportion of new users from the current day who are still active on the seventh day.',
    newUser30dayRetentionRate: 'New user 30-day retention',
    newUser30dayRetentionRateDesc: 'The 30-day retention rate for new users, indicating the proportion of new users from the current day who are still active on the thirtieth day.'
  }
}

export const DAU = {
  zh: {
    title: 'DAU 趋势',
    desc: '我们可以认为日活是“当天的新增用户和此前每一天新增用户在当天的留存用户之和”，因此我们可以用一个简单的公式表达日活：\n\nDAU(n)=A(n)+A(n-1)R(1)+A(n-2)R(2)+...+A(1)R(n-1)\n\n其中，DAU(n) 为第 n 天的日活，A(n) 为第 n 天的新增，R(n-1) 为新增用户在第 n-1 天后的留存率。\n\n如果我们假设，每日用户的新增是一个固定的数值 A，则公式可简写为：\n\nDAU(n)=A(1+R(1)+R(2)+...+R(n-1))',
    dailyNewUserCount: '每日新用户数',
    retainedUserCount: '已留存用户数',
    retainedDesc: '长期留存的用户，不代表当前的 DAU',
    forecastDayCount: '预测天数',
    finalDAU: '最终 DAU 约为'
  },
  en: {
    title: 'DAU Trend',
    desc: 'We can consider the daily active users as "the sum of new users for the day and the retained users from each previous day", therefore we can express the daily active users using a simple formula:\n\nDAU(n) = A(n) + A(n-1)R(1) + A(n-2)R(2) + ... + A(1)R(n-1)\n\nWhere, DAU(n) is the daily active users on day n, A(n) is the new users on day n, and R(n-1) is the retention rate after n-1 days.\n\nAssuming a constant number of new users each day, the formula can be simplified to:\n\nDAU(n) = A(1 + R(1) + R(2) + ... + R(n-1))',
    dailyNewUserCount: 'Daily new user count',
    retainedUserCount: 'Retained user count',
    retainedDesc: 'Refers to long-term retained users, not representing the current DAU',
    forecastDayCount: 'Forecast Days',
    finalDAU: 'Final DAU is around'
  }
}