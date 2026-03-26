// src/lib/paymentService.ts
import api from "../lib/axios";

export interface PaymentResponse {
  id: number;
  userId: string;
  name: string;
  amount: number;
  complete: boolean;
  code: string;
  createdAt: string;
}

export interface ApiResponse<T> {
  statusCode: number | string;
  message: string;
  data?: T;
  result?: T;
  error?: string | null;
}

const getPayload = <T>(response: ApiResponse<T>): T | undefined => {
  return response.data ?? response.result;
};

class PaymentService {
  /**
   * Lấy tất cả học phí của sinh viên hiện tại
   */
  async getAllPayments(): Promise<PaymentResponse[]> {
    try {
      const response = await api.get<ApiResponse<PaymentResponse[]>>('/payment');
      return getPayload(response.data) || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      throw error;
    }
  }

  /**
   * Lấy chi tiết một học phí theo ID
   * @param paymentId - ID của học phí
   */
  async getPaymentById(paymentId: number): Promise<PaymentResponse> {
    try {
      const response = await api.get<ApiResponse<PaymentResponse>>(`/payment/${paymentId}`);
      const payload = getPayload(response.data);
      if (!payload) {
        throw new Error('Payment payload is empty');
      }
      return payload;
    } catch (error) {
      console.error('Error fetching payment:', error);
      throw error;
    }
  }

  /**
   * Tạo đơn thanh toán mới
   * @param data - Dữ liệu tạo thanh toán
   */
  async createPayment(data: {
    name: string;
    amount: number;
    code?: string;
  }): Promise<PaymentResponse> {
    try {
      const response = await api.post<ApiResponse<PaymentResponse>>('/payment', data);
      const payload = getPayload(response.data);
      if (!payload) {
        throw new Error('Create payment payload is empty');
      }
      return payload;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }
}

export default new PaymentService();
