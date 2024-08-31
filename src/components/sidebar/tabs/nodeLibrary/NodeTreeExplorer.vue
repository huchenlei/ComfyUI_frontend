<template>
  <TreeExplorer :root="props.root">
    <template #node="{ node }">
      <NodeTreeNode :node="node.data" />
    </template>
  </TreeExplorer>
</template>

<script setup lang="ts">
import TreeExplorer from '@/components/common/TreeExplorer.vue'
import { ComfyNodeDefImpl } from '@/stores/nodeDefStore'
import type { TreeExplorerNode } from '@/types/treeExplorerTypes'
import NodeTreeNode from './NodeTreeNode.vue'

const props = defineProps<{
  root: TreeExplorerNode<ComfyNodeDefImpl>
}>()
</script>
