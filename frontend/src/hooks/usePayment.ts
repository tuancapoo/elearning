// src/hooks/usePayment.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import paymentService, { PaymentResponse } from "../lib/paymentService";
import { toast } from "sonner";

// ===========================
// QUERY KEYS
// ===========================
export const paymentKeys = {
  all: ["payments"] as const,
  lists: () => [...paymentKeys.all, "list"] as const,
  list: () => [...paymentKeys.lists()] as const,
  details: () => [...paymentKeys.all, "detail"] as const,
  detail: (id: number) => [...paymentKeys.details(), id] as const,
};

// ===========================
// QUERY HOOKS
// ===========================

/**
 * Hook để lấy danh sách tất cả học phí
 */
export const usePayments = (enabled: boolean = true) => {
  return useQuery<PaymentResponse[], Error>({
    queryKey: paymentKeys.list(),
    queryFn: () => paymentService.getAllPayments(),
    enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

/**
 * Hook để lấy chi tiết một học phí
 * @param paymentId - ID của học phí
 * @param enabled - Có tự động fetch không (default: true)
 */
export const usePaymentById = (paymentId: number, enabled: boolean = true) => {
  return useQuery<PaymentResponse, Error>({
    queryKey: paymentKeys.detail(paymentId),
    queryFn: () => paymentService.getPaymentById(paymentId),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
};

// ===========================
// MUTATION HOOKS
// ===========================

/**
 * Hook để tạo đơn thanh toán mới
 */
export const useCreatePayment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { name: string; amount: number; code?: string }) =>
      paymentService.createPayment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.list() });
      toast.success("Tạo đơn thanh toán thành công");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Lỗi khi tạo đơn thanh toán";
      toast.error(message);
    },
  });
};
