<template>
  <SidebarTabTemplate :title="$t('sideToolbar.fileExplorer')">
    <template #body>
      <TreeExplorer
        class="file-explorer-tree"
        :roots="renderedRoot.children"
        v-model:expandedKeys="expandedKeys"
        @nodeClick="handleNodeClick"
      >
      </TreeExplorer>
    </template>
  </SidebarTabTemplate>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useUserFileStore } from '@/stores/userFileStore'
import { useTreeExpansion } from '@/hooks/treeHooks'
import SidebarTabTemplate from '@/components/sidebar/tabs/SidebarTabTemplate.vue'
import TreeExplorer from '@/components/common/TreeExplorer.vue'
import type {
  RenderedTreeExplorerNode,
  TreeExplorerNode
} from '@/types/treeExplorerTypes'
import { app } from '@/scripts/app'
import type { TreeNode } from 'primevue/treenode'

const userFileStore = useUserFileStore()
const { expandedKeys, expandNode, toggleNodeOnEvent } = useTreeExpansion()

const renderedRoot = computed<TreeExplorerNode>(() => {
  const fillNodeInfo = (node: TreeNode): TreeExplorerNode => {
    const children = node.children?.map(fillNodeInfo)

    return {
      key: node.key,
      label: node.label,
      leaf: node.leaf,
      data: node.data,
      children,
      draggable: node.leaf,
      droppable: !node.leaf
    }
  }
  return fillNodeInfo(userFileStore.workflowsTree)
})

const handleNodeClick = (node: RenderedTreeExplorerNode, e: MouseEvent) => {
  if (node.leaf) {
    app.handleFile(node.data)
  } else {
    toggleNodeOnEvent(e, node)
  }
}

onMounted(async () => {
  await userFileStore.loadFiles()
})
</script>
