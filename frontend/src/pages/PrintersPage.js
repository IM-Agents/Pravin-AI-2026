import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Paper, Grid, Button, TextField, MenuItem,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Chip
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import { printersAPI } from '../services/api';
import { toast } from 'react-toastify';

export default function PrintersPage() {
  const [printers, setPrinters] = useState([]);
  const [configs, setConfigs] = useState([]);
  const [selectedPrinter, setSelectedPrinter] = useState({ DM: '', CONFECTIONERY: '', DESIGN: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadPrinters();
    loadConfigs();
  }, []);

  const loadPrinters = async () => {
    try {
      const response = await printersAPI.discover();
      setPrinters(response.data.data);
    } catch (error) {
      console.error('Error loading printers:', error);
      toast.error('Failed to load printers');
    }
  };

  const loadConfigs = async () => {
    try {
      const response = await printersAPI.getConfigs();
      setConfigs(response.data.data);
      
      const configMap = {};
      response.data.data.forEach(config => {
        configMap[config.department] = config.printer_name;
      });
      setSelectedPrinter(prev => ({ ...prev, ...configMap }));
    } catch (error) {
      console.error('Error loading configs:', error);
    }
  };

  const handleSaveConfig = async (department) => {
    if (!selectedPrinter[department]) {
      toast.error('Please select a printer');
      return;
    }

    setLoading(true);
    try {
      const printer = printers.find(p => p.name === selectedPrinter[department]);
      await printersAPI.saveConfig({
        store_client_id: 1,
        department,
        printer_name: printer.name,
        printer_id: printer.name.toLowerCase().replace(/\s+/g, '_'),
        printer_uri: printer.uri || '',
        printer_settings: {}
      });
      toast.success(`Printer configured for ${department}`);
      loadConfigs();
    } catch (error) {
      console.error('Error saving config:', error);
      toast.error('Failed to save configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (department) => {
    try {
      await printersAPI.updateStatus(department);
      toast.success('Printer status updated');
      loadConfigs();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const DepartmentConfig = ({ department }) => {
    const config = configs.find(c => c.department === department);
    
    return (
      <Paper sx={{ p: 3, mb: 2 }}>
        <Typography variant="h6" gutterBottom>{department} Department</Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              select
              fullWidth
              label="Select Printer"
              value={selectedPrinter[department] || ''}
              onChange={(e) => setSelectedPrinter({ ...selectedPrinter, [department]: e.target.value })}
            >
              {printers.map((printer) => (
                <MenuItem key={printer.name} value={printer.name}>
                  {printer.name}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => handleSaveConfig(department)}
              disabled={loading}
            >
              Save Configuration
            </Button>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              variant="outlined"
              fullWidth
              startIcon={<RefreshIcon />}
              onClick={() => handleUpdateStatus(department)}
              disabled={!config}
            >
              Check Status
            </Button>
          </Grid>
        </Grid>
        
        {config && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2">
              <strong>Current Printer:</strong> {config.printer_name}
            </Typography>
            <Typography variant="body2">
              <strong>Status:</strong>{' '}
              <Chip
                label={config.is_online ? 'Online' : 'Offline'}
                color={config.is_online ? 'success' : 'error'}
                size="small"
              />
            </Typography>
            {config.last_status_check && (
              <Typography variant="body2">
                <strong>Last Checked:</strong> {new Date(config.last_status_check).toLocaleString()}
              </Typography>
            )}
          </Box>
        )}
      </Paper>
    );
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Printer Configuration</Typography>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={loadPrinters}
        >
          Discover Printers
        </Button>
      </Box>

      <DepartmentConfig department="DM" />
      <DepartmentConfig department="CONFECTIONERY" />
      <DepartmentConfig department="DESIGN" />

      <Paper sx={{ p: 3, mt: 3 }}>
        <Typography variant="h6" gutterBottom>Available Printers</Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Printer Name</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Type</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {printers.map((printer) => (
                <TableRow key={printer.name}>
                  <TableCell>{printer.name}</TableCell>
                  <TableCell>
                    <Chip
                      label={printer.status || 'Unknown'}
                      color={printer.status === 'IDLE' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{printer.driver || 'N/A'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
