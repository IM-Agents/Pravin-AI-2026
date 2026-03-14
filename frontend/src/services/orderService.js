import api from './api';

class OrderService {
  /**
   * Get orders requiring action
   */
  static async getActionRequiredOrders() {
    try {
      const response = await api.get('/api/orders/action-required');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all orders
   */
  static async getAllOrders() {
    try {
      const response = await api.get('/api/orders');
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get order timeline
   */
  static async getOrderTimeline(orderId) {
    try {
      const response = await api.get(`/api/orders/${orderId}/timeline`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Download department PDF
   */
  static async downloadDepartmentPDF(orderId, department) {
    try {
      const response = await api.get(
        `/api/orders/${orderId}/department/${department}/download-pdf`,
        { responseType: 'blob' }
      );
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `order_${orderId}_${department}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle order ignore status
   */
  static async toggleIgnoreOrder(orderId, ignore) {
    try {
      const response = await api.post(`/api/orders/${orderId}/ignore`, { ignore });
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}

export default OrderService;

