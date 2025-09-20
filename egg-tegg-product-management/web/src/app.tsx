import { ConfigProvider } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import './App.less';

export function rootContainer(container: any) {
  return (
    <ConfigProvider locale={zhCN}>
      {container}
    </ConfigProvider>
  );
}