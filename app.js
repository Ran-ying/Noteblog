const express = require('express');
const app = express();
const path = require('path');
app.use(express.json({ limit: '50mb' }));
app.use(require('cors')());

let parentPath = "./Notebook"
let config = require(`${parentPath}/config/config.json`);
let userid = config["userid"];

const readYaml = require("./readYaml");

let auth = async (req, res, next) => {
    req.isAuth = false;
    if (req.query["userid"] && req.query["userid"] == userid) {
        req.isAuth = true;
    }
    next();
}

app.use(`/config/getFileList`, auth, async (req, res) => {
    res.send(await readYaml(req.isAuth));
})

// 递归查询路径是否存在
function findPathInFileList(fileList, targetPath, parentPath = '') {
  for (const item of fileList) {
    // 计算当前项的完整路径
    const currentPath = (parentPath ? `${parentPath}/${item.name}` : item.name);

    // console.log(currentPath, targetPath)
    // 如果当前路径匹配目标路径，返回 true
    if (currentPath === targetPath) {
      return true;
    }

    // 如果是文件夹，递归查询其子文件
    if (item.type === 'folder' && item.files && item.files.length) {
      if (findPathInFileList(item.files, targetPath, currentPath)) {
        return true;
      }
    }
  }
  return false;
}

app.use('/config/mathjax', express.static('./mathjax'));

app.use(`/config/`, auth, async (req, res) => {
    // 获取完整的请求路径（包括查询参数）
    const fullPath = req.originalUrl;
    // 获取路径部分（不包括查询参数）
    const path = decodeURI(req.path)
    if(findPathInFileList(await readYaml(false), `${parentPath}${path}`, parentPath) || req.isAuth){
        res.send(require("fs").readFileSync(`${parentPath}${path}`, 'utf-8'));
    }
    else{
        res.status(404).send("No File!");
    }
})

// 指定静态文件夹，这里假设你的静态文件存放在项目根目录下的 'public' 文件夹
app.use('/', express.static('./app/unpackage/dist/build/web/'));

//可选：如果你想让 Express 提供一个特定的静态页面作为入口，如 index.html
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './app/unpackage/dist/build/web/index.html'));
});


// 设置服务器监听端口
const PORT = 14000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});