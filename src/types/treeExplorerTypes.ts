export interface TreeExplorerNode<T = any> {
  key: string
  label: string
  children?: TreeExplorerNode<T>[]
  data: T
  leaf: boolean
  icon: string
  type: 'folder' | 'node'
  // Total number of leaves in the subtree
  totalLeaves?: number
}

export type TreeExplorerDragAndDropData<T = any> = {
  type: 'tree-explorer-node'
  data: TreeExplorerNode<T>
}
