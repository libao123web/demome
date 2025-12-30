import {
  ActionType,
  ModalForm,
  PageContainer,
  ProColumns,
  ProFormDigit,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
  ProTable,
} from '@ant-design/pro-components';
import { Button, Popconfirm, Space, Tag, Typography } from 'antd';
import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { useRef, useState } from 'react';
import {
  getProxyList,
  createProxy,
  updateProxy,
  deleteProxy,
  getApplicationList,
} from '@/services/api';
import { executeAction, tableRequest } from '@/utils/request';

const { Text } = Typography;

const ProxyPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState<API.Proxy>();

  const handleAdd = async (values: any) => {
    return executeAction(
      () =>
        createProxy({
          name: values.name,
          description: values.description,
          port: values.port,
          application_id: values.application_id,
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
      () =>
        updateProxy(currentRow.id, {
          name: values.name,
          description: values.description,
          port: values.port,
          status: values.status,
        }),
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
    await executeAction(() => deleteProxy(id), {
      successMessage: '删除成功',
      errorMessage: '删除失败',
      onSuccess: () => actionRef.current?.reload(),
    });
  };

  const columns: ProColumns<API.Proxy>[] = [
    {
      title: '代理名称',
      dataIndex: 'name',
      ellipsis: true,
      copyable: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      search: false,
    },
    {
      title: '公网端口',
      dataIndex: 'port',
      width: 100,
      search: false,
      render: (port) => <Tag color="blue">{port}</Tag>,
    },
    {
      title: '关联应用',
      dataIndex: ['application', 'name'],
      ellipsis: true,
      search: false,
      render: (_, record) =>
        record.application ? (
          <Space direction="vertical" size={0}>
            <Text>{record.application.name}</Text>
            <Text type="secondary" className="text-xs">
              {record.application.ip}:{record.application.port}
            </Text>
          </Space>
        ) : (
          '-'
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      search: false,
      valueEnum: {
        running: { text: '运行中', status: 'Success' },
        stopped: { text: '已停止', status: 'Default' },
        error: { text: '异常', status: 'Error' },
      },
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
      width: 150,
      render: (_, record) => (
        <Space>
          <a
            onClick={() => {
              setCurrentRow(record);
              setEditModalVisible(true);
            }}
          >
            编辑
          </a>
          <Popconfirm
            title="确定要删除这个代理吗？"
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
      <ProTable<API.Proxy>
        headerTitle="代理列表"
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const { current, pageSize, name } = params;
          const searchParams: API.ProxyListParams = {
            page: current,
            page_size: pageSize,
          };
          if (name) {
            searchParams.name = name;
          }
          return tableRequest(
            () => getProxyList(searchParams),
            'proxies',
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
            新建代理
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

      {/* 新建代理弹窗 */}
      <ModalForm
        title="新建代理"
        open={createModalVisible}
        onOpenChange={setCreateModalVisible}
        onFinish={handleAdd}
        modalProps={{ destroyOnClose: true }}
        width={500}
      >
        <ProFormText
          name="name"
          label="代理名称"
          placeholder="请输入代理名称"
          rules={[{ required: true, message: '请输入代理名称' }]}
        />
        <ProFormSelect
          name="application_id"
          label="关联应用"
          placeholder="请选择要代理的应用"
          rules={[{ required: true, message: '请选择应用' }]}
          request={async () => {
            try {
              const res = await getApplicationList({ page_size: 100 });
              return (
                res.data?.applications?.map((item) => ({
                  label: `${item.name} (${item.ip}:${item.port})`,
                  value: item.id,
                })) || []
              );
            } catch {
              return [];
            }
          }}
        />
        <ProFormDigit
          name="port"
          label="公网端口"
          placeholder="留空自动分配"
          min={1}
          max={65535}
          extra="映射到公网的端口号，留空则自动分配"
        />
        <ProFormTextArea
          name="description"
          label="描述"
          placeholder="请输入代理描述"
        />
      </ModalForm>

      {/* 编辑代理弹窗 */}
      <ModalForm
        title="编辑代理"
        open={editModalVisible}
        onOpenChange={setEditModalVisible}
        onFinish={handleEdit}
        modalProps={{ destroyOnClose: true }}
        initialValues={currentRow}
        width={500}
      >
        <ProFormText
          name="name"
          label="代理名称"
          placeholder="请输入代理名称"
          rules={[{ required: true, message: '请输入代理名称' }]}
        />
        <ProFormDigit
          name="port"
          label="公网端口"
          placeholder="请输入端口"
          min={1}
          max={65535}
        />
        <ProFormSelect
          name="status"
          label="状态"
          options={[
            { label: '运行中', value: 'running' },
            { label: '已停止', value: 'stopped' },
          ]}
        />
        <ProFormTextArea
          name="description"
          label="描述"
          placeholder="请输入代理描述"
        />
      </ModalForm>
    </PageContainer>
  );
};

export default ProxyPage;
