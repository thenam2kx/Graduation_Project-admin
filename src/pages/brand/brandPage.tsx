import { Button,message,Popconfirm,Switch,Table } from 'antd';
import React, { useState } from 'react'
import { Link } from 'react-router';
const Brand = () => {
  const [data,setData] =useState([
    {
      id: 1,
      name: 'Thương hiệu 1',
      isPublic: true,
    },
    {
      id: 2,
      name: 'Thương hiệu 2',
      isPublic: false,
    },
    {
      id: 3,
      name: 'Thương hiệu 3',
      isPublic: true,
    },
  ]);
  const hanldeToggle = (checked:boolean,record:any)=>{
    const newData = data.map((item)=>
      item.id === record.id? {...item,isPublic:checked } :item
    );
    setData(newData)
    console.log(`Toggle ${record.name} to ${checked}`);
    // message.success(`Đổi trạng thái ${record.name} thành công`);
  }

  const columns = [
    {
      title: 'Tên thương hiệu',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isPublic',
      key: 'isPublic',
      render: (isPublic:boolean,record:any) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Switch
            checked={isPublic}
            onChange={(checked) => hanldeToggle(checked, record)}
          />
          <span>{isPublic ? 'Hiển thị' : 'Ẩn'}</span>
        </div>
      )
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
