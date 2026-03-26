import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

export function StudentPaymentResult() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const status = searchParams.get('status');

  useEffect(() => {
    if (status === 'success') {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
    }
  }, [status, queryClient]);

  const renderContent = () => {
    if (status === 'success') {
      return {
        icon: <CheckCircle className="h-14 w-14 text-green-600" />,
        title: 'Thanh toán thành công',
        message: 'Học phí của bạn đã được thanh toán thành công.',
      };
    }

    if (status === 'invalid') {
      return {
        icon: <AlertCircle className="h-14 w-14 text-amber-500" />,
        title: 'Giao dịch không hợp lệ',
        message: 'Thông tin xác thực thanh toán không hợp lệ. Vui lòng thử lại.',
      };
    }

    return {
      icon: <XCircle className="h-14 w-14 text-red-600" />,
      title: 'Thanh toán thất bại',
      message: 'Không thể hoàn tất thanh toán. Vui lòng thử lại sau.',
    };
  };

  const content = renderContent();

  return (
    <div className="w-full max-w-3xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>Kết quả thanh toán học phí</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex flex-col items-center gap-3 text-center">
            {content.icon}
            <h2 className="text-2xl font-semibold">{content.title}</h2>
            <p className="text-muted-foreground">{content.message}</p>
          </div>

          <div className="flex justify-center">
            <Button onClick={() => navigate('/payments')}>Quay lại danh sách học phí</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
