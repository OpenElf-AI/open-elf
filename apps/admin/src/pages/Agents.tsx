import { Table, Tag, Space, Button } from 'antd';

const Agents = () => {
  const columns = [
    {
      title: '智能体ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: '创作者',
      dataIndex: 'creatorName',
      key: 'creatorName',
    },
    {
      title: '价格',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `¥${price}`,
    },
    {
      title: '销量',
      dataIndex: 'soldCount',
      key: 'soldCount',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'listed' ? 'green' : status === 'sold' ? 'orange' : 'blue'}>
          {status === 'listed' ? '上架中' : status === 'sold' ? '已售罄' : '活跃'}
        </Tag>
      ),
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link">查看</Button>
          <Button type="link">下架</Button>
        </Space>
      ),
    },
  ];

  const data = [
    {
      key: '1',
      id: '1',
      name: '豆包',
      category: '通用',
      creatorName: '张三',
      price: 19.9,
      soldCount: 324,
      status: 'listed',
    },
  ];

  return (
    <div>
      <h2 style={{ marginBottom: 24 }}>智能体管理</h2>
      <Table columns={columns} dataSource={data} />
    </div>
  );
};

export default Agents;
