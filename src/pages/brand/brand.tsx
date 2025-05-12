import { Button,Popconfirm,Table } from 'antd';
import React from 'react'
import { Link } from 'react-router';
function Brand() {
  const data = [
    {
      'id': 1,
      'name': 'Thương hiệu 1',
    },
    {
      'id': 2,
      'name': 'Thương hiệu 2',
    },
    {
      'id': 3,
      'name': 'Thương hiệu 3',
    },
  ]

  const columns = [
  {
    title: 'Tên thương hiệu',
    dataIndex: 'name',
    key: 'name',
  },
  {
    title: 'Thao tác',
    dataIndex: 'id',
    key: 'action',
    render: () => 
      
     <div style={{ display:'flex', gap: '10px', alignItems: 'center' }}>
     <Popconfirm
    title="Delete the task"
    description="Are you sure to delete this task?"
    okText="Yes"
    cancelText="No"
  >
    <Button danger>Xóa</Button>
  </Popconfirm>
  
  <Link to={'/brand/edit/1'}> 
  <Button type='primary'>Sửa</Button>
  </Link>
  
 </div>
  
 
    
  },
];
  return (
    <div>
      <Link to={'/brand/add'}>
      <div style={{marginBottom: '20px'}}>
      <Button className="custom-add-button">Thêm thương hiệu</Button>
      </div>
      </Link>
      <Table dataSource={data} columns={columns} rowKey={(data)=>data.id} />;
    </div>
  )
}

export default Brand
