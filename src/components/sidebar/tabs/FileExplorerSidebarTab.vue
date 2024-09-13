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
const { expandedKeys, toggleNodeOnEvent } = useTreeExpansion()

const handleDelete = (node: RenderedTreeExplorerNode) => {
  userFileStore.deleteFile(node.data)
}

const renameLeafNode = (node: RenderedTreeExplorerNode, newName: string) => {
  const folder = node.data.path.split('/').slice(0, -1).join('/')
  const newPath = folder + '/' + newName
  userFileStore.renameFile(node.data, newPath)
}

const renameFolderNode = (node: RenderedTreeExplorerNode, newName: string) => {
  const oldPath = node.key.replace(/^root\//, '')
  const folder = oldPath.split('/').slice(0, -1).join('/')
  const newPath = folder + '/' + newName
  userFileStore.renameFolder(oldPath, newPath)
}

const handleRename = (node: RenderedTreeExplorerNode, newName: string) => {
  if (node.leaf) {
    renameLeafNode(node, newName)
  } else {
    renameFolderNode(node, newName)
  }
}

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
      droppable: !node.leaf,
      handleDelete,
      handleRename
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
  await userFileStore.syncFiles()
})
</script>
