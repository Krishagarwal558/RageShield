import { useMemo, useState } from "react"
import type { CategoryDefinition, CategoryId } from "~core/types"

interface CategorySearchListProps {
  categories: CategoryDefinition[]
  selected: CategoryId[]
  onToggle: (category: CategoryId) => void
  showDescriptions?: boolean
  maxHeightClassName?: string
}

export function CategorySearchList({
  categories,
  selected,
  onToggle,
  showDescriptions = false,
  maxHeightClassName = "max-h-64"
}: CategorySearchListProps) {
  const [query, setQuery] = useState("")
  const selectedSet = useMemo(() => new Set(selected), [selected])
  const filteredCategories = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    if (!normalizedQuery) {
      return categories
    }

    return categories.filter((category) =>
      [category.label, category.description, category.id].some((value) =>
        value.toLowerCase().includes(normalizedQuery)
      )
    )
  }, [categories, query])

  return (
    <div className="grid gap-2">
      <input
        className="h-10 rounded-lg border border-ink-100 bg-calm-50 px-3 text-sm outline-none focus:border-calm-500 dark:border-ink-700 dark:bg-ink-950"
        type="search"
        value={query}
        placeholder="Search categories"
        onChange={(event) => setQuery(event.currentTarget.value)}
      />
      <div className={`grid gap-2 overflow-auto pr-1 ${maxHeightClassName}`}>
        {filteredCategories.map((category) => (
          <label
            key={category.id}
            className="flex items-start justify-between gap-3 rounded-lg border border-ink-100 bg-calm-50 p-3 text-sm dark:border-ink-700 dark:bg-ink-950"
          >
            <span className="min-w-0">
              <span className="block truncate font-bold">{category.label}</span>
              {showDescriptions && (
                <span className="mt-1 block text-xs leading-5 text-ink-500 dark:text-ink-300">
                  {category.description}
                </span>
              )}
            </span>
            <input
              className="mt-1 h-4 w-4 shrink-0 accent-calm-700"
              type="checkbox"
              checked={selectedSet.has(category.id)}
              onChange={() => onToggle(category.id)}
            />
          </label>
        ))}
      </div>
      {filteredCategories.length === 0 && (
        <p className="m-0 text-xs text-ink-500 dark:text-ink-300">No categories match that search.</p>
      )}
    </div>
  )
}
