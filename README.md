# 同词相遇 · 双人联机网页游戏

## 功能
- 创建 6 位房间号，邀请另一位玩家通过链接加入
- 双方独立提交词语，全部提交后同步揭晓
- 不同词语进入下一轮，相同词语胜利
- 历史记录、重新开始、移动端界面

## 本地运行
安装 Node.js 20 或以上版本，进入本文件夹运行：

```bash
npm install
npm start
```

浏览器打开 http://localhost:3000 。注意本地地址仅本机可用，异地联机需公网部署。

## GitHub + Render 部署
1. 在 GitHub 创建空仓库 `sameword-game`。
2. 解压 ZIP，**上传解压后所有文件和 public 文件夹**到仓库根目录（不要上传 ZIP 本身）。
3. 登录 https://dashboard.render.com ，New > Web Service，连接 GitHub 仓库。
4. Runtime 选择 Node；Build Command 填 `npm install`；Start Command 填 `npm start`；如可用可选择 Free。
5. 等待部署 Live，打开 Render 提供的 https://...onrender.com 网址。
6. 创建房间，点击复制邀请链接，发给另一位玩家即可。

## 注意
- 免费实例可能休眠，首次打开会慢。
- 房间和记录只保存在服务器内存；服务重启后会清空。
- 当前每个房间最多两人，任一玩家离开后房间关闭。
- 请两人分别用自己的设备访问公网网址测试联机。
