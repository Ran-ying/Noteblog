<template>
	<view class="contentPanel">
		<view class="title" style="cursor: pointer;" @click="$emit('sidebarChange')">
			<view>{{ getName(fileItem.name) }}</view>
		</view>
		<view class="content">
			<view v-if="index"
				style="display: flex; 
				justify-content: center; 
				align-items: center; 
				width: 100%; 
				height: 100%;
				font-size: 2em;">
				Ying, INTP, Programmer
			</view>
			<view v-else class="markdown-content" ref="markdownContent" v-html="fileMarkdown"></view>
		</view>
	</view>
</template>

<script>
	import {
		marked
	} from 'marked';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/default.css'; // 代码高亮样式

	export default {
		props: ['fileItem'],
		data() {
			return {
				fileContent: '',
				fileMarkdown: '',
				index: true,
			};
		},
		mounted() {
			
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
			getName(fullName) {
				if(!fullName) return "";
				return fullName.split(".")[0];
			},
			async getFileContent() {
				try {
					const response = await this.$apiPost(`/config/${this.fileItem.fullPath}`, {});
					this.fileContent = response.toString();
					this.fileMarkdown = this.renderedMarkdown();
					// Markdown 更新后渲染 MathJax

					this.$nextTick(() => {
						this.loadMathJaxCDN();
					});
				} catch (error) {
					console.error('获取文件内容失败:', error);
					this.fileContent = '加载内容出错';
					this.fileMarkdown = this.renderedMarkdown();
				}
			},
			renderedMarkdown() {
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
				return marked(this.fileContent);
			},

			loadMathJaxCDN() {
				// 动态加载 MathJax CDN
				const script = document.createElement('script');
				script.src = `${this.$apiAddress}/config/mathjax/LaTeX.js`;
				script.async = true;
				script.id = 'MathJax-script';
				script.onerror = () => {
					console.error('MathJax CDN 加载失败');
					this.mathJaxError = true;
				};
				script.onload = () => {
					// 配置 MathJax
					window.MathJax = {
						tex: {
							inlineMath: [
								['$', '$'],
								['\\(', '\\)']
							], // 支持 $...$ 和 \(...\)
							displayMath: [
								['$$', '$$'],
								['\\[', '\\]']
							], // 支持 $$...$$ 和 \[...\]
							processEscapes: true // 处理 \$ 转义
						},
						options: {
							skipHtmlTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code'] // 跳过代码块
						}
					};
				};
				document.head.appendChild(script);
			},
		}
	};
</script>

<style scoped>
	.contentPanel {
		height: 100dvh;
		fallback: 100vh; /* 旧浏览器回退 */
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
		height: calc(100dvh - 80px);
		overflow: auto;
	}
	/* 
	.markdown-content * {
		font-family: consola;
	} */

	.markdown-content {
		/* max-width: 800px; */
		margin: 0 auto;
		margin: 0 20px;
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

	/* MathJax 公式样式 */
	.markdown-content :deep(.MathJax) {
		font-size: 1.1em;
		color: #333;
	}

	.markdown-content :deep(.MathJax_Display) {
		margin: 1em 0;
		text-align: center;
	}

	.markdown-content :deep(.MathJax),
	.markdown-content :deep(.MathJax_Display) {
		color: white !important;
		/* 强制公式为白色 */
		font-size: 1.1em;
	}
</style>