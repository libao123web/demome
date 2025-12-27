import { PageContainer } from '@ant-design/pro-components';
import { Button, Card, Col, Row, Typography, Space, Statistic } from 'antd';
import {
  RocketOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  CloudOutlined,
} from '@ant-design/icons';

const { Title, Paragraph } = Typography;

const HomePage: React.FC = () => {
  const features = [
    {
      icon: <RocketOutlined className="text-4xl text-blue-500" />,
      title: '快速开发',
      description: '基于 UmiJS + Vite 构建，享受极速的开发体验和热更新。',
    },
    {
      icon: <ThunderboltOutlined className="text-4xl text-yellow-500" />,
      title: '高性能',
      description: '采用 React 18 + TypeScript，提供卓越的运行时性能。',
    },
    {
      icon: <SafetyOutlined className="text-4xl text-green-500" />,
      title: '类型安全',
      description: 'TypeScript 全面支持，让代码更可靠、更易维护。',
    },
    {
      icon: <CloudOutlined className="text-4xl text-purple-500" />,
      title: '企业级',
      description: '集成 Ant Design Pro，开箱即用的中后台解决方案。',
    },
  ];

  return (
    <PageContainer
      header={{
        title: '',
      }}
    >
      {/* Hero Section - 响应式 */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 sm:p-8 md:p-12 mb-6 md:mb-8 text-white">
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} lg={14}>
            <Title level={1} className="!text-white !mb-4 text-2xl sm:text-3xl md:text-4xl">
              欢迎使用 Demo App 🚀
            </Title>
            <Paragraph className="!text-gray-100 text-sm sm:text-base md:text-lg mb-6">
              这是一个基于 React + TypeScript + UmiJS + Ant Design + Vite + Tailwind CSS
              构建的现代化前端项目模板。支持响应式布局，适配各种设备屏幕。
            </Paragraph>
            <Space wrap className="mt-4">
              <Button type="primary" size="large" className="bg-white !text-blue-600 hover:!text-blue-700 border-white">
                开始使用
              </Button>
              <Button ghost size="large">
                查看文档
              </Button>
            </Space>
          </Col>
          <Col xs={24} lg={10} className="hidden lg:block">
            <div className="flex justify-center items-center h-full">
              <div className="text-9xl">💻</div>
            </div>
          </Col>
        </Row>
      </div>

      {/* Stats Section - 响应式统计卡片 */}
      <Row gutter={[16, 16]} className="mb-6 md:mb-8">
        <Col xs={12} sm={12} md={6}>
          <Card hoverable className="text-center h-full">
            <Statistic
              title="项目数量"
              value={128}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card hoverable className="text-center h-full">
            <Statistic
              title="活跃用户"
              value={2048}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card hoverable className="text-center h-full">
            <Statistic
              title="完成任务"
              value={512}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card hoverable className="text-center h-full">
            <Statistic
              title="系统评分"
              value={98.6}
              precision={1}
              suffix="%"
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Features Section - 响应式功能卡片 */}
      <Title level={3} className="mb-4 md:mb-6 text-center">
        核心特性
      </Title>
      <Row gutter={[16, 16]} className="mb-6 md:mb-8">
        {features.map((feature, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              hoverable
              className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <div className="text-center">
                <div className="mb-4">{feature.icon}</div>
                <Title level={4} className="!mb-2">
                  {feature.title}
                </Title>
                <Paragraph className="text-gray-500 !mb-0 text-sm">
                  {feature.description}
                </Paragraph>
              </div>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Tech Stack Section - 响应式技术栈展示 */}
      <Card className="mb-6 md:mb-8">
        <Title level={3} className="text-center mb-6">
          技术栈
        </Title>
        <Row gutter={[16, 16]} justify="center">
          {[
            { name: 'React', color: 'bg-blue-100 text-blue-600' },
            { name: 'TypeScript', color: 'bg-blue-100 text-blue-700' },
            { name: 'UmiJS', color: 'bg-green-100 text-green-600' },
            { name: 'Ant Design', color: 'bg-red-100 text-red-500' },
            { name: 'Vite', color: 'bg-purple-100 text-purple-600' },
            { name: 'Tailwind CSS', color: 'bg-cyan-100 text-cyan-600' },
          ].map((tech) => (
            <Col key={tech.name}>
              <div
                className={`px-4 py-2 rounded-full font-medium ${tech.color} transition-transform hover:scale-105 cursor-pointer`}
              >
                {tech.name}
              </div>
            </Col>
          ))}
        </Row>
      </Card>

      {/* Footer CTA */}
      <Card className="bg-gray-50 text-center">
        <Title level={4} className="!mb-2">
          准备好开始了吗？
        </Title>
        <Paragraph className="text-gray-500 mb-4">
          立即探索更多功能，构建你的下一个伟大项目。
        </Paragraph>
        <Button type="primary" size="large">
          立即体验
        </Button>
      </Card>
    </PageContainer>
  );
};

export default HomePage;
