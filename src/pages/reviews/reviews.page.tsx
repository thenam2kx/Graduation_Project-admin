import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAllReviews, approveReview, rejectReview, deleteReview } from '@/services/review-service/review.apis';
import { REVIEW_QUERY_KEYS } from '@/services/review-service/review.keys';
import { Review } from '@/services/review-service/review.types';
import { Table, Button, Space, Modal, Input, Tag, Rate, Image, Tooltip, Select, DatePicker } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import dayjs from 'dayjs';
import { theme } from 'antd';
import { useAppSelector } from '@/redux/hooks';

const { confirm } = Modal;
const { TextArea } = Input;
const { RangePicker } = DatePicker;

const ReviewsPage = () => {
  const { token } = theme.useToken();
  const themeMode = useAppSelector(state => state.app.themeMode);
  const isDark = themeMode === 'dark';

  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [currentReviewId, setCurrentReviewId] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  const queryClient = useQueryClient();

  // Xây dựng query params
  const buildQueryParams = () => {
    const params = new URLSearchParams();
    params.append('page', pagination.current.toString());
    params.append('limit', pagination.pageSize.toString());
    
    if (searchText) {
      params.append('search', searchText);
    }
    
    if (statusFilter) {
      params.append('status', statusFilter);
    }
    
    if (dateRange && dateRange[0] && dateRange[1]) {
      params.append('startDate', dateRange[0].startOf('day').toISOString());
      params.append('endDate', dateRange[1].endOf('day').toISOString());
    }
    
    return params.toString();
  };

  // Fetch reviews
  const { data: reviewsData, isLoading } = useQuery({
    queryKey: [REVIEW_QUERY_KEYS.FETCH_ALL, pagination.current, pagination.pageSize, searchText, statusFilter, dateRange],
    queryFn: () => fetchAllReviews(buildQueryParams()),
  });

  // Approve review mutation
  const approveMutation = useMutation({
    mutationFn: approveReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REVIEW_QUERY_KEYS.FETCH_ALL] });
    },
  });

  // Reject review mutation
  const rejectMutation = useMutation({
    mutationFn: ({ reviewId, reason }: { reviewId: string; reason: string }) => 
      rejectReview(reviewId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REVIEW_QUERY_KEYS.FETCH_ALL] });
      setRejectModalVisible(false);
      setRejectReason('');
    },
  });

  // Delete review mutation
  const deleteMutation = useMutation({
    mutationFn: deleteReview,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REVIEW_QUERY_KEYS.FETCH_ALL] });
    },
  });

  // Handle approve review
  const handleApprove = (reviewId: string) => {
    confirm({
      title: 'Bạn có chắc chắn muốn phê duyệt đánh giá này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Đánh giá sẽ được hiển thị công khai sau khi phê duyệt.',
      okText: 'Phê duyệt',
      cancelText: 'Hủy',
      onOk: () => {
        approveMutation.mutate(reviewId);
      },
    });
  };

  // Handle reject review
  const handleReject = (reviewId: string) => {
    setCurrentReviewId(reviewId);
    setRejectModalVisible(true);
  };

  // Handle delete review
  const handleDelete = (reviewId: string) => {
    confirm({
      title: 'Bạn có chắc chắn muốn xóa đánh giá này?',
      icon: <ExclamationCircleOutlined />,
      content: 'Đánh giá sẽ bị xóa vĩnh viễn và không thể khôi phục.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        deleteMutation.mutate(reviewId);
      },
    });
  };

  // Submit reject reason
  const submitRejectReason = () => {
    if (currentReviewId && rejectReason.trim()) {
      rejectMutation.mutate({ reviewId: currentReviewId, reason: rejectReason });
    }
  };

  // Table columns
  const columns: ColumnsType<Review> = [
    {
      title: 'Sản phẩm',
      dataIndex: 'productId',
      key: 'product',
      render: (productId: any) => {
        const product = typeof productId === 'object' ? productId : { name: 'Không xác định' };
        return (
          <div className="flex items-center">
            {product.images && product.images.length > 0 && (
              <Image 
                src={product.images[0]} 
                alt={product.name} 
                width={40} 
                height={40} 
                className="object-cover rounded mr-2"
                preview={false}
              />
            )}
            <span>{product.name}</span>
          </div>
        );
      },
    },
    {
      title: 'Người dùng',
      dataIndex: 'userId',
      key: 'user',
      render: (userId: any) => {
        const user = typeof userId === 'object' ? userId : { fullName: 'Không xác định', email: '' };
        return (
          <div>
            <div>{user.fullName || 'Không xác định'}</div>
            <div className="text-xs text-gray-500">{user.email}</div>
          </div>
        );
      },
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      dataIndex: 'rating',
      render: (rating: number) => <Rate disabled defaultValue={rating} />,
    },
    {
      title: 'Nội dung',
      dataIndex: 'comment',
      key: 'comment',
      render: (comment: string) => (
        <Tooltip title={comment}>
          <div className="max-w-xs truncate">{comment}</div>
        </Tooltip>
      ),
    },
    {
      title: 'Hình ảnh',
      dataIndex: 'images',
      key: 'images',
      render: (images: string[]) => (
        <div className="flex space-x-1">
          {images && images.length > 0 ? (
            images.slice(0, 3).map((image, index) => (
              <Image 
                key={index} 
                src={image} 
                alt={`review-image-${index}`} 
                width={30} 
                height={30} 
                className="object-cover rounded"
              />
            ))
          ) : (
            <span>Không có</span>
          )}
          {images && images.length > 3 && (
            <div className="bg-gray-200 w-8 h-8 rounded flex items-center justify-center text-xs">
              +{images.length - 3}
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        let color = 'default';
        let text = 'Không xác định';
        
        switch (status) {
          case 'pending':
            color = 'gold';
            text = 'Chờ duyệt';
            break;
          case 'approved':
            color = 'green';
            text = 'Đã duyệt';
            break;
          case 'rejected':
            color = 'red';
            text = 'Từ chối';
            break;
        }
        
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY HH:mm'),
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' && (
            <>
              <Button 
                type="primary" 
                size="small" 
                onClick={() => handleApprove(record._id)}
              >
                Duyệt
              </Button>
              <Button 
                danger 
                size="small" 
                onClick={() => handleReject(record._id)}
              >
                Từ chối
              </Button>
            </>
          )}
          <Button 
            type="default" 
            danger 
            size="small" 
            onClick={() => handleDelete(record._id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  // Handle table change
  const handleTableChange = (pagination: any) => {
    setPagination({
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  return (
    <div className={`min-h-screen p-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="mb-8">
        <h1 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Quản lý đánh giá sản phẩm
        </h1>
        <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Quản lý và kiểm duyệt đánh giá từ khách hàng
        </p>
      </div>

      {/* Filters */}
      <div className={`mb-6 p-4 rounded-lg ${isDark ? 'bg-gray-800' : 'bg-white'} shadow-sm`}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input.Search
            placeholder="Tìm kiếm theo tên sản phẩm hoặc người dùng"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onSearch={() => setPagination({ ...pagination, current: 1 })}
            className={isDark ? 'bg-gray-700 border-gray-600' : ''}
          />
          
          <Select
            placeholder="Lọc theo trạng thái"
            allowClear
            style={{ width: '100%' }}
            onChange={(value) => {
              setStatusFilter(value);
              setPagination({ ...pagination, current: 1 });
            }}
            options={[
              { value: 'pending', label: 'Chờ duyệt' },
              { value: 'approved', label: 'Đã duyệt' },
              { value: 'rejected', label: 'Từ chối' },
            ]}
            className={isDark ? 'bg-gray-700 border-gray-600' : ''}
          />
          
          <RangePicker
            onChange={(dates) => {
              setDateRange(dates as [dayjs.Dayjs | null, dayjs.Dayjs | null]);
              setPagination({ ...pagination, current: 1 });
            }}
            format="DD/MM/YYYY"
            placeholder={['Từ ngày', 'Đến ngày']}
            className={`w-full ${isDark ? 'bg-gray-700 border-gray-600' : ''}`}
          />
        </div>
      </div>

      {/* Reviews Table */}
      <div className={`rounded-lg shadow-sm ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
        <Table
          columns={columns}
          dataSource={reviewsData?.results || []}
          rowKey="_id"
          loading={isLoading}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: reviewsData?.meta?.total || 0,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
          }}
          onChange={handleTableChange}
          scroll={{ x: 'max-content' }}
        />
      </div>

      {/* Reject Modal */}
      <Modal
        title="Lý do từ chối đánh giá"
        open={rejectModalVisible}
        onOk={submitRejectReason}
        onCancel={() => setRejectModalVisible(false)}
        okText="Xác nhận"
        cancelText="Hủy"
        okButtonProps={{ disabled: !rejectReason.trim() }}
      >
        <p>Vui lòng nhập lý do từ chối đánh giá này:</p>
        <TextArea
          rows={4}
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
          placeholder="Nhập lý do từ chối..."
        />
      </Modal>
    </div>
  );
};

export default ReviewsPage;