<template>
  <div class="tree-leaf" ref="container">
    <div class="leaf-content">
      <slot name="before-label" :node="node">
        <!-- Default slot content for before-label -->
      </slot>
      <span class="leaf-label">
        <slot name="label" :node="node">
          {{ props.node.label }}
        </slot>
      </span>
      <slot name="after-label" :node="node">
        <!-- Default slot content for after-label -->
      </slot>
    </div>
    <slot name="actions" :node="node">
      <!-- Default slot content for actions -->
    </slot>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import type { TreeNode } from 'primevue/treenode'
import { draggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter'

const props = defineProps<{
  node: TreeNode
}>()

const emit = defineEmits<{
  (e: 'dragStart', node: TreeNode): void
  (e: 'dragEnd', node: TreeNode): void
}>()

const container = ref<HTMLElement | null>(null)
let draggableCleanup: () => void

onMounted(() => {
  const treeNodeElement = container.value?.closest(
    '.p-tree-node'
  ) as HTMLElement
  draggableCleanup = draggable({
    element: treeNodeElement,
    getInitialData() {
      return {
        type: 'tree-node',
        data: props.node
      }
    },
    onDragStart: () => emit('dragStart', props.node),
    onDrop: () => emit('dragEnd', props.node)
  })
})

onUnmounted(() => {
  if (draggableCleanup) {
    draggableCleanup()
  }
})
</script>

<style scoped>
.tree-leaf {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.leaf-content {
  display: flex;
  align-items: center;
  flex-grow: 1;
}

.leaf-label {
  margin-left: 0.5rem;
}
</style>
