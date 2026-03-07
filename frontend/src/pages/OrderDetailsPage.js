import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box, Typography, Paper, Grid, Chip, Button, Timeline, TimelineItem,
  TimelineSeparator, TimelineConnector, TimelineContent, TimelineDot, TimelineOppositeContent
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';
import RefreshIcon from '@mui/icons-material/Refresh';
import { ordersAPI } from '../services/api';
import { getStatusColor, getStatusLabel } from '../utils/statusColors';
import { formatDateTime, formatCurrency } from '../utils/formatters';
import { toast } from 'react-toastify';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
    loadTimeline();
  }, [id]);

  const loadOrder = async () => {
    try {
      const response = await ordersAPI.getById(id);
      setOrder(response.data.data);
    } catch (error) {
      console.error('Error loading order:', error);
      toast.error('Failed to load order');
    } finally {
      setLoading(false);
    }
  };

  const loadTimeline = async () => {
    try {
      const response = await ordersAPI.getTimeline(id);
      setTimeline(response.data.data);
    } catch (error) {
      console.error('Error loading timeline:', error);
    }
  };

  const handleDownloadPDF = async () => {
    try {
      const response = await ordersAPI.downloadPDF(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `order_${order.order_name}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('PDF downloaded successfully');
    } catch (error) {
      console.error('Error downloading PDF:', error);
      toast.error('Failed to download PDF');
    }
  };

  const handleRetryPrint = async (department) => {
    try {
      await ordersAPI.retryPrint(id, department);
      toast.success(`Print job queued for ${department}`);
      loadOrder();
      loadTimeline();
    } catch (error) {
      console.error('Error retrying print:', error);
      toast.error('Failed to retry print');
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (!order) return <Typography>Order not found</Typography>;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Order {order.order_name}</Typography>
        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownloadPDF}
          disabled={!order.pdf_path}
        >
          Download PDF
        </Button>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Order Information</Typography>
            <Typography><strong>Order Number:</strong> {order.order_name}</Typography>
            <Typography><strong>Shopify ID:</strong> {order.shopify_order_id}</Typography>
            <Typography><strong>Total:</strong> {formatCurrency(order.total)}</Typography>
            <Typography><strong>Date:</strong> {formatDateTime(order.created_at)}</Typography>
            <Typography><strong>Delivery Date:</strong> {order.delivery_date || 'N/A'}</Typography>
            <Typography><strong>Delivery Time:</strong> {order.delivery_time || 'N/A'}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Customer Information</Typography>
            <Typography><strong>Name:</strong> {order.first_name} {order.last_name}</Typography>
            <Typography><strong>Email:</strong> {order.email || 'N/A'}</Typography>
            <Typography><strong>Phone:</strong> {order.shipping_phone || 'N/A'}</Typography>
            <Typography><strong>Address:</strong> {order.shipping_address || 'N/A'}</Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Department Status</Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography><strong>DM:</strong></Typography>
                  <Chip label={getStatusLabel(order.dm_status)} color={getStatusColor(order.dm_status)} />
                  {order.dm_status === 'FAILURE' && (
                    <Button size="small" startIcon={<RefreshIcon />} onClick={() => handleRetryPrint('DM')}>
                      Retry
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography><strong>Confectionery:</strong></Typography>
                  <Chip label={getStatusLabel(order.confectionery_status)} color={getStatusColor(order.confectionery_status)} />
                  {order.confectionery_status === 'FAILURE' && (
                    <Button size="small" startIcon={<RefreshIcon />} onClick={() => handleRetryPrint('CONFECTIONERY')}>
                      Retry
                    </Button>
                  )}
                </Box>
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Typography><strong>Design:</strong></Typography>
                  <Chip label={getStatusLabel(order.design_status)} color={getStatusColor(order.design_status)} />
                  {order.design_status === 'FAILURE' && (
                    <Button size="small" startIcon={<RefreshIcon />} onClick={() => handleRetryPrint('DESIGN')}>
                      Retry
                    </Button>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {order.products && order.products.length > 0 && (
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>Products</Typography>
              {order.products.map((product, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Typography><strong>{product.product_name}</strong></Typography>
                  <Typography variant="body2">SKU: {product.product_sku} | Qty: {product.qty}</Typography>
                  {product.tag && <Typography variant="body2">Tags: {product.tag}</Typography>}
                </Box>
              ))}
            </Paper>
          </Grid>
        )}

        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Timeline</Typography>
            <Timeline>
              {timeline.map((event, index) => (
                <TimelineItem key={event.id}>
                  <TimelineOppositeContent color="text.secondary">
                    {formatDateTime(event.created_at)}
                  </TimelineOppositeContent>
                  <TimelineSeparator>
                    <TimelineDot color={getStatusColor(event.status)} />
                    {index < timeline.length - 1 && <TimelineConnector />}
                  </TimelineSeparator>
                  <TimelineContent>
                    <Typography variant="h6" component="span">{event.event_type}</Typography>
                    <Typography>{event.tab_details}</Typography>
                    {event.department !== 'ALL' && (
                      <Typography variant="body2" color="text.secondary">
                        Department: {event.department}
                      </Typography>
                    )}
                  </TimelineContent>
                </TimelineItem>
              ))}
            </Timeline>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
