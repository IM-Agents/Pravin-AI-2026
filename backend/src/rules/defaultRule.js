module.exports = async (order) => {
  return {
    matched: true,
    statuses: {
      dm: 'IN-PROGRESS',
      confectionery: 'IN-PROGRESS',
      design: 'IN-PROGRESS'
    },
    reason: 'Order qualifies for standard processing in all departments'
  };
};