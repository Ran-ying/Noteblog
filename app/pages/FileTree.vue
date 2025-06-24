<template>
	<view class="file-tree">
		<ul>
			<!-- 递归渲染文件和文件夹 -->
			<file-item v-for="item in items" :key="item.index" :item="item" :parent-path="''"
				@item-click="handleItemClick" />
		</ul>
	</view>
</template>

<script>
	import FileItem from './FileItem.vue';

	export default {
		name: 'FileTree',
		props: {
			items: {
				type: Array,
				default: () => [],
				validator: (items) => items.every(item => 'index' in item && 'type' in item && 'name' in item)
			}
		},
		emits: ['item-click'],
		components: {
			FileItem
		},
		methods: {
			handleItemClick(item) {
				// console.log('点击了：', item.name, item.type, '路径：', item.fullPath);
				this.$emit('item-click', item);
			}
		}
	}
</script>

<style scoped>
	.file-tree {
		padding: 20px;
	}

	ul {
		list-style: none;
		padding-left: 0px;
		cursor: pointer;
	}
</style>