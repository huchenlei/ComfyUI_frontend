<template>
  <TreeExplorerTreeNode :node="node">
    <template #label>
      <Tag
        v-if="nodeDef.experimental"
        :value="$t('experimental')"
        severity="primary"
      />
      <Tag
        v-if="nodeDef.deprecated"
        :value="$t('deprecated')"
        severity="danger"
      />
      <span class="node-label">{{ nodeDef.display_name }}</span>
    </template>
    <template #actions>
      <Button
        class="bookmark-button"
        size="small"
        :icon="isBookmarked ? 'pi pi-bookmark-fill' : 'pi pi-bookmark'"
        text
        severity="secondary"
        @click.stop="toggleBookmark"
      />
    </template>
  </TreeExplorerTreeNode>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import { ComfyNodeDefImpl } from '@/stores/nodeDefStore'
import { computed } from 'vue'
import TreeExplorerTreeNode from '@/components/common/treeExplorer/TreeNode.vue'
import type { TreeExplorerNode } from '@/types/treeExplorerTypes'
import { useNodeBookmarkStore } from '@/stores/nodeBookmarkStore'

const nodeBookmarkStore = useNodeBookmarkStore()
const isBookmarked = computed(() =>
  nodeBookmarkStore.isBookmarked(nodeDef.value)
)

const props = defineProps<{
  node: TreeExplorerNode<ComfyNodeDefImpl>
}>()
const nodeDef = computed<ComfyNodeDefImpl>(() => props.node.data)

const toggleBookmark = () => {
  nodeBookmarkStore.toggleBookmark(nodeDef.value)
}
</script>

<style scoped>
.bookmark-button {
  width: unset;
  padding: 0.25rem;
}
</style>
