// src/components/student/StudentPayments.tsx
import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Search, Calendar, DollarSign, FileText, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { User } from '../../context/AuthContext';
import { usePayments } from '../../hooks/usePayment';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface StudentPaymentsProps {
  user: User;
}

export function StudentPayments({ user }: StudentPaymentsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { data: payments, isLoading, error } = usePayments();

  // Filter dữ liệu theo search query
  const filteredPayments = useMemo(() => {
    if (!payments) return [];
    
    return payments.filter(payment =>
      payment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.code?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toString().includes(searchQuery)
    );
  }, [payments, searchQuery]);

  // Tính toán thống kê
  const stats = useMemo(() => {
    if (!payments) return { total: 0, paid: 0, unpaid: 0, totalAmount: 0 };

    const paid = payments.filter(p => p.complete).length;
    const unpaid = payments.filter(p => !p.complete).length;
    const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);

    return {
      total: payments.length,
      paid,
      unpaid,
      totalAmount,
    };
  }, [payments]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(num);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  if (error) {
    return (
      <div className="w-full max-w-7xl mx-auto p-6">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6 flex items-center gap-4">
            <AlertCircle className="text-red-600" size={24} />
            <div>
              <p className="font-semibold text-red-900">Lỗi khi tải dữ liệu</p>
              <p className="text-sm text-red-800">{error.message}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Học phí</h1>
        <p className="text-muted-foreground mt-2">Xem và quản lý các khoản học phí của bạn</p>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Học phí</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(stats.totalAmount)}</div>
            <p className="text-xs text-muted-foreground">Tất cả các khoản</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng Số Khoản</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Học phí cần quản lý</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đã Thanh toán</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.paid}</div>
            <p className="text-xs text-muted-foreground">Đã hoàn tất</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Chưa Thanh toán</CardTitle>
            <AlertCircle className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.unpaid}</div>
            <p className="text-xs text-muted-foreground">Cần xử lý</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Search className="h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo tên, mã học phí..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardHeader>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách Học phí</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="flex items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="text-muted-foreground">Đang tải dữ liệu...</span>
              </div>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-2 opacity-50" />
              <p className="text-muted-foreground">Không có học phí nào</p>
            </div>
          ) : (
            <div className="rounded-lg border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>STT</TableHead>
                    <TableHead>Tên Học phí</TableHead>
                    <TableHead>Mã</TableHead>
                    <TableHead className="text-right">Số Tiền</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>Ngày Tạo</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPayments.map((payment, index) => (
                    <TableRow key={payment.id} className="hover:bg-muted/50 transition-colors">
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell className="font-medium">{payment.name}</TableCell>
                      <TableCell>
                        <span className="text-muted-foreground text-sm">{payment.code}</span>
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {formatNumber(payment.amount)}
                      </TableCell>
                      <TableCell>
                        {payment.complete ? (
                          <Badge variant="default" className="bg-green-600">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Đã Thanh toán
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Chưa Thanh toán
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(payment.createdAt)}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
