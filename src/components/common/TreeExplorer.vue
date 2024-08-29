<template>
  <Tree
    class="tree-explorer"
    v-model:expandedKeys="expandedKeys"
    selectionMode="single"
    :value="renderedRoot.children"
    :pt="{
      nodeLabel: 'tree-explorer-node-label',
      nodeContent: ({ props }) => ({
        onClick: (e: MouseEvent) => onNodeContentClick(e, props.node),
        onContextmenu: (e: MouseEvent) => handleContextMenu(props.node, e)
      }),
      nodeToggleButton: () => ({
        onClick: (e: MouseEvent) => {
          e.stopImmediatePropagation()
        }
      })
    }"
  >
    <template #folder="{ node }">
      <TreeFolder :node="node" @itemDropped="handleItemDropped">
        <template #folder-label="{ node }">
          <EditableText
            :modelValue="node.label"
            :isEditing="renameEditingNode?.key === node.key"
            @edit="(newName: string) => handleRename(node, newName)"
          />
        </template>
      </TreeFolder>
    </template>
    <template #node="{ node }">
      <TreeLeaf :node="node.data" />
    </template>
  </Tree>
  <ContextMenu ref="menu" :model="menuItems" />
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import Tree from 'primevue/tree'
import ContextMenu from 'primevue/contextmenu'
import EditableText from '@/components/common/EditableText.vue'
import TreeFolder from '@/components/common/treeExplorer/TreeFolder.vue'
import TreeLeaf from '@/components/common/treeExplorer/TreeLeaf.vue'
import type { TreeNode } from 'primevue/treenode'
import type { MenuItem } from 'primevue/menuitem'
import { useTreeExpansion } from '@/hooks/treeHooks'
import { sortedTree } from '@/utils/treeUtil'

const props = defineProps<{
  root: TreeNode
  alphabeticalSort?: boolean
}>()

const emit = defineEmits<{
  (e: 'nodeClick', node: TreeNode): void
  (e: 'nodeRename', node: TreeNode, newName: string): void
  (e: 'contextMenu', node: TreeNode, event: MouseEvent): void
}>()

const { expandedKeys, expandNode, toggleNodeOnEvent } = useTreeExpansion()

const renderedRoot = computed(() => {
  const root = props.alphabeticalSort ? sortedTree(props.root) : props.root
  return fillNodeInfo(root)
})

const getTreeNodeIcon = (node: TreeNode) => {
  if (node.leaf) {
    return 'pi pi-file'
  }
  const isExpanded = expandedKeys.value[node.key]
  return isExpanded ? 'pi pi-folder-open' : 'pi pi-folder'
}

const fillNodeInfo = (node: TreeNode): TreeNode => {
  const children = node.children?.map(fillNodeInfo)
  return {
    ...node,
    icon: getTreeNodeIcon(node),
    children,
    type: node.leaf ? 'node' : 'folder',
    totalNodes: node.leaf
      ? 1
      : children.reduce((acc, child) => acc + child.totalNodes, 0)
  }
}

const handleItemDropped = (node: TreeNode) => {
  expandedKeys.value[node.key] = true
}

const onNodeContentClick = (e: MouseEvent, node: TreeNode) => {
  if (!node.key) return
  if (node.type === 'folder') {
    toggleNodeOnEvent(e, node)
  } else {
    emit('nodeClick', node)
  }
}

const menu = ref(null)
const menuTargetNode = ref<TreeNode | null>(null)
const renameEditingNode = ref<TreeNode | null>(null)

const menuItems = computed<MenuItem[]>(() => [
  {
    label: 'Rename',
    icon: 'pi pi-file-edit',
    command: () => {
      renameEditingNode.value = menuTargetNode.value
    }
  }
])

const handleContextMenu = (node: TreeNode, e: MouseEvent) => {
  menuTargetNode.value = node
  emit('contextMenu', node, e)
  menu.value?.show(e)
}

const handleRename = (node: TreeNode, newName: string) => {
  emit('nodeRename', node, newName)
  renameEditingNode.value = null
}
</script>

<style scoped>
.tree-explorer-node-label {
  display: flex;
  align-items: center;
  margin-left: var(--p-tree-node-gap);
  flex-grow: 1;
}

/*
 * The following styles are necessary to avoid layout shift when dragging nodes over folders.
 * By setting the position to relative on the parent and using an absolutely positioned pseudo-element,
 * we can create a visual indicator for the drop target without affecting the layout of other elements.
 */
:deep(.p-tree-node-content:has(.tree-folder)) {
  position: relative;
}

:deep(.p-tree-node-content:has(.tree-folder.can-drop))::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border: 1px solid var(--p-content-color);
  pointer-events: none;
}
</style>
