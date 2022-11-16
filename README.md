<h1 align="center">
  <br>
  <a href="https://github.com/mditor-dev/mditor">
  <img src="./public/icon.png" alt="">
  </a>
  <br>
  Mditor
  <br>
</h1>

<h4 align="center">一款使用<a href="http://electron.atom.io" target="_blank">Electron</a>开发的 Markdown 编辑器桌面应用程序.</h4>

<p align="center">
  <a href="#主要功能">主要功能</a> •
  <a href="#如何使用">如何使用</a> •
  <a href="#下载">下载</a> •
  <a href="#credits">Credits</a> •
  <a href="#license">License</a>
</p>

## 主要功能

- 支持 2 种编辑器模式
  - markdown 模式
    - 在编写 Markdown 文档时，立即查看它们在 HTML 中的样式.
    - 左边编辑右边预览，预览可开启/关闭，可开启/关闭同步滚动功能
  - WYSIWYG - 所见即所得模式
    - 可以像富文本一样直接在实际渲染样式上修改.
    - 可把网页上复制的渲染后的 markdown 直接粘贴自动转为 markdom 文本
    - 支持表格快捷操作
- 支持公共 Markdown 格式的工具栏
- 语法高亮显示
- 深色/浅色/跟随系统 模式
- 同步滚动的大纲
- 支持打开多个窗口
- 支持丰富的快捷键
- 文档格式化功能
- 自动保存功能
- 支持简洁模式
  - 当你能熟练使用 markdown 后，可以打开简洁模式，搭配快捷键，使用极简的编辑器界面，拒绝干扰
- 跨平台
  - Windows, macOS （Linux 需要自己打包）

<video src="./docs/demo.mov" autoplay style="width: 100%;height: auto"> </video>

## 如何使用

要克隆和运行此应用程序，你需要在计算机上安装 Git 和 Node.js（npm 附带）。
然后输入命令

```shell
# Clone 该仓库
$ git clone https://github.com/mditor-dev/mditor

# 进入项目目录
$ cd mditor

# 安装依赖
$ pnpm install

# 运行
$ npm run dev
```

## 下载

你可以下载适用于 Windows 和 macOS 的最新可安装版本 Mditor。

## Credits

此软件使用以下开源软件包：

- electron
- Node.js
- markdown-it
- toast-ui
- vue3
- electron-vite

## License

MIT
