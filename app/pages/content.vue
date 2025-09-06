<template>
	<view class="contentPanel">
		<view class="title" style="cursor: pointer;" @click="$emit('sidebarChange')">
			<!-- <view>{{ getName(fileItem.name) }}</view> -->
		</view>
		<view class="content">
			<scroll-view
      scroll-y
      :scroll-into-view="scrollTarget">
			<view v-if="index" style="display: flex; 
				justify-content: center; 
				align-items: center; 
				width: 100%; 
				height: 100%;
				font-size: 2em;">
				Ying, INTP, Programmer
			</view>
			<view v-else class="markdown-content" ref="markdownContent" v-html="fileMarkdown"></view>
			</scroll-view>
		</view>
		<TocVue v-show="tocStatus" class="tocVue" @scrollTo="scrollTo" :title="getName(fileItem.name)" :fileTitle="fileTitle"></TocVue>
	</view>
</template>

<script>
	import {
		marked
	} from 'marked';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/default.css'; // 代码高亮样式

	import TocVue from './toc.vue';
	export default {
		props: ['fileItem'],
		components: {
			TocVue,
		},
		data() {
			return {
				fileContent: '',
				fileMarkdown: '',
				fileTitle: '',
				index: true,
				tocStatus: false,
				scrollTarget: '',
			};
		},
		mounted() {
			this.loadMarked();
		},
		watch: {
			fileItem(newVal) {
				console.log(newVal)
				this.index = false;
				if (newVal && newVal.fullPath) {
					this.getFileContent();
				}
			}
		},
		methods: {
			scrollTo(target){
				this.scrollTarget = target;
			},
			getName(fullName) {
				if (!fullName) return "";
				return fullName.split(".")[0];
			},
			async getFileContent() {
				try {
					const response = await this.$apiPost(`/config/${this.fileItem.fullPath}`, {});
					this.fileContent = response.toString();
					const {
						html,
						headings
					} = this.processMarkdown(marked(this.fileContent), 3);
					this.fileMarkdown = html;
					this.fileTitle = headings;
					this.tocStatus = this.fileTitle.length != 0;
					// Markdown 更新后渲染 MathJax

					this.$nextTick(() => {
						this.loadMathJaxCDN();
					});
				} catch (error) {
					console.error('获取文件内容失败:', error);
					this.fileContent = error.message;
					this.fileMarkdown = marked(this.fileContent);
				}
			},
			processMarkdown(htmlContents, maxLevel = 6) {
				maxLevel = Math.min(Math.max(1, parseInt(maxLevel) || 6), 6);

				const headingRegex = new RegExp(`<h([1-${maxLevel}])([^>]*)>([\\s\\S]*?)<\\/h\\1>`, 'gi');
				const usedIds = new Map();
				const headings = [];

				// 替换并收集
				const html = htmlContents.replace(headingRegex, (match, level, attrs, innerHTML) => {
					const title = innerHTML.replace(/<[^>]+>/g, '').trim();

					// 生成安全 id
					let id = title
						.replace(/\s+/g, "-")
						.replace(/[`~!@#$%^&*()+=<>?,./:;"'|\\[\]{}]/g, "");

					// 确保唯一
					if (usedIds.has(id)) {
						const count = usedIds.get(id) + 1;
						usedIds.set(id, count);
						id = `${id}-${count}`;
					} else {
						usedIds.set(id, 1);
					}

					// 收集 headings
					headings.push({
						title,
						level: Number(level),
						target: id
					});

					// 返回带 id 的 h 标签
					return `<h${level} id="${id}"${attrs}>${innerHTML}</h${level}>`;
				});

				// 归一化 level
				if (headings.length > 0) {
					const minLevel = Math.min(...headings.map(h => h.level));
					headings.forEach(h => h.level = h.level - minLevel);
				}

				return {
					html,
					headings
				};
			},


			loadMarked() {

				// 配置 marked
				marked.setOptions({
					highlight: (code, lang) => {
						return lang && hljs.getLanguage(lang) ?
							hljs.highlight(code, {
								language: lang
							}).value :
							hljs.highlightAuto(code).value;
					},
					breaks: true, // 支持换行
					gfm: true // 支持 GitHub Flavored Markdown
				});
				// 自定义 tokenizer 保护 LaTeX 公式
				const tokenizer = {
					// 自定义行内公式规则
					codespan(src) {
						const inlineMatch = src.match(/^\$([^\$]+?)\$/);
						if (inlineMatch) {
							return {
								type: 'text',
								raw: inlineMatch[0],
								text: inlineMatch[0], // 保持原始公式
							};
						}
						return false; // 让 marked 默认处理其他 codespan
					},
					// 自定义块级公式和 math 代码块
					code(src) {
						// 匹配 ```math
						const mathMatch = src.match(/^```math\n([\s\S]*?)\n```$/m);
						if (mathMatch) {
							return {
								type: 'text',
								raw: mathMatch[0],
								text: `<pre class="mathjax-block">${mathMatch[1]}</pre>`,
							};
						}
						// 匹配 $$...$$
						const displayMatch = src.match(/^\$\$([\s\S]+?)\$\$/);
						if (displayMatch) {
							return {
								type: 'text',
								raw: displayMatch[0],
								text: displayMatch[0],
							};
						}
						return false; // 让 marked 默认处理其他代码块
					},
				};

				marked.use({
					tokenizer
				});
			},
			loadMathJaxCDN() {
				  if (window.MathJax && window.MathJax.typesetPromise) {
				    window.MathJax.typesetPromise();
				  }
			},
		}
	};
</script>

<style scoped>
	.tocVue {
		width: 200px;
		height: 100dvh;
		position: absolute;
		z-index: 10;
		right: 0;
	}

	.contentPanel {
		height: 100dvh;
		fallback: 100vh;
		/* 旧浏览器回退 */
		display: grid;
		grid-template-rows: 88px auto;
	}

	.title {
		padding: 48px 16px 16px 40px;
		font-size: 20px;
		height: 24px;
		background-color: #323233;
		/* display: grid;
		grid-template-columns: auto 32px; */
	}

	.content {
		height: calc(100dvh - 88px);
		overflow: auto;
		width: 100%;
	}

	/* .markdown-content * {
		font-family: consola;
	} */

	.markdown-content {
		max-width: 600px;
		margin: 0 auto;
		/* margin: 0 20px; */
		padding: 20px;
		line-height: 1.6;
	}

	/* Markdown 样式 */
	.markdown-content :deep(a) {
		color: #FFF;
	}

	.markdown-content :deep(h1) {
		font-size: 2em;
		border-bottom: 1px solid #eaecef;
		padding-bottom: 0.3em;
	}

	.markdown-content :deep(h2) {
		font-size: 1.5em;
		border-bottom: 1px solid #eaecef;
		padding-bottom: 0.3em;
	}

	.markdown-content :deep(ul),
	.markdown-content :deep(ol) {
		padding-left: 2em;
		margin: 1em 0;
	}

	.markdown-content :deep(pre) {
		background: #f6f8fa;
		padding: 16px;
		border-radius: 6px;
		overflow: auto;
	}

	.markdown-content :deep(code) {
		background: #323233;
		padding: 2px 4px;
		border-radius: 4px;
	}

	.markdown-content :deep(blockquote) {
		border-left: 4px solid #dfe2e5;
		padding: 0 15px;
		color: #6a737d;
		margin: 1em 0;
	}

	.markdown-content :deep(table) {
		border: 1px solid;
		margin: 0 auto;
		border-collapse: collapse;
		/* 确保边框合并，避免双重边框 */
	}

	.markdown-content :deep(th),
	.markdown-content :deep(td) {
		border: 1px solid;
		/* 为每个单元格添加边框 */
		padding: 8px;
		/* 可选：增加内边距以提高可读性 */
	}

	/* MathJax 公式样式 */

	.markdown-content :deep(.MathJax_Display) {
		margin: 1em 0;
		text-align: center;
	}

	.markdown-content :deep(.MathJax),
	.markdown-content :deep(.MathJax_Display) {
		color: white;
		/* 强制公式为白色 */
		font-size: 1.1em;
	}
	
	.markdown-content mark :deep(.MathJax, .MathJax_Display) {
		color: black !important;
	}


	/* 打印页面样式 */
	@media print {
		* {
			color: black !important;
		}

		.tocVue,
		.title {
			display: none;
		}

		.content {
			width: 100% !important;
			overflow: visible !important;
		}

		.markdown-content :deep(.MathJax),
		.markdown-content :deep(.MathJax_Display) {
			color: black !important;
		}
	}
</style>