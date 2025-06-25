<template>
	<li>
		<view :class="['file-item', item.type === 'folder' ? 'folder' : 'file']" @click="handleClick" @click.stop="toggleExpand">
			<text v-if="item.type === 'folder'" class="toggle-icon">
				{{ expanded ? '📂' : '📂'}} 
			</text>
			<text v-else class="toggle-icon">
				{{ '📄' }}
			</text>
			<!-- //▼'▶' }} -->
			{{ item.name }}
		</view>
		<ul v-if="item.type === 'folder' && item.files.length && expanded">
			<file-item v-for="child in item.files" :key="child.index" :item="child" :parent-path="childPath(child)"
				@item-click="$emit('item-click', $event)" />
		</ul>
	</li>
</template>

<script>
	import {
		ref
	} from 'vue';

	export default {
		name: 'FileItem',
		props: {
			item: {
				type: Object,
				required: true
			},
			parentPath: {
				type: String,
				default: ''
			}
		},
		emits: ['item-click'],
		setup(props, {
			emit
		}) {
			const expanded = ref(false); // 文件夹默认不展开

			const toggleExpand = () => {
				if (props.item.type === 'folder') {
					expanded.value = !expanded.value;
				}
			};

			const childPath = (child) => {
				// 计算子项的父路径
				return props.parentPath ? `${props.parentPath}/${props.item.name}` : props.item.name;
			};

			const handleClick = () => {
				// 计算当前项的完整路径
				const fullPath = props.parentPath ?
					`${props.parentPath}/${props.item.name}` :
					props.item.name;
				// 触发点击事件，包含项和路径
				emit('item-click', {
					...props.item,
					fullPath
				});
			};

			return {
				expanded,
				toggleExpand,
				handleClick,
				childPath
			};
		}
	}
</script>

<style scoped>
	.file-item {
		padding: 0px 0;
		/* font-size: 28rpx; */
		display: flex;
		align-items: center;
		column-gap: 4px;
	}

	.folder {
		font-weight: bold;
		color: #FFF;
	}

	.file {
		color: #FFF;
	}

	.toggle-icon {
		font-size: 16px;
		width: 20px;
		/* width: 0px; */
		margin-right: 0px;
		cursor: pointer;
	}

	ul {
		padding: 0;
		margin-left: 16px;
		list-style: none;
		cursor: pointer;
	}
</style>