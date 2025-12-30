import {
  ActionType,
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Tag, Typography } from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  LinkOutlined,
  ApiOutlined,
} from '@ant-design/icons';
import { useRef, useState } from 'react';
import {
  getApplicationList,
  createApplication,
  updateApplication,
  deleteApplication,
  getEdgeList,
  createProxy,
} from '@/services/api';
import { executeAction, tableRequest } from '@/utils/request';

const { Text } = Typography;

const AppPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [proxyModalVisible, setProxyModalVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState<API.Application>();

  const handleAdd = async (values: any) => {
    return executeAction(
      () =>
        createApplication({
          name: values.name,
          application_type: values.application_type,
          ip: values.ip,
          port: values.port,
          edge_id: values.edge_id,
          device_id: values.device_id,
        }),
      {
        successMessage: '创建成功',
        errorMessage: '创建失败',
        onSuccess: () => {
          setCreateModalVisible(false);
          actionRef.current?.reload();
        },
      },
    );
  };

  const handleEdit = async (values: any) => {
    if (!currentRow?.id) return false;
    return executeAction(
      () => updateApplication(currentRow.id, { name: values.name }),
      {
        successMessage: '更新成功',
        errorMessage: '更新失败',
        onSuccess: () => {
          setEditModalVisible(false);
          actionRef.current?.reload();
        },
      },
    );
  };

  const handleDelete = async (id: number) => {
    await executeAction(() => deleteApplication(id), {
      successMessage: '删除成功',
      errorMessage: '删除失败',
      onSuccess: () => actionRef.current?.reload(),
    });
  };

  const handleCreateProxy = async (values: any) => {
    if (!currentRow?.id) return false;
    return executeAction(
      () =>
        createProxy({
          name: values.name || currentRow.name,
          description: values.description,
          port: values.port,
          application_id: currentRow.id,
        }),
      {
        successMessage: '代理创建成功',
        errorMessage: '代理创建失败',
        onSuccess: () => {
          setProxyModalVisible(false);
          actionRef.current?.reload();
        },
      },
    );
  };

  const columns: ProColumns<API.Application>[] = [
    {
      title: '应用名称',
      dataIndex: 'name',
      ellipsis: true,
      render: (_, record) => (
        <Space>
          <ApiOutlined />
          <span>{record.name}</span>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'application_type',
      width: 100,
      search: false,
      valueEnum: {
        web: { text: 'Web', status: 'Processing' },
        tcp: { text: 'TCP', status: 'Success' },
        udp: { text: 'UDP', status: 'Warning' },
        ssh: { text: 'SSH', status: 'Default' },
        rdp: { text: 'RDP', status: 'Error' },
        database: { text: '数据库', status: 'Error' },
      },
    },
    {
      title: 'IP 地址',
      dataIndex: 'ip',
      width: 140,
      search: false,
      render: (ip) => <Text code>{ip}</Text>,
    },
    {
      title: '端口',
      dataIndex: 'port',
      width: 80,
      search: false,
      render: (port) => <Tag>{port}</Tag>,
    },
    {
      title: '所属设备',
      dataIndex: ['device', 'name'],
      ellipsis: true,
      search: false,
      render: (_, record) => record.device?.name || '-',
    },
    {
      title: '创建时间',
      dataIndex: 'created_at',
      valueType: 'dateTime',
      width: 180,
      search: false,
    },
    {
      title: '操作',
      valueType: 'option',
      width: 200,
      render: (_, record) => (
        <Space>
          <a
            onClick={() => {
              setCurrentRow(record);
              setProxyModalVisible(true);
            }}
          >
            <LinkOutlined /> 创建代理
          </a>
          <a
            onClick={() => {
              setCurrentRow(record);
              setEditModalVisible(true);
            }}
          >
            编辑
          </a>
          <Popconfirm
            title="确定要删除这个应用吗？"
            onConfirm={() => handleDelete(record.id)}
          >
            <a className="text-red-500">删除</a>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <PageContainer>
      <ProTable<API.Application>
        headerTitle="应用列表"
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const { current, pageSize, name } = params;
          const searchParams: API.ApplicationListParams = {
            page: current,
            page_size: pageSize,
          };
          if (name) {
            searchParams.name = name;
          }
          return tableRequest(
            () => getApplicationList(searchParams),
            'applications',
          );
        }}
        toolBarRender={() => [
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={() => actionRef.current?.reload()}
          >
            刷新
          </Button>,
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            新建应用
          </Button>,
        ]}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
        search={{
          labelWidth: 'auto',
        }}
        scroll={{ x: 'max-content' }}
      />

      {/* 新建应用弹窗 */}
      <ModalForm
        title="新建应用"
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        onFinish={handleAdd}
        modalProps={{ destroyOnClose: true }}
        width={500}
      >
        <ProFormText
          name="name"
          label="应用名称"
          placeholder="请输入应用名称"
          rules={[{ required: true, message: '请输入应用名称' }]}
        />
        <ProFormSelect
          name="application_type"
          label="应用类型"
          placeholder="请选择应用类型"
          options={[
            { label: 'Web', value: 'web' },
            { label: 'TCP', value: 'tcp' },
            { label: 'UDP', value: 'udp' },
            { label: 'SSH', value: 'ssh' },
            { label: 'RDP', value: 'rdp' },
            { label: '数据库', value: 'database' },
          ]}
          rules={[{ required: true, message: '请选择应用类型' }]}
        />
        <ProFormText
          name="ip"
          label="IP 地址"
          placeholder="请输入应用 IP 地址，如 192.168.1.100"
          rules={[{ required: true, message: '请输入 IP 地址' }]}
        />
        <ProFormDigit
          name="port"
          label="端口"
          placeholder="请输入端口号"
          min={1}
          max={65535}
          rules={[{ required: true, message: '请输入端口号' }]}
        />
        <ProFormSelect
          name="edge_id"
          label="连接器"
          placeholder="请选择连接器"
          rules={[{ required: true, message: '请选择连接器' }]}
          request={async () => {
            try {
              const res = await getEdgeList({ page_size: 100 });
              return (
                res.data?.edges?.map((item) => ({
                  label: item.name,
                  value: item.id,
                })) || []
              );
            } catch {
              return [];
            }
          }}
        />
      </ModalForm>

      {/* 编辑应用弹窗 */}
      <ModalForm
        title="编辑应用"
        open={editModalVisible}
        onOpenChange={setEditModalVisible}
        onFinish={handleEdit}
        modalProps={{ destroyOnClose: true }}
        initialValues={currentRow}
        width={500}
      >
        <ProFormText
          name="name"
          label="应用名称"
          placeholder="请输入应用名称"
          rules={[{ required: true, message: '请输入应用名称' }]}
        />
      </ModalForm>

      {/* 创建代理弹窗 */}
      <ModalForm
        title="为应用创建代理"
        open={proxyModalVisible}
        onOpenChange={setProxyModalVisible}
        onFinish={handleCreateProxy}
        modalProps={{ destroyOnClose: true }}
        width={500}
      >
        <ProFormText
          name="name"
          label="代理名称"
          placeholder="请输入代理名称"
          initialValue={currentRow?.name}
          rules={[{ required: true, message: '请输入代理名称' }]}
        />
        <ProFormDigit
          name="port"
          label="公网端口"
          placeholder="留空自动分配"
          min={1}
          max={65535}
          extra="映射到公网的端口号，留空则自动分配"
        />
        <ProFormText
          name="description"
          label="描述"
          placeholder="请输入描述"
        />
      </ModalForm>
    </PageContainer>
  );
};

export default AppPage;
