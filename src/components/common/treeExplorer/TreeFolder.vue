<template>
  <div :class="['tree-folder', { 'can-drop': canDrop }]" ref="container">
    <span class="folder-label">
      <slot name="folder-label" :node="props.node">
        {{ props.node.label }}
      </slot>
    </span>
    <Badge
      v-if="props.node.totalNodes"
      :value="props.node.totalNodes"
      severity="secondary"
      class="leaf-count-badge"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Badge from 'primevue/badge'
import type { TreeNode } from 'primevue/treenode'
import {
  dropTargetForElements,
  draggable
} from '@atlaskit/pragmatic-drag-and-drop/element/adapter'
import type { CanvasDragAndDropData } from '@/types/litegraphTypes'

const props = defineProps<{
  node: TreeNode
}>()

const emit = defineEmits<{
  (e: 'itemDropped', node: TreeNode): void
  (e: 'dragStart', node: TreeNode): void
  (e: 'dragEnd', node: TreeNode): void
}>()

const container = ref<HTMLElement | null>(null)
const canDrop = ref(false)

const treeNodeElement = ref<HTMLElement | null>(null)

let dropTargetCleanup = () => {}
let draggableCleanup = () => {}

onMounted(() => {
  treeNodeElement.value = container.value?.closest(
    '.p-tree-node-content'
  ) as HTMLElement

  dropTargetCleanup = dropTargetForElements({
    element: treeNodeElement.value,
    onDrop: (event) => {
      const dndData = event.source.data as CanvasDragAndDropData
      if (dndData.type === 'add-node') {
        canDrop.value = false
        emit('itemDropped', props.node)
      }
    },
    onDragEnter: (event) => {
      const dndData = event.source.data as CanvasDragAndDropData
      if (dndData.type === 'add-node') {
        canDrop.value = true
      }
    },
    onDragLeave: () => {
      canDrop.value = false
    }
  })

  draggableCleanup = draggable({
    element: treeNodeElement.value,
    getInitialData() {
      return {
        type: 'tree-folder',
        data: props.node
      }
    },
    onDragStart: () => emit('dragStart', props.node),
    onDrop: () => emit('dragEnd', props.node)
  })
})

onUnmounted(() => {
  dropTargetCleanup()
  draggableCleanup()
})
</script>

<style scoped>
.tree-folder {
  display: flex;
  align-items: center;
}

.leaf-count-badge {
  margin-left: 0.5rem;
}
</style>
