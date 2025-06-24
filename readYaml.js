const fs = require('fs').promises;
const path = require('path');
const yaml = require('js-yaml');

// 目标文件夹路径
const TARGET_DIR = path.join(__dirname, 'Notebook');

// 异步函数：读取 YAML 文件
async function readYamlFile(filePath) {
    try {
        const absolutePath = path.join(TARGET_DIR, filePath);
        
        const fileContent = await fs.readFile(absolutePath, 'utf8');
        const structure = yaml.load(fileContent);
        
        return structure;
    } catch (error) {
        if (path.basename(filePath) === 'ignore.yaml') {
            
            return [];
        }
        console.error(`读取 YAML 文件失败 (${path.basename(filePath)}):`, error.message);
        throw error;
    }
}

// 异步函数：检查文件或文件夹是否存在
async function checkPathExists(filePath) {
    try {
        await fs.access(filePath);
        return true;
    } catch {
        return false;
    }
}

// 异步函数：从 YAML 提取忽略项
function extractIgnoreList(yamlStructure) {
    const ignoreList = [];
    if (!Array.isArray(yamlStructure)) {
        console.warn('ignore.yaml 必须是数组');
        return ignoreList;
    }
    for (const item of yamlStructure) {
        if (typeof item === 'string') {
            ignoreList.push(item);
        } else if (typeof item === 'object' && item !== null) {
            for (const [folderName, subItems] of Object.entries(item)) {
                ignoreList.push(folderName);
                if (Array.isArray(subItems)) {
                    subItems.forEach(subItem => {
                        ignoreList.push(path.join(folderName, subItem));
                    });
                }
            }
        }
    }
    
    return ignoreList;
}

// 异步函数：匹配 YAML 结构并生成 JSON
async function matchStructure(yamlStructure, targetDir, ignoreList = [], level = 0) {
    const result = [];
    if (!Array.isArray(yamlStructure)) {
        console.error('YAML 结构必须是数组');
        return result;
    }
    let index = 0;
    for (const item of yamlStructure) {
        if (typeof item === 'string') {
            const itemPath = path.join(targetDir, item);
            const relativePath = item;
            if (ignoreList.includes(relativePath)) {
                
                index++;
                continue;
            }
            const exists = await checkPathExists(itemPath);
            if (exists) {
                const stats = await fs.stat(itemPath);
                if (stats.isFile()) {
                    
                    result.push({
                        index: index++,
                        type: 'file',
                        name: item
                    });
                } else if (stats.isDirectory()) {
                    
                    result.push({
                        index: index++,
                        type: 'folder',
                        name: item,
                        files: []
                    });
                }
            } else {
                
                index++;
            }
        } else if (typeof item === 'object' && item !== null) {
            for (const [folderName, subItems] of Object.entries(item)) {
                const relativePath = folderName;
                if (ignoreList.includes(relativePath)) {
                    //
                    index++;
                    continue;
                }
                const folderPath = path.join(targetDir, folderName);
                const exists = await checkPathExists(folderPath);
                if (exists) {
                    const stats = await fs.stat(folderPath);
                    if (stats.isDirectory()) {
                        //
                        const matchedSubItems = [];
                        let subIndex = 0;
                        if (Array.isArray(subItems)) {
                            for (const subItem of subItems) {
                                const subRelativePath = path.join(folderName, subItem);
                                if (ignoreList.includes(subItem) || ignoreList.includes(subRelativePath)) {
                                    //
                                    subIndex++;
                                    continue;
                                }
                                const subPath = path.join(folderPath, subItem);
                                if (await checkPathExists(subPath)) {
                                    const subStats = await fs.stat(subPath);
                                    if (subStats.isFile()) {
                                        //
                                        matchedSubItems.push({
                                            index: subIndex++,
                                            type: 'file',
                                            name: subItem
                                        });
                                    } else if (subStats.isDirectory()) {
                                        //
                                        matchedSubItems.push({
                                            index: subIndex++,
                                            type: 'folder',
                                            name: subItem,
                                            files: []
                                        });
                                    }
                                } else {
                                    
                                    subIndex++;
                                }
                            }
                        }
                        result.push({
                            index: index++,
                            type: 'folder',
                            name: folderName,
                            files: matchedSubItems
                        });
                    }
                } else {
                    
                    index++;
                }
            }
        } else {
            console.warn('无效的 YAML 项:', item);
            index++;
        }
    }
    return result;
}

// 异步函数：遍历目标文件夹全部内容
async function getAllContents(targetDir, ignoreList = [], level = 0, parentPath = '') {
    const result = [];
    let index = 0;
    try {
        const items = await fs.readdir(targetDir, { withFileTypes: true });
        for (const item of items) {
            const itemName = item.name;
            const relativePath = path.join(parentPath, itemName);
            if (ignoreList.includes(itemName) || ignoreList.includes(relativePath)) {
                
                index++;
                continue;
            }
            const itemPath = path.join(targetDir, itemName);
            if (item.isFile()) {
                //
                result.push({
                    index: index++,
                    type: 'file',
                    name: itemName
                });
            } else if (item.isDirectory()) {
                //
                const subContents = await getAllContents(itemPath, ignoreList, level + 1, relativePath);
                result.push({
                    index: index++,
                    type: 'folder',
                    name: itemName,
                    files: subContents
                });
            }
        }
    } catch (error) {
        console.error(`遍历文件夹 ${targetDir} 失败:`, error.message);
    }
    return result;
}

// 主函数
async function readYaml(isAuth = false) {
    try {
        
        
        let ignoreList = [];
        if (isAuth) {
            const ignoreStructure = await readYamlFile('config/ignore.yaml');
            ignoreList = extractIgnoreList(ignoreStructure);
        }
        if (isAuth) {
            const targetDirExists = await checkPathExists(TARGET_DIR);
            if (!targetDirExists) {
                throw new Error(`目标文件夹 ${TARGET_DIR} 不存在`);
            }
            const matchedStructure = await getAllContents(TARGET_DIR, ignoreList);
            return matchedStructure;

            const jsonOutput = JSON.stringify(matchedStructure, null, 2);
            
            
            await fs.writeFile(path.join(__dirname, 'matched_structure.json'), jsonOutput);
            
        } else {
            const yamlStructure = await readYamlFile('config/show.yaml');
            const targetDirExists = await checkPathExists(TARGET_DIR);
            if (!targetDirExists) {
                throw new Error(`目标文件夹 ${TARGET_DIR} 不存在`);
            }
            const matchedStructure = await matchStructure(yamlStructure, TARGET_DIR, ignoreList);

            return matchedStructure;

            const jsonOutput = JSON.stringify(matchedStructure, null, 2);
            

            return jsonOutput;
            await fs.writeFile(path.join(__dirname, 'matched_structure.json'), jsonOutput);
            
        }
    } catch (error) {
        console.error('错误:', error.message);
    }
}

// 导出 main 函数
module.exports = readYaml;

// 不再直接调用 main，留给其他文件调用
// main(false); // 移除测试调用