import {
  ActionType,
  PageContainer,
  ProColumns,
  ProTable,
  StepsForm,
  ProFormText,
  ProFormTextArea,
  ModalForm,
} from '@ant-design/pro-components';
import {
  Badge,
  Button,
  Drawer,
  List,
  message,
  Modal,
  Popconfirm,
  Space,
  Tag,
  Typography,
  Spin,
  Result,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  CopyOutlined,
  CheckCircleOutlined,
  LoadingOutlined,
  CloseCircleOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useRef, useState } from 'react';
import {
  getEdgeList,
  createEdge,
  updateEdge,
  deleteEdge,
  getEdgeScanTask,
  createEdgeScanTask,
  createApplication,
  checkEdgeOnline,
} from '@/services/api';
import { executeAction, tableRequest } from '@/utils/request';

const { Text, Paragraph } = Typography;

const ConnectorPage: React.FC = () => {
  const actionRef = useRef<ActionType>();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [discoverDrawerVisible, setDiscoverDrawerVisible] = useState(false);
  const [currentRow, setCurrentRow] = useState<API.Edge>();
  const [accessKeys, setAccessKeys] = useState<API.EdgeCreateResult>();
  const [scanTask, setScanTask] = useState<API.EdgeScanApplicationTask>();
  const [scanning, setScanning] = useState(false);

  // 打开创建弹窗
  const handleOpenCreateModal = () => {
    setCreateModalVisible(true);
    setAccessKeys(undefined);
  };

  const handleDelete = async (id: number) => {
    await executeAction(() => deleteEdge(id), {
      successMessage: '删除成功',
      errorMessage: '删除失败',
      onSuccess: () => actionRef.current?.reload(),
    });
  };

  const handleEdit = async (values: any) => {
    if (!currentRow?.id) return false;
    return executeAction(
      () =>
        updateEdge(currentRow.id, {
          name: values.name,
          description: values.description,
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

  const handleDiscoverApps = async (edge: API.Edge) => {
    // 检查连接器是否在线
    if (edge.online !== 1) {
      message.warning('连接器不在线，无法发现应用');
      return;
    }

    setCurrentRow(edge);
    setDiscoverDrawerVisible(true);
    setScanning(true);
    setScanTask(undefined);

    try {
      // 先创建扫描任务
      const createRes = await createEdgeScanTask({ 
        edge_id: edge.id,
        protocol: 'tcp',
      });
      if (createRes.code !== 200) {
        message.error(createRes.message || '创建扫描任务失败');
        setScanning(false);
        return;
      }
      // 等待一小段时间让扫描任务启动
      await new Promise(resolve => setTimeout(resolve, 1000));
      // 然后获取扫描结果
      const res = await getEdgeScanTask(edge.id);
      if (res.code === 200 && res.data) {
        setScanTask(res.data);
      }
    } catch (error: any) {
      message.error(error?.message || '扫描失败');
    } finally {
      setScanning(false);
    }
  };

  const handleRefreshScan = async () => {
    if (!currentRow?.id) return;
    setScanning(true);
    try {
      const res = await getEdgeScanTask(currentRow.id);
      if (res.code === 200 && res.data) {
        setScanTask(res.data);
      }
    } catch (error) {
      message.error('获取扫描结果失败');
    } finally {
      setScanning(false);
    }
  };

  const handleAddDiscoveredApp = async (appStr: string) => {
    if (!currentRow?.id) return;
    // 解析应用字符串，格式假设为 "ip:port"
    const [ip, portStr] = appStr.split(':');
    const port = parseInt(portStr, 10);

    await executeAction(
      () =>
        createApplication({
          name: `App-${ip}:${port}`,
          application_type: 'tcp',
          ip,
          port,
          edge_id: currentRow.id,
        }),
      {
        successMessage: '添加应用成功',
        errorMessage: '添加应用失败',
        onSuccess: () => {
          // 从列表中移除已添加的应用
          if (scanTask) {
            setScanTask({
              ...scanTask,
              applications: scanTask.applications.filter((a) => a !== appStr),
            });
          }
        },
      },
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    message.success('已复制到剪贴板');
  };

  const columns: ProColumns<API.Edge>[] = [
    {
      title: '连接器名称',
      dataIndex: 'name',
      ellipsis: true,
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
      search: false,
    },
    {
      title: '在线状态',
      dataIndex: 'online',
      width: 100,
      search: false,
      valueEnum: {
        1: { text: '在线', status: 'Success' },
        0: { text: '离线', status: 'Default' },
      },
      render: (_, record) => (
        <Badge
          status={record.online === 1 ? 'success' : 'default'}
          text={record.online === 1 ? '在线' : '离线'}
        />
      ),
    },
    {
      title: '运行状态',
      dataIndex: 'status',
      width: 100,
      search: false,
      valueEnum: {
        1: { text: '运行中', status: 'Processing' },
        2: { text: '已停止', status: 'Default' },
      },
      render: (_, record) => (
        <Tag color={record.status === 1 ? 'green' : 'default'}>
          {record.status === 1 ? '运行中' : '已停止'}
        </Tag>
      ),
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
      width: 220,
      render: (_, record) => (
        <Space>
          <a onClick={() => handleDiscoverApps(record)}>
            <SearchOutlined /> 发现应用
          </a>
          <a
            onClick={() => {
              setCurrentRow(record);
              setEditModalVisible(true);
            }}
          >
            <EditOutlined /> 编辑
          </a>
          <Popconfirm
            title="确定要删除这个连接器吗？"
            description="删除后，该连接器关联的所有应用和代理将失效"
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
      <ProTable<API.Edge>
        headerTitle="连接器列表"
        actionRef={actionRef}
        rowKey="id"
        columns={columns}
        request={async (params) => {
          const { current, pageSize, name } = params;
          // 过滤空值，只传有效的搜索参数
          const searchParams: API.EdgeListParams = {
            page: current,
            page_size: pageSize,
          };
          if (name) {
            searchParams.name = name;
          }
          return tableRequest(
            () => getEdgeList(searchParams),
            'edges',
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
            onClick={handleOpenCreateModal}
          >
            新建连接器
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

      {/* 创建连接器 - 步骤表单 */}
      <StepsForm
        onFinish={async () => {
          setCreateModalVisible(false);
          setAccessKeys(undefined);
          actionRef.current?.reload();
          return true;
        }}
        stepsFormRender={(dom, submitter) => (
          <Modal
            title="创建连接器"
            open={createModalVisible}
            onCancel={() => {
              setCreateModalVisible(false);
              setAccessKeys(undefined);
            }}
            footer={submitter}
            width={650}
            destroyOnClose
          >
            {dom}
          </Modal>
        )}
      >
        {/* 步骤1: 填写连接器信息并创建 */}
        <StepsForm.StepForm
          name="create"
          title="创建连接器"
          onFinish={async (values) => {
            try {
              const res = await createEdge({
                name: values.name,
                description: values.description,
              });
              if (res.code === 200 && res.data) {
                setAccessKeys(res.data);
                message.success('连接器创建成功');
                return true;
              }
              message.error(res.message || '创建失败');
              return false;
            } catch {
              message.error('创建失败');
              return false;
            }
          }}
        >
          <ProFormText
            name="name"
            label="连接器名称"
            placeholder="请输入连接器名称"
            rules={[{ required: true, message: '请输入连接器名称' }]}
            extra="名称用于标识这个连接器，建议使用有意义的名称"
          />
          <ProFormTextArea
            name="description"
            label="描述"
            placeholder="请输入连接器描述（可选）"
          />
        </StepsForm.StepForm>

        {/* 步骤2: 显示安装命令 */}
        <StepsForm.StepForm
          name="install"
          title="安装连接器"
          onFinish={async () => {
            return true;
          }}
        >
          {accessKeys ? (
            <>
              <Alert
                message="连接器已创建，请复制下面的安装命令在目标设备上执行"
                type="success"
                showIcon
                icon={<CheckCircleOutlined />}
                className="mb-4"
              />

              <div className="space-y-4">
                <div>
                  <Text strong>Access Key:</Text>
                  <div className="bg-gray-100 p-3 rounded-lg mt-2 flex items-center justify-between">
                    <Text code className="break-all" style={{ flex: 1 }}>
                      {accessKeys.access_key}
                    </Text>
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(accessKeys.access_key)}
                    />
                  </div>
                </div>

                <div>
                  <Text strong>Secret Key:</Text>
                  <div className="bg-gray-100 p-3 rounded-lg mt-2 flex items-center justify-between">
                    <Text code className="break-all" style={{ flex: 1 }}>
                      {accessKeys.secret_key}
                    </Text>
                    <Button
                      type="text"
                      icon={<CopyOutlined />}
                      onClick={() => copyToClipboard(accessKeys.secret_key)}
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <Text strong>安装命令:</Text>
                  <div className="bg-gray-100 p-3 rounded-lg mt-2">
                    <Paragraph
                      copyable
                      className="mb-0 text-sm"
                      style={{ marginBottom: 0, wordBreak: 'break-all' }}
                    >
                      {`curl -sSL http://49.232.250.11:8080/install.sh | bash -s -- --access-key=${accessKeys.access_key} --secret-key=${accessKeys.secret_key}`}
                    </Paragraph>
                  </div>
                </div>

                <Alert
                  message="请妥善保管以上密钥信息，关闭后将无法再次查看"
                  type="warning"
                  showIcon
                  className="mt-4"
                />

                <div className="mt-4 text-gray-500 text-sm">
                  <p>支持的操作系统：Linux (x86_64, arm64)、Windows (x86_64)、macOS (x86_64, arm64)</p>
                </div>
              </div>
            </>
          ) : (
            <Result
              status="error"
              title="未获取到密钥信息"
              subTitle="请返回上一步重新创建"
            />
          )}
        </StepsForm.StepForm>

        {/* 步骤3: 完成 */}
        <StepsForm.StepForm name="done" title="完成">
          <Result
            status="success"
            title="连接器创建成功"
            subTitle="安装完成后，连接器将自动上线。您可以在连接器列表中查看状态。"
            extra={
              <Text type="secondary">
                点击"完成"按钮关闭此窗口
              </Text>
            }
          />
        </StepsForm.StepForm>
      </StepsForm>

      {/* 编辑连接器弹窗 */}
      <ModalForm
        title="编辑连接器"
        open={editModalVisible}
        onOpenChange={setEditModalVisible}
        onFinish={handleEdit}
        initialValues={currentRow}
        modalProps={{ destroyOnClose: true }}
        width={500}
      >
        <ProFormText
          name="name"
          label="连接器名称"
          placeholder="请输入连接器名称"
          rules={[{ required: true, message: '请输入连接器名称' }]}
        />
        <ProFormTextArea
          name="description"
          label="描述"
          placeholder="请输入连接器描述"
        />
      </ModalForm>

      {/* 发现应用抽屉 */}
      <Drawer
        title={`发现应用 - ${currentRow?.name}`}
        width={500}
        open={discoverDrawerVisible}
        onClose={() => setDiscoverDrawerVisible(false)}
        extra={
          <Button
            icon={<ReloadOutlined />}
            onClick={handleRefreshScan}
            loading={scanning}
          >
            刷新
          </Button>
        }
      >
        {scanning ? (
          <div className="text-center py-12">
            <Spin
              indicator={<LoadingOutlined style={{ fontSize: 32 }} spin />}
              tip="正在扫描内网应用..."
            />
          </div>
        ) : scanTask ? (
          <>
            <div className="mb-4">
              <Text type="secondary">
                扫描状态: {scanTask.task_status}
                {scanTask.error && (
                  <Text type="danger" className="ml-2">
                    {scanTask.error}
                  </Text>
                )}
              </Text>
            </div>
            {scanTask.applications && scanTask.applications.length > 0 ? (
              <List
                dataSource={scanTask.applications}
                renderItem={(app) => (
                  <List.Item
                    actions={[
                      <Button
                        key="add"
                        type="link"
                        onClick={() => handleAddDiscoveredApp(app)}
                      >
                        添加
                      </Button>,
                    ]}
                  >
                    <List.Item.Meta
                      title={app}
                      description="发现的内网服务"
                    />
                  </List.Item>
                )}
              />
            ) : (
              <div className="text-center py-12 text-gray-400">
                未发现可用应用
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-400">
            点击刷新开始扫描
          </div>
        )}
      </Drawer>
    </PageContainer>
  );
};

export default ConnectorPage;
