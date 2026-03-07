import React, { useState, useEffect } from 'react';
import { Grid, Paper, Typography, Box, Card, CardContent } from '@mui/material';
import { printersAPI, ordersAPI } from '../services/api';

export default function DashboardPage() {
  const [stats, setStats] = useState({ dm: {}, confectionery: {}, design: {} });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadStats = async () => {
    try {
      const response = await printersAPI.getQueueStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, color }) => (
    <Card>
      <CardContent>
        <Typography color="textSecondary" gutterBottom>{title}</Typography>
        <Typography variant="h4" sx={{ color }}>{value}</Typography>
      </CardContent>
    </Card>
  );

  const DepartmentStats = ({ name, data }) => (
    <Paper sx={{ p: 3, mb: 2 }}>
      <Typography variant="h6" gutterBottom>{name} Department</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Waiting" value={data.waiting || 0} color="warning.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Active" value={data.active || 0} color="info.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Completed" value={data.completed || 0} color="success.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Failed" value={data.failed || 0} color="error.main" />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <StatCard title="Total" value={data.total || 0} color="primary.main" />
        </Grid>
      </Grid>
    </Paper>
  );

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Dashboard</Typography>
      <DepartmentStats name="DM" data={stats.dm} />
      <DepartmentStats name="Confectionery" data={stats.confectionery} />
      <DepartmentStats name="Design" data={stats.design} />
    </Box>
  );
}
