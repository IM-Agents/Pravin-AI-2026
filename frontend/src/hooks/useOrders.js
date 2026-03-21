import { useState, useCallback, useEffect } from 'react';
import { ordersApi } from '../services/api';
import useSocket from './useSocket';

export function useOrders(type = 'action-required') {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});
  
  const { subscribe } = useSocket();

  const fetchOrders = useCallback(async (page = 1, currentFilters = filters) => {
    setLoading(true);
    setError(null);
    
    try {
      const params = { page, limit: 20, ...currentFilters };
      const response = type === 'action-required' 
        ? await ordersApi.getActionRequired(params)
        : await ordersApi.getAll(params);
      
      setOrders(response.data.data.orders);
      setPagination(response.data.data.pagination);
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  }, [type, filters]);

  const updateOrderStatus = useCallback((orderId, department, status) => {
    setOrders(prev => prev.map(order => {
      if (order.order_id === orderId) {
        return {
          ...order,
          [`${department}_status`]: status
        };
      }
      return order;
    }));
  }, []);

  const addNewOrder = useCallback((order) => {
    if (pagination.page === 1) {
      setOrders(prev => [order, ...prev.slice(0, 19)]);
    }
  }, [pagination.page]);

  const markOrderCancelled = useCallback((orderId) => {
    setOrders(prev => prev.map(order => {
      if (order.order_id === orderId) {
        return { ...order, is_cancelled: true };
      }
      return order;
    }));
  }, []);

  useEffect(() => {
    const unsubStatus = subscribe('order_status_update', (data) => {
      updateOrderStatus(data.order_id, data.department, data.status);
    });

    const unsubNew = subscribe('new_order', (data) => {
      if (type === 'action-required' || type === 'all') {
        addNewOrder(data.order);
      }
    });

    const unsubCancelled = subscribe('order_cancelled', (data) => {
      markOrderCancelled(data.order_id);
    });

    return () => {
      unsubStatus();
      unsubNew();
      unsubCancelled();
    };
  }, [subscribe, updateOrderStatus, addNewOrder, markOrderCancelled, type]);

  useEffect(() => {
    fetchOrders(1, filters);
  }, [type]);

  const applyFilters = useCallback((newFilters) => {
    setFilters(newFilters);
    fetchOrders(1, newFilters);
  }, [fetchOrders]);

  const resetFilters = useCallback(() => {
    setFilters({});
    fetchOrders(1, {});
  }, [fetchOrders]);

  const goToPage = useCallback((page) => {
    fetchOrders(page, filters);
  }, [fetchOrders, filters]);

  const refresh = useCallback(() => {
    fetchOrders(pagination.page, filters);
  }, [fetchOrders, pagination.page, filters]);

  return {
    orders,
    pagination,
    loading,
    error,
    filters,
    applyFilters,
    resetFilters,
    goToPage,
    refresh,
    updateOrderStatus
  };
}

export default useOrders;
