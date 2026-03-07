import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Paper, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, Chip, TextField, MenuItem, TablePagination, Button
} from '@mui/material';
import { ordersAPI } from '../services/api';
import { getStatusColor, getStatusLabel } from '../utils/statusColors';
import { formatDateTime, formatCurrency } from '../utils/formatters';

export default function OrdersPage() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(20);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({
    dm_status: '',
    confectionery_status: '',
    design_status: '',
    search: ''
  });

  useEffect(() => {
    loadOrders();
  }, [page, rowsPerPage, filters]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const response = await ordersAPI.getAll({
        page: page + 1,
        limit: rowsPerPage,
        ...filters
      });
      setOrders(response.data.data);
      setTotal(response.data.pagination.total);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" gutterBottom>Orders</Typography>
      
      <Paper sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <TextField
            label="Search"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            size="small"
            sx={{ minWidth: 200 }}
          />
          <TextField
            select
            label="DM Status"
            value={filters.dm_status}
            onChange={(e) => setFilters({ ...filters, dm_status: e.target.value })}
            size="small"
            sx={{ minWidth: 150 }}
          >
            <MenuItem value="">All</MenuItem>
            <MenuItem value="PENDING">Pending</MenuItem>
            <MenuItem value="IN-PROGRESS">In Progress</MenuItem>
            <MenuItem value="SUCCESS">Success</MenuItem>
            <MenuItem value="FAILURE">Failure</MenuItem>
          </TextField>
          <Button variant="contained" onClick={loadOrders}>Apply Filters</Button>
        </Box>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Order #</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Total</TableCell>
              <TableCell>DM</TableCell>
              <TableCell>Confectionery</TableCell>
              <TableCell>Design</TableCell>
              <TableCell>Date</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {orders.map((order) => (
              <TableRow
                key={order.order_id}
                hover
                onClick={() => navigate(`/orders/${order.order_id}`)}
                sx={{ cursor: 'pointer' }}
              >
                <TableCell>{order.order_name}</TableCell>
                <TableCell>{order.first_name} {order.last_name}</TableCell>
                <TableCell>{formatCurrency(order.total)}</TableCell>
                <TableCell>
                  <Chip label={getStatusLabel(order.dm_status)} color={getStatusColor(order.dm_status)} size="small" />
                </TableCell>
                <TableCell>
                  <Chip label={getStatusLabel(order.confectionery_status)} color={getStatusColor(order.confectionery_status)} size="small" />
                </TableCell>
                <TableCell>
                  <Chip label={getStatusLabel(order.design_status)} color={getStatusColor(order.design_status)} size="small" />
                </TableCell>
                <TableCell>{formatDateTime(order.created_at)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={total}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => setRowsPerPage(parseInt(e.target.value, 10))}
        />
      </TableContainer>
    </Box>
  );
}
