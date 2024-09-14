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
import { computed, onMounted, ref } from 'vue'
import { UserFile, useUserFileStore } from '@/stores/userFileStore'
import { useTreeExpansion } from '@/hooks/treeHooks'
import SidebarTabTemplate from '@/components/sidebar/tabs/SidebarTabTemplate.vue'
import TreeExplorer from '@/components/common/TreeExplorer.vue'
import type {
  RenderedTreeExplorerNode,
  TreeExplorerNode
} from '@/types/treeExplorerTypes'
import { app } from '@/scripts/app'
import type { TreeNode } from 'primevue/treenode'
import { useErrorHandling } from '@/hooks/errorHooks'

const userFileStore = useUserFileStore()
const expandedKeys = ref<Record<string, boolean>>({})
const { toggleNodeOnEvent } = useTreeExpansion(expandedKeys)

const handleDelete = (node: RenderedTreeExplorerNode) => {
  userFileStore.deleteFile(node.data)
}

const { wrapWithErrorHandlingAsync } = useErrorHandling()
const handleRename = wrapWithErrorHandlingAsync(
  async (node: RenderedTreeExplorerNode, newName: string) => {
    const oldPath = node.key.replace(/^root\//, '')
    const folder = oldPath.split('/').slice(0, -1).join('/')
    const newPath = folder + '/' + newName
    await userFileStore.renameFolder(oldPath, newPath)
  }
)

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
      handleDelete: node.leaf ? handleDelete : undefined,
      handleRename: node.leaf ? handleRename : undefined
    }
  }
  return fillNodeInfo(userFileStore.workflowsTree)
})

const handleNodeClick = async (
  node: RenderedTreeExplorerNode<UserFile>,
  e: MouseEvent
) => {
  if (node.leaf) {
    const userFile = node.data
    if (!userFile.isOpen) {
      await userFileStore.loadFile(userFile)
    }
    app.loadGraphData(JSON.parse(userFile.content))
  } else {
    toggleNodeOnEvent(e, node)
  }
}

onMounted(async () => {
  await userFileStore.syncFiles()
})
</script>
