import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { LoginForm, ProFormText } from '@ant-design/pro-components';
import { history, useModel } from '@umijs/max';
import { message } from 'antd';
import { login } from '@/services/api';
import './index.less';

const Login: React.FC = () => {
  const { setInitialState } = useModel('@@initialState');

  const handleSubmit = async (values: { email: string; password: string }) => {
    try {
      const result = await login(values);
      if (result.code === 200 && result.data?.token) {
        // 保存 token
        localStorage.setItem('token', result.data.token);
        message.success('登录成功！');

        // 更新初始状态
        setInitialState((s) => ({
          ...s,
          currentUser: result.data?.user,
        }));

        // 跳转到首页
        const urlParams = new URL(window.location.href).searchParams;
        history.push(urlParams.get('redirect') || '/');
        return;
      }
      message.error(result.message || '登录失败');
    } catch (error: any) {
      message.error(error?.message || '登录失败，请重试！');
    }
  };

  return (
    <div className="login-container">
      <div className="login-content">
        <div className="login-header">
          <img
            className="login-logo"
            src="https://img.alicdn.com/tfs/TB1YHEpwUT1gK0jSZFhXXaAtVXa-28-27.svg"
            alt="logo"
          />
          <span className="login-title">Swagger</span>
        </div>
        <div className="login-desc">安全、可靠的网络服务</div>
        
        <LoginForm
          contentStyle={{
            minWidth: 280,
            maxWidth: '75vw',
          }}
          submitter={{
            searchConfig: {
              submitText: '登录',
            },
          }}
          onFinish={handleSubmit}
        >
          <ProFormText
            name="email"
            fieldProps={{
              size: 'large',
              prefix: <UserOutlined className="prefixIcon" />,
            }}
            placeholder="邮箱"
            initialValue="default@liaison.local"
            rules={[
              {
                required: true,
                message: '请输入邮箱!',
              },
              {
                type: 'email',
                message: '请输入有效的邮箱地址!',
              },
            ]}
          />
          <ProFormText.Password
            name="password"
            fieldProps={{
              size: 'large',
              prefix: <LockOutlined className="prefixIcon" />,
            }}
            placeholder="密码"
            initialValue="7ZROz5f6N6UxvkNr"
            rules={[
              {
                required: true,
                message: '请输入密码！',
              },
            ]}
          />
        </LoginForm>
        
        <div className="login-footer">
          <p>© 2024 Swagger. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
