[原文链接](https://www.jianshu.com/p/e74047f7cc91)

1. 准备一个 1024 * 1024 的png图片，假设名字为 pic.png
2. 命令行 $ mkdir tmp.iconset，创建一个临时目录存放不同大小的图片
3. 把原图片转为不同大小的图片，并放入上面的临时目录
    ```shell
    # 全部拷贝到命令行回车执行，执行结束之后去tmp.iconset查看十张图片是否生成好
    sips -z 16 16     pic.png --out tmp.iconset/icon_16x16.png
    sips -z 32 32     pic.png --out tmp.iconset/icon_16x16@2x.png
    sips -z 32 32     pic.png --out tmp.iconset/icon_32x32.png
    sips -z 64 64     pic.png --out tmp.iconset/icon_32x32@2x.png
    sips -z 128 128   pic.png --out tmp.iconset/icon_128x128.png
    sips -z 256 256   pic.png --out tmp.iconset/icon_128x128@2x.png
    sips -z 256 256   pic.png --out tmp.iconset/icon_256x256.png
    sips -z 512 512   pic.png --out tmp.iconset/icon_256x256@2x.png
    sips -z 512 512   pic.png --out tmp.iconset/icon_512x512.png
    sips -z 1024 1024   pic.png --out tmp.iconset/icon_512x512@2x.png
    ```
4. 通过iconutil生成icns文件 $ iconutil -c icns tmp.iconset -o Icon.icns，此时你的目录应该有了你想要的 O(∩_∩)O